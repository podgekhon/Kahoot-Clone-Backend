import { getData, setData } from './dataStore';
import {
  validateToken,
  isUserValid,
  isStringValid,
  isNameLengthValid,
  isNameTaken,
  isValidQuiz,
  random
} from './helperfunction';

import {
  emptyReturn,
  errorMessages,
  quizList,
  quizCreateResponse,
  quizInfo,
} from './interface';

/**
  * Provide a list of all quizzes that are owned by
  * the currently logged in user.
  *
  * @param {string} token - authUserId
  *
  * @return {quizzes : [
  *     {
  *       quizId : integer
  *       name : string
  *     }
  * ]}
*/
export const adminQuizList = (token: string): errorMessages| quizList => {
  const data = getData();
  const tokenValidation = validateToken(token);

  if ('error' in tokenValidation) {
    return { error: tokenValidation.error };
  }
  const authUserId = tokenValidation.authUserId;

  // Find the user based on authUserId
  const user = data.users.find(user => user.userId === authUserId);

  // Check if the user exists
  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  // Find all quizzes owned by the user
  const userQuizzes = data.quizzes
    .filter(quiz => quiz.ownerId === authUserId)
    .map(quiz => ({
      quizId: quiz.quizId,
      name: quiz.name
    }));

  // Return the list of quizzes (empty array if no quizzes found)
  return { quizzes: userQuizzes };
};

/**
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param {string} token - id of authUser
  * @param {string} name - name of new quiz
  * @param {string} description - description of new quiz for logged in user
  *
  * @returns {integer} - id of quiz
*/
export const adminQuizCreate = (
  token: string,
  name: string,
  description: string
): quizCreateResponse | errorMessages => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token);
  if ('error' in tokenValidation) {
    return { error: tokenValidation.error };
  }
  const authUserId = tokenValidation.authUserId;

  // checks if user is valid
  if (!isUserValid(authUserId)) {
    // if user not valid, return error
    return { error: 'AuthUserId is not a valid user.' };
  }

  // checks for name length
  if (isNameLengthValid(name) !== undefined) {
    return isNameLengthValid(name);
  }

  // checks if check contains invalid characters
  if (!isStringValid(name)) {
    return {
      error: 'Name contains invalid characters.' +
             'Valid characters are alphanumeric and spaces.'
    };
  }

  // checks for description is more than 100 characters
  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length.' };
  }

  // checks if quiz name is already used by another quiz the same user owns
  if (isNameTaken(authUserId, name)) {
    return {
      error: 'Name is already used by the' +
      ' current logged in user for another quiz.'
    };
  }

  // push new quiz object into db & return quizId
  const newQuiz = {
    quizId: random(500),
    ownerId: authUserId,
    name: name,
    description: description,
    question: {},
    timeCreated: Math.floor(Date.now()),
    timeLastEdited: Math.floor(Date.now()),
  };

  data.quizzes.push(newQuiz);
  setData(data);
  return { quizId: newQuiz.quizId };
};

/**
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param {string} token - id of authUser
  * @param {integer} quizId - id of quiz
  *
  * @returns {} - empty object
*/
export const adminQuizRemove = (
  token: string,
  quizId: number
): errorMessages | emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token);
  if ('error' in tokenValidation) {
    return { error: tokenValidation.error };
  }
  const authUserId = tokenValidation.authUserId;

  const error = isValidQuiz(authUserId, quizId, data);
  if (error) {
    return error;
  }

  // remove the correct quiz
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const removeQuiz = data.quizzes[quizIndex];
  data.trash.push(removeQuiz);
  data.quizzes.splice(quizIndex, 1);

  setData(data);
  return {};
};

/**
  * Get all of the relevant information about the current quiz.
  *
  * @param {string} token - id of authUser
  * @param {integer} quizId - id of quiz
  *
  * @returns {object} - struct containing info for quiz
*/
export const adminQuizInfo = (token: string, quizId: number): errorMessages | quizInfo => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token);
  if ('error' in tokenValidation) {
    return { error: tokenValidation.error };
  }
  const authUserId = tokenValidation.authUserId;

  // Check if authUserId is valid
  const user = data.users.find(user => user.userId === authUserId);
  if (!user) {
    return { error: 'authUserId is not a valid user.' };
  }

  // Check if quizId refers to a valid quiz
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: 'quizId does not refer to a valid quiz.' };
  }

  // Check if the quiz belongs to the given user
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
};

/**
  * Update the name of the relevant quiz
  *
  * @param {integestringr} token - id of authUser
  * @param {integer} quizId - id of quiz
  * @param {string} name - quiz name
  *
  * @returns {} - empty object
*/
export const adminQuizNameUpdate = (
  token: string,
  quizId: number,
  name: string
): errorMessages | emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token);
  if ('error' in tokenValidation) {
    return { error: tokenValidation.error };
  }
  const authUserId = tokenValidation.authUserId;

  if (!isUserValid(authUserId)) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: 'Quiz ID does not refer to a valid quiz.' };
  }
  if (quiz.ownerId !== authUserId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  // check if name contains invalid characters
  if (!isStringValid(name)) {
    return {
      error: 'Name contains invalid characters.' +
              'Valid characters are alphanumeric and spaces.'
    };
  }
  // checks for name length
  if (isNameLengthValid(name) !== undefined) {
    return isNameLengthValid(name);
  }
  // check if user has duplicate quiz names
  if (isNameTaken(authUserId, name)) {
    return {
      error: 'Name is already used by the current' +
              ' logged in user for another quiz.'
    };
  }

  quiz.name = name;
  // Update timeLastEdited
  quiz.timeLastEdited = Math.floor(Date.now());
  setData(data);
  return { };
};

/**
  * Update the description of the relevant quiz
  *
  * @param {string} token - id of authUser
  * @param {integer} quizId - id of quiz
  * @param {string} description - quiz name
  *
  * @returns {} - empty object
*/
export const adminQuizDescriptionUpdate = (
  token: string,
  quizId: number,
  description: string
): errorMessages | emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token);
  if ('error' in tokenValidation) {
    return { error: 'INVALID_TOKEN' };
  }
  const authUserId = tokenValidation.authUserId;

  // error checkings for invalid userId, quizId
  const error = isValidQuiz(authUserId, quizId, data);
  if (error) {
    return { error: 'INVALID_QUIZ' };
  }

  // new description should be less than 100 characters
  if (description.length > 100) {
    return {
      error: 'DESCRIPTION_TOO_LONG',
    };
  }

  // update description and timeLastEdited
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);
  validQuizId.description = description;
  validQuizId.timeLastEdited = Math.floor(Date.now());

  setData(data);
  return { };
};

/**
 * view the quiz trash
 *
 * @param {string } token - user token
 * @returns {quizList}  - list of quizzes
 */
export const adminTrashList = (token: string): errorMessages | quizList => {
  const data = getData();

  const tokenValidation = validateToken(token);
  if ('error' in tokenValidation) {
    return { error: tokenValidation.error };
  }

  const authUserId = tokenValidation.authUserId;

  const user = data.users.find(user => user.userId === authUserId);
  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  const userTrashQuizzes = data.trash
    .filter(quiz => quiz.ownerId === authUserId)
    .map(quiz => ({
      quizId: quiz.quizId,
      name: quiz.name
    }));

  return { quizzes: userTrashQuizzes };
};

/**
 * restore a quiz from trash
 *
 * @param {number} quizId - quizId
 * @param {string} token - user token
 */

export const adminQuizRestore = (quizId: number, token: string) => {
  const data = getData();

  const tokenValidation = validateToken(token);
  // invalid token
  if ('error' in tokenValidation) {
    return { error: 'INVALID_TOKEN' };
  }

  const authUserId = tokenValidation.authUserId;
  // find quiz in trash
  const quiz = data.trash.find(q => q.quizId === quizId);
  const quizIsActive = data.quizzes.find(q => q.quizId === quizId);
  if (quiz) {
    // not owned by user
    if (quiz.ownerId !== authUserId) {
      return { error: 'user is not the owner of this quiz' };
    }
  }
  // if quiz is not in the trash
  if (!quiz) {
    // quiz doesnt exist
    if (!quizIsActive) {
      return { error: 'quiz doesnt exist' };
    }
    return { error: 'quizId refer to a quiz not currently in the trash' };
  }

  const activeQuiz = data.quizzes.find(q => q.name === quiz.name);
  // quiz name used
  if (activeQuiz) {
    return { error: 'quiz name used by active quiz' };
  }
  // restore the quiz
  data.quizzes.push(quiz);
  // delete the quiz in trash
  const quizIndex = data.trash.findIndex(q => q.quizId === quizId);
  data.trash.splice(quizIndex, 1);

  setData(data);
  return {};
};
