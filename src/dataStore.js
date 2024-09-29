// YOU MAY MODIFY THIS OBJECT BELOW
let data = {
  users: [
    {
      authUserId: 1,
      nameFirst: "Patrick",
      nameLast: "Truong",
      email: "pat@gmail.com",
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
      oldPasswords: ["oldPass123", "olderPass123"],
      currentPassword: "newPass123",
    },
    {
      authUserId: 2,
      nameFirst: "John",
      nameLast: "Doe",
      email: "john@gmail.com",
      numSuccessfulLogins: 5,
      numFailedPasswordsSinceLastLogin: 0,
      oldPasswords: ["johnOldPass1", "johnOldPass2"],
      currentPassword: "johnNewPass",
    },
  ],
  quizzes: [
    {
      quizId: 1,
      ownerId: 1,
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
    {
      quizId: 2,
      ownerId: 2,
      name: "code ",
      description: "this very hard code quiz",
      quiz: [
        {
          question: "What is H2O?",
          answers: ["Water", "Oxygen", "Hydrogen", "Nitrogen"],
        },
        {
          question: "What is the speed of light?",
          answers: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "50,000 km/s"],
        },
      ],
      timeCreated: 2341343123,
      timeLastEdited: 242145231416,
    },
    {
      quizId: 3,
      ownerId: [1, 2],
      name: "history",
      description: "a quiz about world history",
      quiz: [
        {
          question: "Who was the first president of the USA?",
          answers: ["George Washington", "Abraham Lincoln", "John Adams", "Thomas Jefferson"],
        },
        {
          question: "In what year did World War II end?",
          answers: [1945, 1941, 1939, 1950],
        },
      ],
      timeCreated: 3451343124,
      timeLastEdited: 352145231417,
    },
  ],
};


// YOU MAY MODIFY THIS OBJECT ABOVE

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
  let store = getData()
  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

  store.names.pop() // Removes the last name from the names array
  store.names.push('Jake') // Adds 'Jake' to the end of the names array

  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
*/

// Use getData() to access the data
function getData() {
  return data;
}

export { getData };
