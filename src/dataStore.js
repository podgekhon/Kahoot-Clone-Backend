// YOU MAY MODIFY THIS OBJECT BELOW
let data = {
  users: [
    {
      UserId: null,
      nameFirst: '',
      nameLast: '',
      email: '',
      numSuccessfulLogins: null,
      numFailedPasswordsSinceLastLogin: null,
      oldPasswords: [],
      currentPassword: '',
    },
  ],
  quizzes: [
    {
      quizId: null,
      ownerId: null,
      name: '',
      description: '',
      quiz: {
        question: '',
        answers: [],
      },
      timeCreated: null,
      timeLastEdited: null,
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
