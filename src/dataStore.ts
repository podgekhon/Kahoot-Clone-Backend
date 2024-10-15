import fs from 'fs';

// YOU MAY MODIFY THIS OBJECT BELOW
let data: dataStore = {
  users: [],
  quizzes: [],
  sessions: []
};

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

function setData(newData: dataStore) {
  const updateData = JSON.stringify(newData);
  fs.writeFileSync('./dataStore.json', updateData);
  data = newData;
}

export { getData, setData };
