import { getData, setData } from './dataStore';
/**
  * Reset the state of the application back to the start.
  *
  * No parameters
  *
  * @returns {} - empty object
*/
export const clear = () => {
  const data = getData();

  // Reset the users array
  data.users = [];

  // Reset the quizzes array
  data.quizzes = [];
  data.sessions = [];
  data.trash = [];
  data.players = [];
  data.sessioninfo = [];
  setData(data);
  return {};
};
