import { getData, setData } from './dataStore';
import {
  generateRandomColour,
  validateToken,
  isUserValid,
  isStringValid,
  isNameLengthValid,
  isNameTaken,
  isValidQuiz,
  isValidQuestion,
  validateAnswers,
  random
} from './helperfunction';

import {
  emptyReturn,
  errorMessages,
  quizList,
  quizCreateResponse,
  quizQuestionCreateResponse,
  quizInfo,
  quiz,
  question,
  answerOption
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
  const newQuiz: quiz = {
    quizId: random(500),
    ownerId: authUserId,
    name: name,
    description: description,
    numQuestions: 0,
    questions: [],
    timeCreated: Math.floor(Date.now()),
    timeLastEdited: Math.floor(Date.now()),
    timeLimit: 0
  };

  data.quizzes.push(newQuiz);
  setData(data);
  return { quizId: newQuiz.quizId };
};

export const adminQuizQuestionCreate = (
  quizId: number,
  questionBody: question,
  token: string
): quizQuestionCreateResponse | errorMessages => {
  const data = getData();

  const tokenValidation = validateToken(token);
  if ('error' in tokenValidation) {
    return { error: 'INVALID_TOKEN' };
  }
  const authUserId = tokenValidation.authUserId;

  const quiz = data.quizzes.find((q: quiz) => q.quizId === quizId);
  if (!quiz) {
    return { error: 'INVALID_QUIZ' };
  }

  if (quiz.ownerId !== authUserId) {
    return { error: 'INVALID_OWNER' };
  }

  const validationError = isValidQuestion(questionBody, quiz);
  if (validationError) {
    return validationError;
  }

  const { answerOptions } = questionBody;
  const answerValidationError = validateAnswers(answerOptions);
  if (answerValidationError) {
    return answerValidationError;
  }

  const newQuestion: question = {
    questionId: Math.floor(Math.random() * 1000000),
    question: questionBody.question,
    timeLimit: questionBody.timeLimit,
    points: questionBody.points,
    answerOptions: questionBody.answerOptions.map((answer: answerOption) => ({
      answerId: Math.floor(Math.random() * 1000000),
      answer: answer.answer,
      colour: generateRandomColour(),
      correct: answer.correct
    }))
  };

  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = quiz.timeCreated;

  setData(data);

  return { questionId: newQuestion.questionId };
};

export const adminQuizQuestionUpdate = (
  quizId: number,
  questionId: number,
  updatedQuestionBody: question,
  token: string
): emptyReturn | errorMessages => {
  const data = getData();

  const tokenValidation = validateToken(token);
  if ('error' in tokenValidation) {
    return { error: 'INVALID_TOKEN' };
  }
  const authUserId = tokenValidation.authUserId;

  const quiz = data.quizzes.find((q: quiz) => q.quizId === quizId);
  if (!quiz) {
    return { error: 'INVALID_QUIZ' };
  }

  if (quiz.ownerId !== authUserId) {
    return { error: 'INVALID_OWNER' };
  }

  const questionToUpdate = quiz.questions.find((q: question) => q.questionId === questionId);
  if (!questionToUpdate) {
    return { error: 'INVALID_QUESTION_ID' };
  }

  const validationError = isValidQuestion(updatedQuestionBody, quiz);
  if (validationError) {
    return validationError;
  }

  const { answerOptions } = updatedQuestionBody;
  const answerValidationError = validateAnswers(answerOptions);
  if (answerValidationError) {
    return answerValidationError;
  }

  // Update question details
  questionToUpdate.question = updatedQuestionBody.question;
  questionToUpdate.timeLimit = updatedQuestionBody.timeLimit;
  questionToUpdate.points = updatedQuestionBody.points;
  questionToUpdate.answerOptions = updatedQuestionBody.answerOptions.map(
    (answer: answerOption) => (
      {
        answerId: Math.floor(Math.random() * 1000000),
        answer: answer.answer,
        colour: generateRandomColour(),
        correct: answer.correct
      }
    )
  );

  quiz.timeLastEdited = Math.floor(Date.now());
  setData(data);

  return { };
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
  removeQuiz.timeLastEdited = Math.floor(Date.now());
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
  quiz.timeLastEdited = Math.floor(Date.now());
  data.quizzes.push(quiz);
  // delete the quiz in trash
  const quizIndex = data.trash.findIndex(q => q.quizId === quizId);
  data.trash.splice(quizIndex, 1);

  setData(data);
  return {};
};


export const adminQuizQuestionRemove = (
  quizId: number,
  questionId: number,
  token: string
): emptyReturn | errorMessages => {
  const data = getData();

  // Token is empty or invalid (does not refer to valid logged in user session)
  const tokenValidation = validateToken(token);
  if ('error' in tokenValidation) {
    return { error: 'token is empty or invalid' };
  }
  const authUserId = tokenValidation.authUserId;

  //  Valid token is provided, but user is not an owner of this quiz or quiz doesn't exist
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    return { error: 'quiz or question doesn\'t exist' };
  }

  if (quiz.ownerId !== authUserId) {
    return { error: 'user is not the owner of this quiz' };
  }

  // Question Id does not refer to a valid question within this quiz
  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === -1) {
    return { error: 'Question Id does not refer to a valid question' };
  }

  quiz.questions.splice(questionIndex, 1);
  quiz.numQuestions--;
  quiz.timeLastEdited = Math.floor(Date.now());

  setData(data);
  return {};
};