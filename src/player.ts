import { getData, setData } from './dataStore';
import {
  isStringValid,
  generateRandomName
} from './helperFunctions';

import {
  emptyReturn,
  messageBody,
  playerId,
  quizSession,
  PlayerState,
  quiz,
  messageList
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
