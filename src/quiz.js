import {getData} from "./dataStore.js"
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
export const adminQuizList = ( authUserId  ) => {
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
export const adminQuizRemove = (authUserId, quizId) => {
  const data = getData();
  const error = isValidQuiz(authUserId, quizId, data);
  if (error) {
    return error;
  }  

  // remove the correct quiz
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);
  data.quizzes.splice(validQuizId, 1);

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
export const adminQuizInfo = (authUserId, quizId) => {
  const data = getData();

  // Check if authUserId is valid
  const user = data.users.find(user => user.authUserId === authUserId);
  if (!user) {
    return { error: 'authUserId is not a valid user.' };
  }

  // Check if quizId refers to a valid quiz
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: 'quizId does not refer to a valid quiz.' };
  }

  // Check if the quiz belongs to the given user
  // Assuming each quiz has an ownerId field to track ownership
  if (quiz.ownerId !== authUserId) {  
    return { error: 'quizId does not refer to a quiz that this user owns.' };
  }

  // Return the quiz information
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
  };
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
export const adminQuizNameUpdate = (authUserId, quizId, name) => {
  return { }
}


/**
  * Update the description of the relevant quiz
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * @param {string} description - quiz name
  * 
  * @returns {} - empty object
*/
export const adminQuizDescriptionUpdate = (authUserId, quizId, description) => {
  const data = getData();
  // error checkings for invalid userId, quizId
  const error = isValidQuiz(authUserId, quizId, data);
  if (error) {
    return error;
  }
  // new description should be less then 100 characters
  if(description.length > 100) {
    return { error: 'Description too long! (has to be less then 100 characters)'};
  }
  // update description
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);
  validQuizId.description = description;
  return { }
}


const isValidQuiz = (authUserId, quizId, data) => {
  const validUserId = data.users.find(user => user.UserId === authUserId);
  const validQuizId = data.quizzes.find(quiz => quiz.Id === quizId);
  const validOwnerId = data.quizzes.find(quiz => quiz.ownerId === authUserId);
  
  // check invalid user id
  if (!validUserId) {
    return { error: 'AuthUserId is not valid.' };
  } else if (!validQuizId) {
    // invalid quiz id
    return { error: 'QuizID does not refer to a valid quiz.' };
  } else if (!validOwnerId) {
    // quiz id does not refer to it's owner
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }
  return null;
}