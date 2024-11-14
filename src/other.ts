import { getData, setData } from './dataStore';
import { timers } from './quiz';
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

  // clears timers
  for (const key of Object.keys(timers)) {
    clearTimeout(timers[Number(key)]);
  }
  setData(data);
  return {};
};
