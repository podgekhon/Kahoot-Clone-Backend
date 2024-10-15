/// ///////////// interface for dataStore /////////////////
export interface dataStore {
    users: user[],
    quizzes: quiz[],
    sessions: token[];
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

export interface quiz {
    quizId: number,
    ownerId: number,
    name: string,
    description: string,
    question: object
    timeCreated: number,
    timeLastEdited: number,
  }

export interface token {
    sessionId: number;
    userId: number;
  }

export interface question {
token: string,
questionBody: {
question: string,
timelimit: number,
points: number,
answerOptions: answers[]
}
}

interface answers {
answer: string,
correct: boolean
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

export interface quizInfo {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
}
