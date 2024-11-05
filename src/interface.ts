/// ///////////// interface for dataStore /////////////////
import { adminAuthRegister, adminAuthLogin } from './auth';
import {
  adminQuizCreate,
  adminQuizList,
  adminQuizQuestionCreate,
  adminQuizTransfer,
  adminTrashList,
  quizState,
  adminStartQuizSession
} from './quiz';
export interface dataStore {
  users: user[],
  quizzes: quiz[],
  sessions: token[];
  trash: quiz[];
  players: player[];
  sessioninfo: quizSession[];
}

export interface player {
  playerId: number,
  playerName: string,
  sessionId: number
}

export interface user {
  userId: number,
  nameFirst: string,
  nameLast: string,
  name: string,
  email: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
  oldPasswords: string[],
  currentPassword: string,
}

export interface answerOption {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface question {
  questionId: number;
  question: string;
  timeLimit: number;
  points: number;
  answerOptions: answerOption[];
  thumbnailUrl?: string;
}

export interface quiz {
  quizId: number;
  ownerId: number;
  sessionState: quizState;
  name: string;
  description: string;
  numQuestions: number;
  questions: question[];
  timeCreated: number;
  timeLastEdited: number;
  timeLimit: number;
  // Optional property
  thumbnailUrl?: string;
  activeSessions: quizSession[],
  inactiveSessions: quizSession[]
}

export type quizCopy = Omit<quiz, 'activeSessions' | 'inactiveSessions'>;

export interface quizSession {
  sessionId: number;
  sessionState: quizState;
  quizCopy: quizCopy;
  autoStartNum: number
}

export interface token {
  sessionId: number;
  userId: number;
}

/// /////////////// interface for auth.ts/////////////////////

export interface errorMessages {
  error: string,
}

export interface tokenReturn {
  token: string,
}

export interface userDetails {
  user: {
  userId: number,
  name: string,
  email: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
}
}
export interface authLoginResponse {
  body: ReturnType<typeof adminAuthLogin>;
  statusCode: number;
}

export interface emptyReturn {}

/// /////////// interface for quiz.ts //////////////////
export interface quizList {
  quizzes: {
    quizId: number,
    name: string,
  }[]
}

export interface quizCreateResponse {
  quizId: number,
}

export interface quizStartSessionResponse {
  sessionId: number,
}

export interface quizQuestionCreateResponse {
  questionId: number,
}

export interface quizQuestionDuplicateResponse {
  duplicatedQuestionId: number,
}

export interface viewQuizSessionsResponse {
  activeSessions: number[],
  inactiveSessions: number[]
}

export interface quizInfo {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: question[],
  timeLimit: number
  // Optional property
  thumbnailUrl?: string;
}

export interface quizDuplicateResponse {
  duplicatedquestionId: number,
}

export interface quizTransfer {
  body: ReturnType<typeof adminQuizTransfer>;
  statusCode: number;
}

export interface userAuthRegister {
  body: ReturnType<typeof adminAuthRegister>;
  statusCode: number;
}

export interface quizCreate {
  body: ReturnType<typeof adminQuizCreate>;
  statusCode: number;
}

export interface quizListResponse {
  body: ReturnType<typeof adminQuizList>;
  statusCode: number;
}

export interface trashList {
  body: ReturnType<typeof adminTrashList>;
  statusCode: number;
}

export interface questionCreate {
  body: ReturnType<typeof adminQuizQuestionCreate>;
  statusCode: number;
}

export interface startSession {
  body: ReturnType<typeof adminStartQuizSession>;
  statusCode: number; // this might be a copy of quizStartSessionResponse
}
export interface playerId {
  playerId: number;
}
