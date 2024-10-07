import { getData } from './dataStore.js';
/**
  * Reset the state of the application back to the start.
  * 
  * No parameters
  * 
  * @returns {} - empty object
*/
export const clear = () => {
  let data = getData();
  
  // Reset the users array
  data.users = [];

  // Reset the quizzes array
  data.quizzes = [];

  return {};
};

  