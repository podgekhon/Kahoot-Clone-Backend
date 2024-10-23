import fs from 'fs';
import { dataStore } from './interface';

// YOU MAY MODIFY THIS OBJECT BELOW
let data: dataStore = {
  users: [],
  quizzes: [],
  sessions: [],
  trash: []
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
  const fp = __dirname + '/dataStore.json';
  if (fs.existsSync(fp)) {
    const dataStoreBuffer = fs.readFileSync(fp);
    const jsonStr = String(dataStoreBuffer);
    data = JSON.parse(jsonStr);
  }
  return data;
}

function setData(newData: dataStore) {
  const updateData = JSON.stringify(newData);
  fs.writeFileSync('./dataStore.json', updateData);
  data = newData;
}

export { getData, setData };
