```javascript
let data = {
  // TODO: insert your data structure that contains
  // users + quizzes here
  //educated guesses for variables
  users: [
    {
      userId: 2,
      nameFirst: "Patrick",
      nameLast: "Truong",
      email: "pat@gmail.com",
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
      oldPasswords: ["oldPass123", "olderPass123"],
      currentPassword: "newPass123",
    },
  ],
  quizzes: [
    {
      quizId: number;
      ownerId: number;
      atQuestion?: number;
      sessionState: quizState;
      name: string;
      description: string;
      numQuestions: number;
      questions: [
        {
          questionId: number;
          question: string;
          timeLimit: number;
          points: number;
          answerOptions: [
            {
              answerId: number;
              answer: string;
              colour: string;
              correct: boolean;
            }
          ]
          answerSubmissions?: [
            {
              answerIds: number[];
              playerId: number;
            }
          ]
          thumbnailUrl?: string;
        },
      ]
      timeCreated: number;
      timeLastEdited: number;
      timeLimit: number;
      // Optional property
      thumbnailUrl?: string;
      activeSessions: [
        {
          sessionId: number;
          sessionState: quizState;
          quizCopy: quizCopy;
          autoStartNum: number;
          sessionQuestionPosition: number;
          isCountdownSkipped?: boolean;
          isInLobby?: boolean;
          messages: [
            {
              playerId: number,
              playerName: string,
              messageBody: string,
              timeSent: number
            }
          ]
        }
      ]
      inactiveSessions: quizSession[]
    },
  ],
  sessions: [
    {
      sessionId: 123,
      userId: 2,
    },
    {
      sessionId: 1234,
      userId: 2,
    },
  ],
  players: [
    {
      playerId: number,
      playerName: string,
      sessionId: number,
      state: quizState,
      numQuestions: number,
      atQuestion: number
      score?: number
    },
  ],
};


```

[Optional] short description:

```javascript
let data = {
  // TODO: insert your data structure that contains
  // users + quizzes here
  //educated guesses for variables
  users: [
    {
      userId: 2,
      nameFirst: "Patrick",
      nameLast: "Truong",
      email: "pat@gmail.com",
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
      oldPasswords: ["oldPass123", "olderPass123"],
      currentPassword: "newPass123",
    },
  ],
  quizzes: [
    {
      quizId: 1,
      ownerId: 2,
      sessionState: quizState.END,
      name: "maths",
      description: "this very hard maths quiz",
      quiz: [
        {
          question: "1 + 1 = ?",
          answers: [1, 2, 4, 5],
        },
        {
          question: "1 x 1 = ?",
          answers: [1, 2, 4, 5],
        },
      ],
      timeCreated: 1231343122,
      timeLastEdited: 132145231415,
    },
  ],
  sessions: [
    {
      sessionId: 123,
      userId: 2,
    },
    {
      sessionId: 1234,
      userId: 2,
    },
  ],
  players: [
    {
      playerId: number,
      playerName: string,
      sessionId: number,
    },
  ],
};
```

[Optional] short description:
