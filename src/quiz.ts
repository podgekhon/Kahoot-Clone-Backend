import { getData, setData } from './dataStore';
import {
  validateToken,
  isUserValid,
  isStringValid,
  isNameLengthValid,
  isNameTaken,
  isValidQuiz
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
    quizId: data.quizzes.length,
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
  const removedQuiz = data.quizzes.splice(quizIndex, 1)[0];
  data.trash.push(removedQuiz);
  
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
    return { error: tokenValidation.error };
  }
  const authUserId = tokenValidation.authUserId;

  // error checkings for invalid userId, quizId
  const error = isValidQuiz(authUserId, quizId, data);
  if (error) {
    return error;
  }
  // new description should be less then 100 characters
  if (description.length > 100) {
    return {
      error: 'Description too long!' +
      ' (has to be less then 100 characters)'
    };
  }
  // update description and timeLastEdited
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);
  validQuizId.description = description;
  validQuizId.timeLastEdited = Math.floor(Date.now());

  setData(data);
  return { };
};

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
