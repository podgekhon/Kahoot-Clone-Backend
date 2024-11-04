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
};
```

[Optional] short description:
