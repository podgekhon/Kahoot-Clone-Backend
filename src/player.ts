import { getData, setData } from './dataStore';
import {
  isStringValid,
  generateRandomName
} from './helperFunctions';

import {
  errorMessages,
  playerId,
  quizSession,
  answerSubmission,
  emptyReturn
} from './interface';

export enum quizState {
  LOBBY,
  QUESTION_COUNTDOWN,
  QUESTION_OPEN,
  ANSWER_SHOW,
  FINAL_RESULTS,
  END,
}

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
export const joinPlayer = (sessionId: number, playerName: string): errorMessages | playerId => {
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
export const playerAnswerQuestion = (answerIds: number[], playerId: number, questionPosition: number): errorMessages | emptyReturn => {
  const data = getData();

  // If player ID does not exist
   // const validPlayerId = data.players.find(player => player.playerId === playerId);
  // if (!validPlayerId) {
  //   return { error: "Player ID does not exist" };
  // }
  const player = data.players.find(p => p.playerId === playerId);
  if (!player) {
    throw new Error(`PLAYERID_NOT_EXIST`);
  }

  const session = player.sessionId;
  // if (!session) {
  //   return { error: "Player's session does not exist" };
  // }

  // Find the quiz associated with the session and check the state
  const quiz = data.quizzes.find(q =>
    q.activeSessions.some(as => as.sessionId === session)
  );

  // if (!quiz) {
  //   return { error: "Quiz not found for the session" };
  // }

  // Retrieve quiz session in active sessions
  const quizSession = quiz.activeSessions.find(as => as.sessionId === session);
  // if (!quizSession) {
  //   throw new Error(`SESSION_NOT_ACTIVE`);
  // }

  // Check if the session state is QUESTION_OPEN
  if (quizSession.sessionState !== quizState.QUESTION_OPEN) {
    throw new Error(`SESSION_NOT_OPEN`);
  }

  // If session is not currently on this question
  if (quizSession.sessionQuestionPosition !== questionPosition) {
    throw new Error(`SESSION_NOT_ON_QUESTION`);
  }

  // If question position is not valid for the session this player is in
  if (questionPosition < 1 || questionPosition > quiz.numQuestions) {
    throw new Error(`INVALID_QUESTION_POSITION`);
  }

  const question = quiz.questions[questionPosition - 1];
  // if (!question) {
  //   return { error: "Invalid question position" };
  // }


  // Answer IDs are not valid for this particular question
  const validAnswerIds = new Set(question.answerOptions.map(option => option.answerId));
  for (const answerId of answerIds) {
    if (!validAnswerIds.has(answerId)) {
      throw new Error(`INVALID_ANSWERID`);
    }
  }

  // There are duplicate answer IDs provided
  const uniqueAnswers = new Set(answerIds);
  if (uniqueAnswers.size !== answerIds.length) {
    throw new Error(`DUPLICATE_ANSWERS_SUBMITTED`);
  }

  // Less than 1 answer ID was submitted
  if (answerIds.length < 1) {
    throw new Error(`INVALID_ANSWER_SUBMITTED`);
  }

  // Record the answer submission
  const playerAnswer: answerSubmission = { playerId, answerIds };
  question.answerSubmissions.push(playerAnswer);

  // Update the data store
  setData(data);

  // Return player ID if successful
  return { playerId };
}
