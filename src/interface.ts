//////////////// interface for dataStore /////////////////
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
    quiz: {
      question: string,
      answers: string[],
    },
    timeCreated: number,
    timeLastEdited: number,
  }
  
  export interface token {
    sessionId: number;
    userId: number;
  }



////////////////// interface for auth.ts/////////////////////

export interface errorMessages {
  error: string,
}
  
export interface tokenReturn {
  token: string,
}

export interface userDetails {
	user:
	{
		userId: number,
		name: string,
		email: string,
		numSuccessfulLogins: number,
		numFailedPasswordsSinceLastLogin: number,
	}
}

export interface emptyReturn {}
////////////// interface for quiz.ts //////////////////