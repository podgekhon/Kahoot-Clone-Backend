/// ///////////// interface for dataStore /////////////////
import { adminAuthRegister, adminAuthLogin } from './auth';
import { joinPlayer } from './player';

import {
  adminQuizCreate,
  adminQuizList,
  adminQuizQuestionCreate,
  adminQuizTransfer,
  adminTrashList,
  quizState,
  adminStartQuizSession,
  adminQuizSessionUpdate,
  adminGetFinalResults,
  adminGetFinalResultsCsv
} from './quiz';

export interface dataStore {
  users: user[],
  quizzes: quiz[],
  sessions: token[];
  trash: quiz[];
}

export interface player {
  playerId: number,
  playerName: string,
  sessionId: number,
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
  answerId?: number;
  answer: string;
  colour?: string;
  correct?: boolean;
}

export interface requestHelperReturn {
  body: string;
  statusCode: number;
}
export interface answerSubmission {
  answerIds: number[],
  playerId: number,
  answerTime: number,
}

export interface question {
  questionId?: number;
  question: string;
  timeLimit: number;
  points: number;
  answerOptions: answerOption[];
  answerSubmissions?: answerSubmission[];
  thumbnailUrl?: string;
  playerPerfAtQuestion?: playerPerformance[];
}

export interface playerPerformance {
  playerName: string,
  score: number,
}

export interface answer {
  answerIds: number[];
}

export interface quiz {
  quizId: number;
  ownerId: number;
  atQuestion?: number;
  // sessionState: quizState;
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

/// /////////////// interface for player.ts //////////////////
export type quizCopy = Omit<quiz, 'activeSessions' | 'inactiveSessions'>;

export interface quizSession {
  sessionId: number;
  sessionState: quizState;
  quizCopy: quizCopy;
  autoStartNum: number;
  sessionQuestionPosition: number;
  isCountdownSkipped?: boolean;
  isInLobby?: boolean;
  messages: message[];
  players: PlayerState[];
  questionOpenTime?: number;
}

export interface message {
  playerId: number,
  playerName: string,
  messageBody: string,
  timeSent: number
}

export interface messageList {
  messages: {
    playerId: number,
    playerName: string,
    messageBody: string,
    timeSent: number
  }[]
}
export interface token {
  sessionId: number;
  userId: number;
}

export interface messageBody {
  messageBody: string
}

export interface questionResult {
  questionId: number,
    playersCorrect: string[],
    averageAnswerTime: number,
    percentCorrect: number
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

export interface quizSessionStatusUpdate {
  body: ReturnType<typeof adminQuizSessionUpdate>;
  statusCode: number;
}

export interface GetFinalResults {
  body: ReturnType<typeof adminGetFinalResults> ;
  statusCode: number;
}
export interface sessionState {
  state: quizState;
  atQuestion: number;
  players: string[];
  metadata: {
    quizId: number;
    name: string;
    timeCreated: number;
    timeLastEdited: number;
    description: string;
    numQuestions: number;
    questions: {
      questionId: number;
      question: string;
      timeLimit: number;
      thumbnailUrl: string;
      points: number;
      answerOptions: {
        answerId: number;
        answer: string;
        colour: string;
        correct: boolean;
      }[];
    }[];
    timeLimit: number;
    thumbnailUrl: string;
  };
}

export interface PlayerState {
  playerId?: number,
  sessionId?: number,
  playerName?: string,
  state?: quizState,
  numQuestions?: number,
  atQuestion?: number
  score?: number
}

export interface requestOptions {
  json?: object;
  headers?: Record<string, string>;
  qs?: Record<string, string | number | boolean>;
  timeout: number;
}

export interface playerJoinRes {
  body: ReturnType<typeof joinPlayer>,
  statusCode: number;
}

export interface playerResultsResponse {
  usersRankedByScore: usersRankedByScore[],
  questionResults: {
    questionId: number,
    playersCorrect: string[],
    averageAnswerTime: number,
    percentCorrect: number,
  }[]
}

export interface usersRankedByScore {
  playerName: string,
  score: number
}

export interface GetFinalResultsCsv {
  body: ReturnType<typeof adminGetFinalResultsCsv>;
  statusCode: number;
}

export interface timers {
  [key: number]: ReturnType<typeof setTimeout>;
}
