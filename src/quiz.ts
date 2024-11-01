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
  randomId
} from './helperFunctions';

import {
  emptyReturn,
  errorMessages,
  quizList,
  quizCreateResponse,
  quizQuestionCreateResponse,
  quizQuestionDuplicateResponse,
  quizInfo,
  quiz,
  question,
  answerOption
} from './interface';

/**
  * Provide a list of all quizzes that are owned by
  * the currently logged in user.
  *
  * @param {string} token - a unique session id for user
  *
  * @return {quizList}  - returns list of quizzes if no errors
  * @return {errorMessages} - returns error messages if error
*/
export const adminQuizList = (token: string): errorMessages| quizList => {
  const data = getData();
  const tokenValidation = validateToken(token, data);

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
  * @param {string} token - a unique session id for user
  * @param {string} name - name of new quiz
  * @param {string} description - description of new quiz for logged in user
  *
  * @returns {quizCreateResponse} - returns id of quiz if no errors
  * @returns {errorMessages} - returns error messaeg if error
*/
export const adminQuizCreate = (
  token: string,
  name: string,
  description: string
): quizCreateResponse | errorMessages => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    return { error: 'invalid token' };
  }
  const authUserId = tokenValidation.authUserId;

  // checks if user is valid
  if (!isUserValid(authUserId, data)) {
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
  if (isNameTaken(authUserId, name, data)) {
    return {
      error: 'Name is already used by the' +
      ' current logged in user for another quiz.'
    };
  }

  // push new quiz object into db & return quizId
  const newQuiz: quiz = {
    quizId: randomId(10000),
    ownerId: authUserId,
    name: name,
    description: description,
    numQuestions: 0,
    questions: [],
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    timeLimit: 0
  };

  data.quizzes.push(newQuiz);
  setData(data);
  return { quizId: newQuiz.quizId };
};

/**
  * Create a new stub question for a particular quiz.
  *
  * @param {number} quizId - an unique id of a quiz
  * @param {string} token - a unique session id for user
  * @param {question} questionBody - informatoion of a question
  *
  * @returns {quizQuestionCreateResponse} - returns id of created question
  * @returns {errorMessages} - returns error message if error
*/
export const adminQuizQuestionCreate = (
  quizId: number,
  questionBody: question,
  token: string
): quizQuestionCreateResponse | errorMessages => {
  const data = getData();

  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    throw new Error('INVALID_TOKEN');
  }
  const authUserId = tokenValidation.authUserId;

  const quiz = data.quizzes.find((q: quiz) => q.quizId === quizId);
  if (!quiz) {
    throw new Error('INVALID_QUIZ');
  }

  if (quiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }

  const validationError = isValidQuestion(questionBody, quiz);
  if (validationError) {
    throw new Error(validationError.error);
  }

  const { answerOptions } = questionBody;
  const answerValidationError = validateAnswers(answerOptions);
  if (answerValidationError) {
    throw new Error(answerValidationError.error);
  }

  const newQuestion: question = {
    questionId: randomId(100000),
    question: questionBody.question,
    timeLimit: questionBody.timeLimit,
    points: questionBody.points,
    answerOptions: questionBody.answerOptions.map((answer: answerOption) => ({
      answerId: randomId(100000),
      answer: answer.answer,
      colour: generateRandomColour(),
      correct: answer.correct
    }))
  };

  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = quiz.timeCreated;
  quiz.numQuestions += 1;
  const { timeLimit } = questionBody;
  quiz.timeLimit = quiz.timeLimit + timeLimit;

  setData(data);

  return { questionId: newQuestion.questionId };
};

/**
  * Update the relevant details of a particular question within a quiz.
  *
  * @param {number} quizId - an unique id of a quiz
  * @param {number} questionId - an unique id of a question in quiz
  * @param {string} token - a unique session id for user
  * @param {question} updatedQuestionBody - informatoion of a question
  *
  * @returns {errorMessages} - An object containing an error message if registration fails
  * @returns {emptyReturn} - An empty upon successful registration
*/
export const adminQuizQuestionUpdate = (
  quizId: number,
  questionId: number,
  updatedQuestionBody: question,
  token: string
): emptyReturn | errorMessages => {
  const data = getData();

  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    throw new Error('INVALID_TOKEN');
  }
  const authUserId = tokenValidation.authUserId;

  const quiz = data.quizzes.find((q: quiz) => q.quizId === quizId);
  if (!quiz) {
    throw new Error('INVALID_QUIZ');
  }

  if (quiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }

  const questionToUpdate = quiz.questions.find((q: question) => q.questionId === questionId);
  if (!questionToUpdate) {
    throw new Error('INVALID_QUESTION_ID');
  }

  const validationError = isValidQuestion(updatedQuestionBody, quiz);
  if (validationError) {
    throw new Error(validationError.error);
  }

  const { answerOptions } = updatedQuestionBody;
  const answerValidationError = validateAnswers(answerOptions);
  if (answerValidationError) {
    throw new Error(answerValidationError.error);
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

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

  return { };
};

/**
  * Move a question from one particular position in the quiz to another
  *
  * @param {number} quizId - an unique id of a quiz
  * @param {number} questionId - an unique id of a question in quiz
  * @param {string} token - a unique session id for user
  * @param {number} newPosition - index of a question in the quiz
  *
  * @returns {errorMessages} - An object containing an error message if registration fails
  * @returns {emptyReturn} - An empty upon successful registration
*/
export const adminMoveQuizQuestion = (
  quizId: number,
  questionId: number,
  token: string,
  newPosition: number
): errorMessages | emptyReturn => {
  const data = getData();

  // Validate token
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    throw new Error('INVALID_TOKEN');
  }
  const authUserId = tokenValidation.authUserId;

  const quiz = data.quizzes.find((q: quiz) => q.quizId === quizId);
  if (!quiz) {
    throw new Error('INVALID_QUIZ');
  }

  if (quiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }

  const currentIndex = quiz.questions.findIndex((q) => q.questionId === questionId);
  // findIndex returns -1 if no elements pass the test condition
  if (currentIndex === -1) {
    throw new Error('INVALID_QUESTION_ID');
  }

  if (newPosition < 0 || newPosition >= quiz.numQuestions) {
    throw new Error('INVALID_POSITION');
  }

  if (currentIndex === newPosition) {
    throw new Error('SAME_POSITION');
  }

  const [questionToMove] = quiz.questions.splice(currentIndex, 1);
  quiz.questions.splice(newPosition, 0, questionToMove);

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return {};
};

/**
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param {string} token - a unique session id for user
  * @param {integer} quizId - a unique id of quiz
  *
  * @returns {errorMessages} - An object containing an error message if registration fails
  * @returns {emptyReturn} - An empty upon successful registration
*/
export const adminQuizRemove = (
  token: string,
  quizId: number
): errorMessages | emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    return { error: 'invalid token' };
  }
  const authUserId = tokenValidation.authUserId;

  const error = isValidQuiz(authUserId, quizId, data);
  if (error) {
    return error;
  }

  // remove the correct quiz
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const removeQuiz = data.quizzes[quizIndex];
  removeQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  data.trash.push(removeQuiz);
  data.quizzes.splice(quizIndex, 1);

  setData(data);
  return {};
};

/**
  * Get all of the relevant information about the current quiz.
  *
  * @param {string} token - a unique session id for user
  * @param {integer} quizId - a unique id of quiz
  *
  * @returns {quizInfo} - struct containing info for quiz
  * @returns {errorMessages} - returns error message if error
*/
export const adminQuizInfo = (token: string, quizId: number): errorMessages | quizInfo => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    throw new Error('INVALID_TOKEN');
  }
  const authUserId = tokenValidation.authUserId;

  // Check if quizId refers to a valid quiz
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw new Error('INVALID_QUIZ');
  }

  // Check if the quiz belongs to the given user
  if (quiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }

  // Return the quiz information
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    timeLimit: quiz.timeLimit
  };
};

/**
  * Update the name of the relevant quiz
  *
  * @param {string} token - a unique session id for user
  * @param {number} quizId - id of quiz
  * @param {string} name - quiz name
  *
  * @returns {errorMessages} - An object containing an error message if registration fails
  * @returns {emptyReturn} - An empty upon successful registration
*/
export const adminQuizNameUpdate = (
  token: string,
  quizId: number,
  name: string
): errorMessages | emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    return { error: 'invalid token' };
  }
  const authUserId = tokenValidation.authUserId;

  if (!isUserValid(authUserId, data)) {
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
  if (isNameTaken(authUserId, name, data)) {
    return {
      error: 'Name is already used by the current' +
              ' logged in user for another quiz.'
    };
  }

  quiz.name = name;
  // Update timeLastEdited
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return { };
};

/**
  * Update the description of the relevant quiz
  *
  * @param {string} token - a unique session id for user
  * @param {integer} quizId - a unque id of quiz
  * @param {string} description - deccription of a quiz belonging to a user
  *
  * @returns {errorMessages} - An object containing an error message if registration fails
  * @returns {emptyReturn} - An empty upon successful registration
*/
export const adminQuizDescriptionUpdate = (
  token: string,
  quizId: number,
  description: string
): errorMessages | emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    throw new Error('INVALID_TOKEN');
  }
  const authUserId = tokenValidation.authUserId;

  // error checkings for invalid userId, quizId
  const error = isValidQuiz(authUserId, quizId, data);
  if (error) {
    throw new Error('INVALID_QUIZ');
  }

  // new description should be less than 100 characters
  if (description.length > 100) {
    throw new Error('DESCRIPTION_TOO_LONG');
  }

  // update description and timeLastEdited
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);
  validQuizId.description = description;
  validQuizId.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);
  return { };
};

/**
 * View the quiz trash
 *
 * @param {string} token - a unique session id for user
 *
 * @returns {quizList}  - list of quizzes in trash
 * @returns {errorMessages} - returns error message if error
 */
export const adminTrashList = (token: string): errorMessages | quizList => {
  const data = getData();

  const tokenValidation = validateToken(token, data);
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
 * Restore a quiz from trash
 *
 * @param {number} quizId - an unique id of a quiz
 * @param {string} token - a unique session id for user
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {emptyReturn} - An empty upon successful registration
 */

export const adminQuizRestore = (quizId: number, token: string): errorMessages | emptyReturn => {
  const data = getData();

  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    return { error: 'invalid token' };
  }
  const authUserId = tokenValidation.authUserId;

  // find quiz in trash
  const quiz = data.trash.find(q => q.quizId === quizId);
  const quizIsActive = data.quizzes.find(q => q.quizId === quizId);
  if (quiz) {
    if (quiz.ownerId !== authUserId) {
      return { error: 'user is not the owner of this quiz' };
    }
  }
  // If quiz is not in the trash
  if (!quiz) {
    // quiz doesnt exist
    if (!quizIsActive) {
      return { error: 'quiz doesnt exist' };
    }
    return { error: 'quizId refers to a quiz not currently in the trash' };
  }

  const activeQuiz = data.quizzes.find(q => q.name === quiz.name);
  // Quiz name used
  if (activeQuiz) {
    return { error: 'quiz name used by active quiz' };
  }
  // Restore the quiz
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  data.quizzes.push(quiz);
  // Delete the quiz in trash
  const quizIndex = data.trash.findIndex(q => q.quizId === quizId);
  data.trash.splice(quizIndex, 1);

  setData(data);
  return {};
};

/**
  * Delete a particular question from a quiz
  *
  * @param {number} quizId - an unique id of a quiz
  * @param {number} questionId - an unique id of a question in quiz
  * @param {string} token - a unique session id for user
  *
  * @returns {errorMessages} - An object containing an error message if registration fails
  * @returns {emptyReturn} - An empty upon successful registration
*/
export const adminQuizQuestionRemove = (
  quizId: number,
  questionId: number,
  token: string
): emptyReturn | errorMessages => {
  const data = getData();

  // Token is empty or invalid (does not refer to valid logged in user session)
  const tokenValidation = validateToken(token, data);
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
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);
  return {};
};

/**
  * A particular question gets duplicated to immediately after where the source question is
  *
  * @param {number} quizId - an unique id of a quiz
  * @param {number} questionId - an unique id of a question in quiz
  * @param {string} token - a unique session id for user
  *
  * @returns {quizQuestionDuplicateResponse} - returns an object containing
  * the duplicated quizid if no error
  * @returns {errorMessages} - returns error message if error
*/
export const adminQuizQuestionDuplicate = (
  quizId: number,
  questionId: number,
  token: string
): quizQuestionDuplicateResponse | errorMessages => {
  const data = getData();

  const tokenValidation = validateToken(token, data);
  // invalid token
  if ('error' in tokenValidation) {
    return { error: 'invalid token' };
  }
  const authUserId = tokenValidation.authUserId;

  const validQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!validQuiz) {
    return { error: 'quiz does not exist' };
  }
  if (validQuiz.ownerId !== authUserId) {
    return { error: 'user is not owner of this quiz' };
  }
  const validQuestion = validQuiz.questions.find(q => q.questionId === questionId);
  if (!validQuestion) {
    return { error: 'question Id does not refer to a valid question within this quiz' };
  }
  // get the index of question
  const validQuestionIndex = validQuiz.questions.findIndex(q => q.questionId === questionId);

  const existingQuestionIds = validQuiz.questions.map(q => q.questionId);
  const newQuestionId = Math.max(...existingQuestionIds) + 1;
  // make a copy
  const newQuestion = { ...validQuestion };
  newQuestion.questionId = newQuestionId;
  validQuiz.timeLastEdited = Math.floor(Date.now() / 1000);

  validQuiz.questions.splice(validQuestionIndex + 1, 0, newQuestion);
  validQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  validQuiz.numQuestions += 1;
  // Add the timeLimit of the duplicated question to the quiz
  validQuiz.timeLimit = validQuiz.timeLimit + validQuestion.timeLimit;
  setData(data);
  return { duplicatedQuestionId: newQuestionId };
};

/**
 * Transfer ownership of a quiz to a different user based on their email
 *
 * @param {number} quizId - an unique id of a quiz
 * @param {string} token - a unique session id for user
 * @param {string} userEmail - email of user
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {emptyReturn} - An empty upon successful registration
 */
export const adminQuizTransfer = (
  quizId: number,
  token: string,
  userEmail: string
): errorMessages | emptyReturn => {
  const data = getData();
  const receiver = data.users.find((user) => user.email === userEmail);
  const tokenValidation = validateToken(token, data);
  const transferredQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if ('error' in tokenValidation) {
    return { error: 'INVALID_TOKEN' };
  }
  const senderId = tokenValidation.authUserId;

  // checks if receiver is a real user
  if (!receiver) {
    return { error: 'INVALID_USEREMAIL' };
  }
  const receiverId = receiver.userId;

  // checks if userEmail is the current logged in user
  if (senderId === receiverId) {
    return { error: 'ALREADY_OWNS' };
  }

  // if receiver already has quiz with same name
  if (isNameTaken(receiverId, transferredQuiz.name, data)) {
    return {
      error: 'DUPLICATE_QUIZNAME'
    };
  }

  // if sender does not own quiz
  if (senderId !== transferredQuiz.ownerId) {
    return { error: 'INVALID_OWNER' };
  }

  // update new owner
  transferredQuiz.ownerId = receiverId;
  setData(data);

  return {};
};

/**
 * Permanently delete specific quizzes currently sitting in the trash
 *
 * @param {number[]} quizIds - an array of existing quizIds owned by user
 * @param {string} token - a unique session id for user
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {emptyReturn} - An empty upon successful registration
 */
export const adminTrashEmpty = (token: string, quizIds: number[]): errorMessages | emptyReturn => {
  // Validate inputs
  const data = getData();
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    return { error: tokenValidation.error };
  }
  const authUserId = tokenValidation.authUserId;
  const invalidQuizzes: number[] = [];
  const unauthorizedQuizzes: number[] = [];

  // Check if all quizIds are in the trash and belong to the current user
  for (const quizId of quizIds) {
    const quizInTrash = data.trash.find(quiz => quiz.quizId === quizId);

    if (!quizInTrash) {
      invalidQuizzes.push(quizId);
    } else if (quizInTrash.ownerId !== authUserId) {
      unauthorizedQuizzes.push(quizId);
    }
  }
  // If there are any invalid quizzes, return an error
  if (invalidQuizzes.length > 0) {
    return { error: 'Quiz ID is not in the trash.' };
  }

  // If there are any unauthorized quizzes, return an error
  if (unauthorizedQuizzes.length > 0) {
    return { error: 'Quiz ID does not belong to the current user.' };
  }

  // Remove the valid quizzes from the trash
  data.trash = data.trash.filter(quiz => !quizIds.includes(quiz.quizId));
  setData(data);

  return {};
};
