/// ///////////// interface for dataStore /////////////////
import { adminAuthRegister } from './auth';
import { adminQuizCreate, adminQuizList, adminQuizTransfer } from './quiz';
export interface dataStore {
  users: user[],
  quizzes: quiz[],
  sessions: token[];
  trash: quiz[];
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
}

export interface quiz {
  quizId: number;
  ownerId: number;
  name: string;
  description: string;
  numQuestions: number;
  questions: question[];
  timeCreated: number;
  timeLastEdited: number;
  timeLimit: number;
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

export interface quizQuestionCreateResponse {
  questionId: number,
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
