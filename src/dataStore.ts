import { fstat } from "fs";
import fs from 'fs';

// YOU MAY MODIFY THIS OBJECT BELOW
let data = {
  users: [],
  quizzes: [],
  sessions: []
};


interface dataStore {
  users: [
    {
      userId: number,
      email: string,
      currentPassword: string,
      oldPasswords: [],
      nameFirst: string,
      nameLast: string,
      name: string,
      numSuccessfulLogins: number,
      numFailedPasswordsSinceLastLogin: number,
    },
  ],
  quizzes: [
    {
      quizId: number,
      ownerId: number,
      name: string,
      description: string,
      quiz: 
        {
          question: string,
          answers: [],
        },
      timeCreated: Date,
      timeLastEdited: Date,
    },
  ],
  sessions: [];
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
  fs.writeFileSync('./dataStore.json', updateData, {flag: 'w'});
  data = newData;
}
export { getData, setData };