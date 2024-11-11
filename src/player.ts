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
  question,
  playerResultsResponse,
  questionResult
} from './interface';

import { quizState } from './quiz';
/**
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
    playerId: playerId,
    playerName: playerName,
    sessionId: sessionId,
    atQuestion: 0,
    score: 0,
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
  // const question = quiz.questions[questionPosition - 1];
  const question = quizSession.quizCopy.questions[questionPosition - 1];
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

  const answerTime = (Date.now() - quizSession.questionOpenTime) / 1000;

  // Record the answer submission
  const playerAnswer: answerSubmission = { answerIds, playerId, answerTime };
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
 * @returns {playerResultsResponse} - An object containing the final results for a whole
 * session a player is playing in
 */
export const playerResults = (playerId: number): playerResultsResponse | errorMessages => {
  // Check if the player ID exists in the session data
  const data = getData();
  const player = data.players.find(p => p.playerId === playerId);

  if (!player) {
    throw new Error('PLAYERID_NOT_EXIST');
  }

  // Find the session the player is part of
  let session: quizSession | undefined;
  for (const q of data.quizzes) {
    session = q.activeSessions.find((s) => s.sessionId === player.sessionId);
    if (session) {
      // Exit loop once session is found
      break;
    }
  }
  const sessionId: number = session.sessionId;

  // Check if the session is in the FINAL_RESULTS state
  if (session.sessionState !== quizState.FINAL_RESULTS) {
    throw new Error('SESSION_NOT_IN_FINAL_RESULT');
  }

  // Construct usersRankedByScore array
  const sessionPlayers = data.players
    .filter(player => player.sessionId === sessionId && player.score !== undefined)
    .map(player => ({
      playerName: player.playerName,
      score: player.score
    }));
  // Sort by score in descending order
  const usersRankedByScore = sessionPlayers.sort((a, b) => b.score - a.score);

  const questionResults = session.quizCopy.questions.map(q => {
    // Find the correct answer ID for this question by looking at answerOptions
    const correctAnswerOption = q.answerOptions.find(option => option.correct);
    const correctAnswerId = correctAnswerOption ? correctAnswerOption.answerId : null;

    // Find players who answered correctly
    const playersCorrect = (q.answerSubmissions || [])
      .filter(submission => {
        // Check if this submission includes the correct answer ID
        return correctAnswerId !== null && submission.answerIds.includes(correctAnswerId);
      })
      .map(submission => {
        // Map each submission to the player's name
        const player = data.players.find(p => p.playerId === submission.playerId);
        return player ? player.playerName || '' : '';
      })
      // Sort alphabetically by player name
      .sort((a, b) => a.localeCompare(b));

    // Calculate total and average answer time
    const totalAnswerTime = (q.answerSubmissions || []).reduce((acc, submission) => acc + (
      submission.answerTime || 0), 0);
    const attemptedPlayersCount = q.answerSubmissions ? q.answerSubmissions.length : 0;
    const averageAnswerTime = attemptedPlayersCount > 0
      ? Math.round(totalAnswerTime / attemptedPlayersCount)
      : 0;

    // Calculate percent correct
    const percentCorrect = Math.round((playersCorrect.length / data.players.length) * 100);

    return {
      questionId: q.questionId,
      playersCorrect,
      averageAnswerTime,
      percentCorrect
    };
  });

  return { usersRankedByScore, questionResults };
};

/**
 *
 * @param { number } playerId
 * @param { number } questionPosition
 * @returns
 */
export const playerQuestionResult = (
  playerId: number,
  questionPosition: number
): questionResult => {
  const data = getData();
  const player = data.players.find(p => p.playerId === playerId);

  if (!player) {
    throw new Error('INVALID_PLAYER');
  }

  // Find the session the player is part of
  let session: quizSession | undefined;
  let quiz: quiz | undefined;
  for (const q of data.quizzes) {
    session = q.activeSessions.find((s) => s.sessionId === player.sessionId);
    if (session) {
      quiz = q;
      break;
    }
  }
  const question = session.quizCopy.questions[questionPosition - 1];
  // const question = quiz.questions[questionPosition - 1];
  if (session.sessionState !== quizState.ANSWER_SHOW) {
    throw new Error('SESSION_NOT_IN_ANSWER_SHOW');
  }
  if (questionPosition < 1 || questionPosition > quiz.numQuestions) {
    throw new Error('INVALID_QUESTION_POSITION');
  }
  if (session.sessionQuestionPosition !== questionPosition) {
    throw new Error('SESSION_NOT_ON_QUESTION');
  }
  const correctAnswerOption = question.answerOptions.find(option => option.correct);
  const correctAnswerId = correctAnswerOption ? correctAnswerOption.answerId : null;
  // find players answered correctly
  const playersCorrect = (question.answerSubmissions || [])
    .filter(submission => {
      return correctAnswerId !== null && submission.answerIds.includes(correctAnswerId);
    })
    .map(submission => {
      const player = data.players.find(p => p.playerId === submission.playerId);
      return player ? player.playerName || '' : '';
    })
    .sort((a, b) => a.localeCompare(b));

  // average answer time
  const totalAnswerTime = (question.answerSubmissions || []).reduce(
    (acc, submission) => acc + (submission.answerTime || 0),
    0
  );
  const attemptedPlayersCount = question.answerSubmissions ? question.answerSubmissions.length : 0;
  const averageAnswerTime = attemptedPlayersCount > 0
    ? Math.round(totalAnswerTime / attemptedPlayersCount)
    : 0;

  // percentage of correctness
  const percentCorrect = Math.round((playersCorrect.length / data.players.length) * 100);

  const res = {
    questionId: question.questionId,
    playersCorrect,
    averageAnswerTime,
    percentCorrect
  };

  return res;
};

/**
 *
 * Get the information about a question that the guest player is on.
 *
 * @param {number} playerId - an unique number representing a player
 * @param {number} questionPosition - the position of a question
 *
 * @returns {Error} - An object containing an error message if registration fails
 * @returns {question} - Information about a question
 */
export const playerQuestion = (playerId: number, questionPosition: number): question => {
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

  // Ensure that both quiz and session are found
  if (!session || !quiz) {
    throw new Error('SESSION_IN_END');
  }

  // Check if the session state is valid
  type QuizState = typeof quizState.LOBBY | typeof quizState.QUESTION_COUNTDOWN
  | typeof quizState.FINAL_RESULTS;
  const errorMessages: Record<QuizState, string> = {
    [quizState.LOBBY]: 'SESSION_IN_LOBBY',
    [quizState.QUESTION_COUNTDOWN]: 'SESSION_IN_COUNTDOWN',
    [quizState.FINAL_RESULTS]: 'SESSION_IN_RESULTS'
  };

  if (Object.keys(errorMessages).includes(session.sessionState)) {
    throw new Error(errorMessages[session.sessionState as QuizState]);
  }

  if (session.sessionQuestionPosition !== questionPosition) {
    throw new Error('SESSION_NOT_ON_QUESTION');
  }

  // Validate the question position by using the quiz's questions array length
  if (questionPosition < 1 || questionPosition > quiz.questions.length) {
    throw new Error('INVALID_QUESTION_POSITION');
  }
  // Get the question from the quiz's questions array
  const question = quiz.questions[questionPosition - 1];

  // Construct the response object
  const response: question = {
    questionId: question.questionId,
    question: question.question,
    timeLimit: question.timeLimit,
    points: question.points,
    thumbnailUrl: question.thumbnailUrl,
    answerOptions: question.answerOptions.map(option => ({
      answerId: option.answerId,
      answer: option.answer,
      colour: option.colour
    })),
  };

  return response;
};
