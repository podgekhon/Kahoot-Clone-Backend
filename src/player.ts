import { getData, setData } from './dataStore';
import {
  isStringValid,
  generateRandomName
} from './helperFunctions';

import {
  messageBody,
  playerId,
  quizSession,
  answerSubmission,
  errorMessages,
  emptyReturn,
  PlayerState,
  quiz,
  messageList,
  playerResultsResponse
} from './interface';

import { quizState } from './quiz';
/**
 *
Allow a guest player to join a session
 *
 * @param {number} sessionId - sessionId of the session
 * @param {string} playerName - the name of player
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {playerId} - A Number which is the playerId of player
 */
export const joinPlayer = (sessionId: number, playerName: string): playerId => {
  const data = getData();

  const existingPlayer = data.players.find((player) => player.playerName === playerName);
  if (existingPlayer) {
    throw new Error('EXIST_PLAYERNAME');
  }

  if (playerName.trim() === '') {
    playerName = generateRandomName();
  } else if (!isStringValid(playerName)) {
    throw new Error('INVALID_PLAYERNAME');
  }

  let FindSession: quizSession;
  for (const quiz of data.quizzes) {
    FindSession = quiz.activeSessions.find((session) => session.sessionId === sessionId);
    if (FindSession) break;
  }

  if (!FindSession) {
    throw new Error('INVALID_SESSIONID');
  }
  if (FindSession.sessionState !== quizState.LOBBY) {
    throw new Error('SESSION_NOT_IN_LOBBY');
  }

  const playerId = data.players.length + 1;
  const newPlayer = {
    playerId,
    playerName,
    sessionId,
  };

  data.players.push(newPlayer);
  setData(data);
  return { playerId: playerId };
};

/**
 *
 * Allow the current player to submit answer(s) to the currently active question.
 *
 * @param {number[]} answerIds - an array of answerIds
 * @param {number} playerId - an unique identifier for a player
 * @param {number} questionPosition - an unique identifier for a player
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {emptyReturn} - A Number which is the playerId of player
 */
export const playerAnswerQuestion = (
  answerIds: number[],
  playerId: number,
  questionPosition: number
): errorMessages | emptyReturn => {
  const data = getData();
  // find player
  const player = data.players.find(p => p.playerId === playerId);
  if (!player) {
    throw new Error('PLAYERID_NOT_EXIST');
  }
  // get session of player
  const session = player.sessionId;

  // Find the quiz associated with the session and check the state
  const quiz = data.quizzes.find(q =>
    q.activeSessions.some(as => as.sessionId === session)
  );

  // Retrieve quiz session in active sessions
  const quizSession = quiz.activeSessions.find(as => as.sessionId === session);

  // Check if the session state is QUESTION_OPEN
  if (quizSession.sessionState !== quizState.QUESTION_OPEN) {
    throw new Error('SESSION_NOT_OPEN');
  }

  // If question position is not valid for the session this player is in
  if (questionPosition < 1 || questionPosition > quiz.numQuestions) {
    throw new Error('INVALID_QUESTION_POSITION');
  }

  // If session is not currently on this question
  if (quizSession.sessionQuestionPosition !== questionPosition) {
    throw new Error('SESSION_NOT_ON_QUESTION');
  }

  const question = quiz.questions[questionPosition - 1];

  // Answer IDs are not valid for this particular question
  const validAnswerIds = new Set(question.answerOptions.map(option => option.answerId));
  for (const answerId of answerIds) {
    if (!validAnswerIds.has(answerId)) {
      throw new Error('INVALID_ANSWERID');
    }
  }
  // There are duplicate answer IDs provided
  const uniqueAnswers = new Set(answerIds);
  if (uniqueAnswers.size !== answerIds.length) {
    throw new Error('DUPLICATE_ANSWERS_SUBMITTED');
  }

  // Less than 1 answer ID was submitted
  if (answerIds.length < 1) {
    throw new Error('INVALID_ANSWER_SUBMITTED');
  }

  // Record the answer submission
  const playerAnswer: answerSubmission = { answerIds, playerId };
  if (!question.answerSubmissions) {
    question.answerSubmissions = [];
  }
  question.answerSubmissions.push(playerAnswer);

  const correctAnswerIds = question.answerOptions
    .filter(opt => opt.correct)
    .map(opt => opt.answerId);

  const isCorrect = answerIds.length === correctAnswerIds.length &&
                  answerIds.every(id => correctAnswerIds.includes(id));

  if (isCorrect) {
    const correctSubmissions = question.answerSubmissions.filter(sub =>
      sub.answerIds.length === correctAnswerIds.length &&
    sub.answerIds.every(id => correctAnswerIds.includes(id))
    ).length;

    const scalingFactor = 1 / correctSubmissions;
    const score = Math.round(question.points * scalingFactor);

    const playerState = data.players.find(p => p.playerId === playerId);
    if (playerState) {
      playerState.score = (playerState.score || 0) + score;
    }
  }

  setData(data);

  // Return player ID if successful
  return { };
};

/**
 *
 * @param { number } playerId - playerId to identify which user is sending msgs
 * @param { string } message - player's  msgs to be sent
 * @returns {} - empty object
 */
export const playerMessage = (playerId: number, message: messageBody) : emptyReturn => {
  const data = getData();
  const newMessage = message.messageBody;
  const validPlayer = data.players.find(p => p.playerId === playerId);
  if (!validPlayer) {
    throw new Error('INVALID_PLAYER');
  }
  if (newMessage.length < 1 || newMessage.length > 100) {
    throw new Error('INVALID_MESSAGE_LENGTH');
  }
  const quizSessionId = validPlayer.sessionId;
  const msg = {
    playerId: playerId,
    playerName: validPlayer.playerName,
    messageBody: newMessage,
    timeSent: Math.floor(Date.now() / 1000)
  };
  // find the quiz Session
  let FindSession: quizSession;
  for (const quiz of data.quizzes) {
    FindSession = quiz.activeSessions.find(session => session.sessionId === quizSessionId);
    if (FindSession) break;
  }
  FindSession.messages.push(msg);
  setData(data);
  return {};
};

/**
 *
 * Get the status of a guest player that has already joined a session
 * @param { number } playerId - a unique of a player
 * @returns {PlayerState} - an object containg information of player state
 */
export const playerState = (playerId: number) : PlayerState => {
  const data = getData();

  const player = data.players.find(p => p.playerId === playerId);
  if (!player) {
    throw new Error('INVALID_PLAYER');
  }

  const sessionId = player.sessionId;
  let quiz: quiz;
  let FindSession: quizSession;
  for (const q of data.quizzes) {
    FindSession = q.activeSessions.find((session) => session.sessionId === sessionId);
    if (FindSession) {
      quiz = q;
      break;
    }
  }
  const response: PlayerState = {
    state: FindSession.sessionState,
    numQuestions: quiz.numQuestions,
    atQuestion: quiz.atQuestion
  };

  return response;
};

/**
 *
 * @param { number } playerId
 * @returns
 */
export const playerMessageList = (playerId: number) : messageList => {
  const data = getData();
  // check if player exists
  const validPlayer = data.players.find(p => p.playerId === playerId);
  if (!validPlayer) {
    throw new Error('INVALID_PLAYER');
  }
  const session = validPlayer.sessionId;
  let FindSession: quizSession;
  for (const quiz of data.quizzes) {
    FindSession = quiz.activeSessions.find(s => s.sessionId === session);
    if (FindSession) break;
  }
  const messages = FindSession.messages;

  return { messages };
};



/**
 *
Get the final results for a whole session a player is playing in
 *
 * @param {number} playerId - an unique identifier for a player
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {playerResultsResponse} - An object containing the final results for a whole session a player is playing in
 */
export const playerResults = (playerId: number): playerResultsResponse | errorMessages => {
  // Check if the player ID exists in the session data
  const data = getData();
  const player = data.players.find(p => p.playerId === playerId);

  if (!player) {
    throw new Error('EXIST_PLAYERID');
  }

  // Find the session the player is part of
  let session: quizSession | undefined;
  let quiz: quiz | undefined;
  for (const q of data.quizzes) {
    session = q.activeSessions.find((s) => s.sessionId === player.sessionId);
    if (session) {
      quiz = q;
      // Exit loop once session is found
      break;
    }
  }
  const sessionId: number = session.sessionId;

  // Check if the session is in the FINAL_RESULTS state
  if (session.sessionState !== quizState.FINAL_RESULTS) {
    return { error: "Session is not in FINAL_RESULTS state" };
  }

  // Construct usersRankedByScore array
  const sessionPlayers = data.players
    .filter(player => player.sessionId === sessionId && player.score !== undefined)
    .map(player => ({
      playerName: player.playerName,
      score: player.score
    }));

  const usersRankedByScore = sessionPlayers.sort((a, b) => b.score - a.score);

  const questionResults = quiz.questions.map(q => {
    // Find the correct answer ID for this question by looking at answerOptions
    const correctAnswerOption = q.answerOptions.find(option => option.correct);
    const correctAnswerId = correctAnswerOption ? correctAnswerOption.answerId : null;

    const playersCorrect = (q.answerSubmissions || [])
      .filter(submission => {
        // Find the player associated with this submission
        const player = data.players.find(p => p.playerId === submission.playerId && p.sessionId === session.sessionId);
        // Check if this player's answerIds include the correct answer ID
        return player && correctAnswerId !== null && submission.answerIds.includes(correctAnswerId);
      })
      .map(submission => {
        // Map each submission to the player's name
        const player = data.players.find(p => p.playerId === submission.playerId);
        return player ? player.playerName || '' : '';
      });

    const totalAnswerTime = (q.answerSubmissions || []).reduce((acc, submission) => {
        const player = data.players.find(p => p.playerId === submission.playerId && p.sessionId === session.sessionId);
        const answerTime = player && player.atQuestion === q.questionId ? (player.atQuestion || 0) : 0;
        return acc + answerTime;
    }, 0);

    const averageAnswerTime = playersCorrect.length > 0 ? totalAnswerTime / playersCorrect.length : 0;
    const percentCorrect = (playersCorrect.length / data.players.length) * 100;
    // round percentage to nearest integer
    // const percentCorrect = playersCorrect.length > 0 
    // ? Math.round((playersCorrect.length / data.players.length) * 100) 
    // : 0;

    return {
      questionId: q.questionId,
      playersCorrect,
      averageAnswerTime,
      percentCorrect
    };
  });
return { usersRankedByScore, questionResults };
}