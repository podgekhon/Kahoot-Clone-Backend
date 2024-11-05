import fs from 'fs';
import { dataStore } from './interface';

// YOU MAY MODIFY THIS OBJECT BELOW
let data: dataStore = {
  users: [],
  quizzes: [],
  sessions: [],
  trash: [],
  players: [],
  sessioninfo: []
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

/**
 * get data from the json file
 *
 * @returns {dataStore} data - return whats in the dataStore.json file
 */
function getData() {
  const fp = './dataStore.json';
  if (fs.existsSync(fp)) {
    const dataStoreBuffer = fs.readFileSync(fp);
    const jsonStr = String(dataStoreBuffer);
    data = JSON.parse(jsonStr);
  }
  return data;
}
/**
 * save new data into json file
 *
 * @param {dataStore} newData - newData going to be save into dataStore.json
 */
function setData(newData: dataStore) {
  const updateData = JSON.stringify(newData);
  fs.writeFileSync('./dataStore.json', updateData);
}

export { getData, setData };
