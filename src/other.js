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
  data.users = [
    {
      userId: null,
      nameFirst: '',
      nameLast: '',
      email: '',
      numSuccessfulLogins: null,
      numFailedPasswordsSinceLastLogin: null,
      oldPasswords: [],
      currentPassword: '',
    },
  ];

  // Reset the quizzes array
  data.quizzes = [
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
  ];

  return {};
};

  