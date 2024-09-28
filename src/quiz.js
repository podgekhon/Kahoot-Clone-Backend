import { getData } from './dataStore.js'

/**
  * Provide a list of all quizzes that are owned by 
  * the currently logged in user.
  * 
  * @param {integer} authUserId - authUserId
  * 
  * @return {quizzes : [
  *     {
  *       quizId : integer 
  *       name : string
  *     }
  * ]}
*/
const adminQuizList = ( authUserId  ) => {
  return { quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  }
}
  

/**
  * Given basic details about a new quiz, create one for the logged in user.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {string} name - name of new quiz
  * @param {string} description - description of new quiz for logged in user
  * 
  * @returns {integer} - id of quiz
*/
export const adminQuizCreate = (authUserId, name, description) => {
  return {
    quizId: 2
  }
}


/**
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * 
  * @returns {} - empty object
*/
const adminQuizRemove = (authUserId, quizId) => {
  const data = getData();
  const validUserId = data.users.find(user => user.UserId === authUserId);
  const validQuizId = data.quizzes.find(quiz => quiz.Id === quizId);
  
  // check invalid user id
  if (!validUserId) {
    return { error: 'AuthUserId is not valid.' };
  }
  
  // invalid quiz id
  if (!validQuizId) {
    return { error: 'QuizID does not refer to a valid quiz.' };
  }
  
  // quiz id does not refer to it's owner
  const validOwnerId = data.quizzes.find(ownerId => quizzes.ownerId === authUserId);
  if (!validOwnerId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  // remove the correct quiz
  data.quizzes.splice(validOwnerId, 1);

  // updata dataStor
  setData(data);

  return {};
}


/**
  * Get all of the relevant information about the current quiz.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * 
  * @returns {object} - struct containing info for quiz 
*/
const adminQuizInfo = (authUserId, quizId) => {
  return {
      quizId: 1,
      name: 'My Quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'This is my quiz',
  }
}


/**
  * Update the name of the relevant quiz
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * @param {string} name - quiz name
  * 
  * @returns {} - empty object
*/
const adminQuizNameUpdate = (authUserId, quizId, name) => {
  return { }
}


/**
  * Update the description of the relevant quiz
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * @param {string} name - quiz name
  * 
  * @returns {} - empty object
*/
const adminQuizDescriptionUpdate = (authUserId, quizId, name) => {
  return { }
}