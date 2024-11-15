import { getData, setData } from './dataStore';
import {
  generateRandomColour,
  validateToken,
  isStringValid,
  isNameTaken,
  isValidQuiz,
  isValidQuestion,
  validateAnswers,
  validQuestionThumbnailUrl,
  isSessionEnded,
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
  answerOption,
  quizSession,
  quizStartSessionResponse,
  viewQuizSessionsResponse,
  quizCopy,
  sessionState,
  PlayerState,
} from './interface';

import fs from 'fs';
import path from 'path';

export enum quizState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum adminAction {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

export const timers: { [key: number]: ReturnType<typeof setTimeout> } = {};
/**
 * Update the thumbnail for a specific quiz.
 *
 * @param {number} quizId - unique id for the quiz
 * @param {string} token - session token for the user
 * @param {string} thumbnailUrl - URL of the new thumbnail image
 *
 * @returns {emptyReturn} - Returns an empty object if successful
 */
export const adminQuizUpdateThumbnail = (
  quizId: number,
  token: string,
  thumbnailUrl: string
): emptyReturn => {
  const data = getData();

  const tokenValidation = validateToken(token, data);

  const authUserId = tokenValidation.authUserId;

  const quiz = data.quizzes.find((q) => q.quizId === quizId);
  if (!quiz) {
    throw new Error('INVALID_QUIZ');
  }
  if (quiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }

  const validFileTypes = /\.(jpg|jpeg|png)$/i;
  if (!validFileTypes.test(thumbnailUrl)) {
    throw new Error('INVALID_QUIZ_THUMBNAIL_URL_END');
  }
  if (!thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
    throw new Error('INVALID_QUIZ_THUMBNAIL_URL_START');
  }

  quiz.thumbnailUrl = thumbnailUrl;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return {};
};

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

  // Find the user based on authUserId
  const authUserId = tokenValidation.authUserId;

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
*/
export const adminQuizCreate = (
  token: string,
  name: string,
  description: string
): quizCreateResponse | errorMessages => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);

  const authUserId = tokenValidation.authUserId;

  // checks for name length
  if (name.length < 3 || name.length > 30) {
    throw new Error('INVALID_NAME_LENGTH');
  }

  // checks if check contains invalid characters
  if (!isStringValid(name)) {
    throw new Error('INVALID_QUIZ_NAME');
  }

  // checks for description is more than 100 characters
  if (description.length > 100) {
    throw new Error('DESCRIPTION_TOO_LONG');
  }

  // checks if quiz name is already used by another quiz the same user owns
  if (isNameTaken(authUserId, name, data)) {
    throw new Error('DUPLICATE_QUIZNAME');
  }

  // push new quiz object into db & return quizId
  const newQuiz: quiz = {
    quizId: randomId(10000),
    ownerId: authUserId,
    atQuestion: 1,
    // sessionState: quizState.END,
    name: name,
    description: description,
    numQuestions: 0,
    questions: [],
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    timeLimit: 0,
    activeSessions: [],
    inactiveSessions: []
  };

  data.quizzes.push(newQuiz);
  setData(data);
  return { quizId: newQuiz.quizId };
};

/**
 * Starts a new session for a quiz. Ensures that any edits made while a
 * session is running do not affect the active session.
 *
 * @param {string} token - token of the logged-in user
 * @param {number} quizId - quizId for which a session is to be started.
 * @param {number} autoStartNum - number of sessions to auto-start
 *
 * @returns {quizStartSessionResponse} - returns a new sessionId
 */
export const adminStartQuizSession = (
  token: string,
  quizId: number,
  autoStartNum: number
): quizStartSessionResponse => {
  const data = getData();
  const tokenValidation = validateToken(token, data);

  // Check if the quiz is in trash
  const isQuizInTrash = data.trash.some(q => q.quizId === quizId);
  if (isQuizInTrash) {
    throw new Error('QUIZ_IN_TRASH');
  }

  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz || quiz.ownerId !== tokenValidation.authUserId) {
    throw new Error('INVALID_QUIZ');
  }

  if (autoStartNum > 50) {
    throw new Error('AUTO_START_NUM_TOO_HIGH');
  }

  if (quiz.activeSessions.length >= 10) {
    throw new Error('TOO_MANY_ACTIVE_SESSIONS');
  }

  if (quiz.numQuestions === 0) {
    throw new Error('NO_QUESTIONS_IN_QUIZ');
  }

  const quizCopy: quizCopy = {
    quizId: quiz.quizId,
    ownerId: quiz.ownerId,
    // sessionState: quiz.sessionState,
    name: quiz.name,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    timeLimit: quiz.timeLimit,
    thumbnailUrl: quiz.thumbnailUrl
  };

  const newQuizSession: quizSession = {
    sessionId: randomId(10000),
    sessionState: quizState.LOBBY,
    quizCopy,
    autoStartNum,
    isInLobby: true,
    sessionQuestionPosition: 1,
    messages: [],
    players: []
  };

  quiz.activeSessions.push(newQuizSession);
  setData(data);
  return { sessionId: newQuizSession.sessionId };
};

/**
 * Retrieves active and inactive session ids for a quiz.
 *
 * @param {string} token - token of the logged-in user
 * @param {number} quizId - the quizId to retrieve sessions for
 *
 * @returns {viewQuizSessionsResponse} -
 * Returns active and inactive sessions or error if any issues are found
 */
export const adminViewQuizSessions = (
  token: string,
  quizId: number
): viewQuizSessionsResponse => {
  const data = getData();

  const tokenValidation = validateToken(token, data);

  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz || quiz.ownerId !== tokenValidation.authUserId) {
    throw new Error('INVALID_QUIZ');
  }

  // Separate active and inactive sessions
  const activeSessions = quiz.activeSessions
    .filter(session => !isSessionEnded(session))
    .map(session => session.sessionId)
    .sort((a, b) => a - b);

  const inactiveSessions = quiz.activeSessions
    .filter(isSessionEnded)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);

  return { activeSessions, inactiveSessions };
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
  token: string,
  version: string
): quizQuestionCreateResponse | errorMessages => {
  const data = getData();

  const tokenValidation = validateToken(token, data);

  const authUserId = tokenValidation.authUserId;

  const quiz = data.quizzes.find((q: quiz) => q.quizId === quizId);
  if (!quiz) {
    throw new Error('INVALID_QUIZ');
  }

  if (quiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }

  isValidQuestion(questionBody, quiz);

  const { answerOptions } = questionBody;
  validateAnswers(answerOptions);

  if (version === 'v2' && !validQuestionThumbnailUrl(questionBody.thumbnailUrl)) {
    throw new Error('INVALID_QUESTION_THUMBNAIL_URL');
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
  if (version === 'v2') {
    newQuestion.thumbnailUrl = questionBody.thumbnailUrl;
  }

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
  * @param {question} updatedQuestionBody - information of a question
  *
  * @returns {emptyReturn} - An empty upon successful registration
*/
export const adminQuizQuestionUpdate = (
  quizId: number,
  questionId: number,
  updatedQuestionBody: question,
  token: string,
  version: string
): emptyReturn => {
  const data = getData();

  const tokenValidation = validateToken(token, data);

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

  isValidQuestion(updatedQuestionBody, quiz);

  const { answerOptions } = updatedQuestionBody;
  validateAnswers(answerOptions);

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

  if (version === 'v2') {
    if (!validQuestionThumbnailUrl(updatedQuestionBody.thumbnailUrl)) {
      throw new Error('INVALID_QUESTION_THUMBNAIL_URL');
    }
    questionToUpdate.thumbnailUrl = updatedQuestionBody.thumbnailUrl;
  }

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

  const authUserId = tokenValidation.authUserId;

  isValidQuiz(authUserId, quizId, data);

  // remove the correct quiz
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const removeQuiz = data.quizzes[quizIndex];
  // check if any session of this quiz is not in END state
  for (const sessions of removeQuiz.activeSessions) {
    if (sessions.sessionState !== quizState.END) {
      throw new Error ('SESSION_NOT_IN_END');
    }
  }
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
*/
export const adminQuizInfo = (token: string, quizId: number, version: string): quizInfo => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);

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

  // Construct the response
  const response: quizInfo = {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    timeLimit: quiz.timeLimit
  };

  // Include thumbnailUrl if the version is v2
  if (version === 'v2') {
    response.thumbnailUrl = quiz.thumbnailUrl;
  }

  return response;
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

  const authUserId = tokenValidation.authUserId;

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw new Error('INVALID_QUIZ');
  }
  if (quiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }

  // check if name contains invalid characters
  if (!isStringValid(name)) {
    throw new Error('INVALID_QUIZ_NAME');
  }
  // checks for name length
  if (name.length < 3 || name.length > 30) {
    throw new Error('INVALID_NAME_LENGTH');
  }
  // check if user has duplicate quiz names
  if (isNameTaken(authUserId, name, data)) {
    throw new Error('DUPLICATE_QUIZNAME');
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

  const authUserId = tokenValidation.authUserId;

  // error checkings for invalid userId, quizId
  isValidQuiz(authUserId, quizId, data);

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

  const authUserId = tokenValidation.authUserId;

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

  const authUserId = tokenValidation.authUserId;

  // find quiz in trash
  const quiz = data.trash.find(q => q.quizId === quizId);
  const quizIsActive = data.quizzes.find(q => q.quizId === quizId);
  if (quiz) {
    if (quiz.ownerId !== authUserId) {
      throw new Error('INVALID_OWNER');
    }
  }
  // If quiz is not in the trash
  if (!quiz) {
    // quiz doesnt exist
    if (!quizIsActive) {
      throw new Error('INVALID_QUIZ');
    }
    throw new Error('QUIZ_NOT_IN_TRASH');
  }

  const activeQuiz = data.quizzes.find(q => q.name === quiz.name);
  // Quiz name used
  if (activeQuiz) {
    throw new Error('DUPLICATE_QUIZNAME');
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

  const authUserId = tokenValidation.authUserId;

  //  Valid token is provided, but user is not an owner of this quiz or quiz doesn't exist
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    throw new Error('INVALID_QUIZ');
  }

  if (quiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }

  // Any session for this quiz is not in END state
  const hasActiveSession = quiz.activeSessions.some(
    session => session.sessionState !== quizState.END);
  if (hasActiveSession) {
    throw new Error('SESSION_NOT_IN_END');
  }

  // Question Id does not refer to a valid question within this quiz
  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === -1) {
    throw new Error('INVALID_QUESTION_ID');
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

  const authUserId = tokenValidation.authUserId;

  const validQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!validQuiz) {
    throw new Error('INVALID_QUIZ');
  }
  if (validQuiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }
  const validQuestion = validQuiz.questions.find(q => q.questionId === questionId);
  if (!validQuestion) {
    throw new Error('INVALID_QUESTION_ID');
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
): emptyReturn => {
  const data = getData();

  const tokenValidation = validateToken(token, data);

  const transferredQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!transferredQuiz) {
    throw new Error('INVALID_QUIZ');
  }

  // checks if receiver is a real user
  const receiver = data.users.find((user) => user.email === userEmail);
  if (!receiver) {
    throw new Error('INVALID_USEREMAIL');
  }
  const receiverId = receiver.userId;

  // checks if userEmail is the current logged in user
  const senderId = tokenValidation.authUserId;
  if (senderId === receiverId) {
    throw new Error('ALREADY_OWNS');
  }

  // if receiver already has quiz with same name
  if (isNameTaken(receiverId, transferredQuiz.name, data)) {
    throw new Error('DUPLICATE_QUIZNAME');
  }

  // if sender does not own quiz
  if (senderId !== transferredQuiz.ownerId) {
    throw new Error('INVALID_OWNER');
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
    throw new Error('QUIZ_NOT_IN_TRASH');
  }

  // If there are any unauthorized quizzes, return an error
  if (unauthorizedQuizzes.length > 0) {
    throw new Error('INVALID_OWNER');
  }

  // Remove the valid quizzes from the trash
  data.trash = data.trash.filter(quiz => !quizIds.includes(quiz.quizId));
  setData(data);

  return {};
};

/**
 * Updates quiz session status based on admin action
 *
 * @param {number} quizId - An array of existing quizIds owned by user
 * @param {number} sessionId - Unique session id for quiz
 * @param {string} token - Unique session id for user
 * @param {adminAction} string - An admin action enum
 *
 * @returns {emptyReturn} - An empty upon successful registration
 */
export const adminQuizSessionUpdate = (
  quizId: number,
  sessionId: number,
  token: string,
  action: adminAction
): emptyReturn => {
  const data = getData();
  const tokenValidation = validateToken(token, data);

  const user = tokenValidation.authUserId;

  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // checks if quiz exist
  if (!quiz) {
    throw new Error('INVALID_QUIZ');
  }

  let quizSession :quizSession;
  // get quiz session from active array
  quizSession = quiz.activeSessions.find(
    (session) => session.sessionId === sessionId
  );

  // check if session exist in active
  if (!quizSession) {
    // if not, check in inactive array
    quizSession = quiz.inactiveSessions.find(
      (session) => session.sessionId === sessionId
    );

    // else, throw erorr
    if (!quizSession) {
      throw new Error('INVALID_SESSIONID');
    }
  }

  // check if action is invalid
  if (!(action in adminAction)) {
    throw new Error('INVALID_ACTION');
  }

  // check if user owns quiz
  if (user !== quiz.ownerId) {
    throw new Error('INVALID_OWNER');
  }

  if (quizSession.sessionState === quizState.LOBBY) {
    quizSession.isInLobby = true;
  }

  // if action is 'END'
  if (action === adminAction.END) {
    if (quizSession.sessionState === quizState.END) {
      throw new Error('INVALID_ACTION');
    }
    // update quiz session state
    quizSession.sessionState = quizState.END;
    // add into inactiveSes array
    quiz.inactiveSessions.push(quizSession);

    // get index of quizSession in activeSes array
    const quizSessionIndex = quiz.activeSessions.indexOf(quizSession);
    // remove it from activeSes array
    quiz.activeSessions.splice(quizSessionIndex, 1);

    // clear a scheduled timer if any exist
    if (timers[sessionId]) {
      clearTimeout(timers[sessionId]);
      delete timers[sessionId];
    }

    // Find and update all players in the session
    quizSession.players.forEach((player: PlayerState) => {
      if (player.sessionId === sessionId) {
        player.atQuestion = 0;
      }
    });
  }

  // if action is 'NEXT_QUESTION'
  if (action === adminAction.NEXT_QUESTION) {
    // check if action can be applied to current state
    if (
      quizSession.sessionState !== quizState.LOBBY &&
      quizSession.sessionState !== quizState.ANSWER_SHOW &&
      quizSession.sessionState !== quizState.QUESTION_CLOSE
    ) {
      throw new Error('INVALID_ACTION');
    }

    // clear any existing timers
    clearTimeout(timers[sessionId]);
    delete timers[sessionId];

    // update quiz session
    quizSession.sessionState = quizState.QUESTION_COUNTDOWN;

    // set a 3s duration before state of session automatically updates
    timers[sessionId] = setTimeout(() => {
      const newData = getData();
      const newQuiz = newData.quizzes.find((quiz) => quiz.quizId === quizId);
      const updatedQuizSession = newQuiz.activeSessions.find(
        (session) => session.sessionId === sessionId
      );
      updatedQuizSession.sessionState = quizState.QUESTION_OPEN;

      // get question_open time
      updatedQuizSession.questionOpenTime = Date.now();
      if (updatedQuizSession.isInLobby === false) {
        updatedQuizSession.sessionQuestionPosition++;
      } else {
        updatedQuizSession.isInLobby = false;
      }

      // Find and update all players in the session
      quizSession.players.forEach((player: PlayerState) => {
        if (player.sessionId === sessionId) {
          player.atQuestion = (player.atQuestion ?? 0) + 1;
        }
      });

      // after 3s, add 5s timer for question open
      if (updatedQuizSession.sessionState === quizState.QUESTION_OPEN) {
        timers[sessionId] = setTimeout(() => {
          const new2Data = getData();
          const new2Quiz = new2Data.quizzes.find((quiz) => quiz.quizId === quizId);
          const updated2QuizSession = new2Quiz.activeSessions.find(
            (session) => session.sessionId === sessionId
          );

          updated2QuizSession.sessionState = quizState.QUESTION_CLOSE;
          setData(new2Data);
        },
        quizSession.quizCopy.questions[quizSession.sessionQuestionPosition - 1].timeLimit * 1000);
      }
      setData(newData);
    }, 3000);
  }

  // if action is 'SKIP_COUNTDOWN'
  if (action === adminAction.SKIP_COUNTDOWN) {
    // check if action can be applied to current state
    if (quizSession.sessionState !== quizState.QUESTION_COUNTDOWN) {
      throw new Error('INVALID_ACTION');
    }

    // checks if clear 3s timer
    clearTimeout(timers[sessionId]);
    delete timers[sessionId];

    // update quiz session
    quizSession.sessionState = quizState.QUESTION_OPEN;
    if (quizSession.isInLobby === false) {
      quizSession.sessionQuestionPosition++;
    } else {
      quizSession.isInLobby = false;
    }

    // set the 5s timer
    timers[sessionId] = setTimeout(() => {
      const new2Data = getData();
      const new2Quiz = new2Data.quizzes.find((quiz) => quiz.quizId === quizId);
      const updated2QuizSession = new2Quiz.activeSessions.find(
        (session) => session.sessionId === sessionId
      );

      updated2QuizSession.sessionState = quizState.QUESTION_CLOSE;
      setData(new2Data);
    }, quizSession.quizCopy.questions[quizSession.sessionQuestionPosition - 1].timeLimit * 1000);
  }

  // if action is 'ANSWER_SHOW'
  if (action === adminAction.GO_TO_ANSWER) {
    // check if action can be applied to current state
    if (
      quizSession.sessionState !== quizState.QUESTION_OPEN &&
      quizSession.sessionState !== quizState.QUESTION_CLOSE
    ) {
      throw new Error('INVALID_ACTION');
    }

    // update quiz session
    quizSession.sessionState = quizState.ANSWER_SHOW;

    // clear a scheduled timer if any exist
    if (timers[sessionId]) {
      clearTimeout(timers[sessionId]);
      delete timers[sessionId];
    }
  }

  // if action is 'GO_TO_FINAL_RESULTS'
  if (action === adminAction.GO_TO_FINAL_RESULTS) {
    // check if action can be applied to current state
    if (
      quizSession.sessionState !== quizState.QUESTION_CLOSE &&
      quizSession.sessionState !== quizState.ANSWER_SHOW
    ) {
      throw new Error('INVALID_ACTION');
    }

    // update quiz session
    quizSession.sessionState = quizState.FINAL_RESULTS;
    // Find and update all players in the session
    quizSession.players.forEach((player: PlayerState) => {
      if (player.sessionId === sessionId) {
        player.atQuestion = 0;
      }
    });
  }

  setData(data);
  return {};
};

export const adminQuizSessionState = (quizId: number, sessionId: number, token: string):
sessionState => {
  const data = getData();

  let FindSession: quizSession;
  // find session if it is in active session array
  for (const quiz of data.quizzes) {
    FindSession = quiz.activeSessions.find((session) => session.sessionId === sessionId);

    if (FindSession) break;
  }

  // find session if it is in inactive session array
  if (!FindSession) {
    for (const quiz of data.quizzes) {
      FindSession = quiz.inactiveSessions.find((session) => session.sessionId === sessionId);

      if (FindSession) break;
    }
  }

  // after searching both active & inactive, if none, then return error
  if (!FindSession) {
    throw new Error('INVALID_SESSIONID');
  }

  const tokenValidation = validateToken(token, data);

  const authUserId = tokenValidation.authUserId;

  const validQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (validQuiz.ownerId !== authUserId) {
    throw new Error('INVALID_OWNER');
  }

  const matchedPlayers = FindSession.players.filter(player => player.sessionId === sessionId);
  const Playersname = matchedPlayers.map(player => player.playerName);

  const response : sessionState = {
    state: FindSession.sessionState,
    atQuestion: validQuiz.atQuestion,
    players: Playersname,
    metadata: {
      quizId: validQuiz.quizId,
      name: validQuiz.name,
      timeCreated: validQuiz.timeCreated,
      timeLastEdited: validQuiz.timeLastEdited,
      description: validQuiz.description,
      numQuestions: validQuiz.numQuestions,
      questions: validQuiz.questions.map(question => ({
        questionId: question.questionId,
        question: question.question,
        timeLimit: question.timeLimit,
        thumbnailUrl: question.thumbnailUrl || '',
        points: question.points,
        answerOptions: question.answerOptions.map(option => ({
          answerId: option.answerId,
          answer: option.answer,
          colour: option.colour,
          correct: option.correct
        }))
      })),
      timeLimit: validQuiz.timeLimit,
      thumbnailUrl: validQuiz.thumbnailUrl || '',
    }
  };

  return response;
};

export const adminGetFinalResults = (
  quizId: number,
  sessionId: number,
  token: string
) => {
  const data = getData();

  // validate token
  const tokenValidation = validateToken(token, data);

  // get quiz & check if it exist and checks if the user owns session
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!quiz || quiz.ownerId !== tokenValidation.authUserId) {
    throw new Error('INVALID_QUIZ');
  }

  // get quiz session & check if it exist
  const quizSession = quiz.activeSessions.find(
    (session) => session.sessionId === sessionId
  );
  if (!quizSession) {
    throw new Error('INVALID_SESSIONID');
  }

  // check if quiz session state is not FINAL_RESULT
  if (quizSession.sessionState !== quizState.FINAL_RESULTS) {
    throw new Error('INVALID_QUIZ_SESSION');
  }

  // first, get player list
  const playerList = quizSession.players.filter((player) =>
    player.sessionId === sessionId && player.score !== undefined
  ).map(
    player => (
      {
        playerName: player.playerName,
        score: player.score
      }
    )
  );

  // sort players based on score
  const usersRankedByScore = playerList.sort((player1, player2) => player2.score - player1.score);

  // to get questionResults array
  const questionResults = quizSession.quizCopy.questions.map(
    (question) => {
      // find the correct answer option & Id
      const correctAnswerOption = question.answerOptions.find(option => option.correct);
      const correctAnswerId = correctAnswerOption ? correctAnswerOption.answerId : null;

      // get an array of playerStates of players who selected the correct ans option
      const playersCorrect = (question.answerSubmissions || []).filter(
        (submisssion) => {
          // return only correct answer submissions
          return correctAnswerId !== null && submisssion.answerIds.includes(correctAnswerId);
        }
      ).map(
        (submission) => {
          const player = quizSession.players.find(
            (player) => player.playerId === submission.playerId
          );
          return player ? player.playerName || '' : '';
        }
        // then sort by alphabetically
      ).sort((a, b) => a.localeCompare(b));

      // get the total answer time
      const totalAnswerTime = (question.answerSubmissions || []).reduce((acc, submission) => {
        // find user associated with submission
        const player = quizSession.players.find(
          (player) => player.playerId === submission.playerId &&
          player.sessionId === quizSession.sessionId
        );

        // check if player is currently at this question
        const answerTime = player && player.atQuestion === question.questionId
          ? (player.atQuestion || 0)
          : 0;
        return acc + answerTime;
      }, 0);

      const averageAnswerTime = playersCorrect.length > 0
        ? totalAnswerTime / playersCorrect.length
        : 0;
      const percentCorrect = (playersCorrect.length / quizSession.players.length) * 100;

      return {
        questionId: question.questionId,
        playersCorrect,
        averageAnswerTime,
        percentCorrect
      };
    }
  );

  return { usersRankedByScore, questionResults };
};

export const adminGetFinalResultsCsv = (
  quizId: number,
  sessionId: number,
  token: string
) => {
  const data = getData();

  // validate token
  const tokenValidation = validateToken(token, data);

  // get quiz & check if it exists and if the user owns the session
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!quiz || quiz.ownerId !== tokenValidation.authUserId) {
    throw new Error('INVALID_QUIZ');
  }

  // get quiz session & check if it exists
  const quizSession = quiz.activeSessions.find(
    (session) => session.sessionId === sessionId
  );
  if (!quizSession) {
    throw new Error('INVALID_SESSIONID');
  }

  // check if quiz session state is FINAL_RESULTS
  if (quizSession.sessionState !== quizState.FINAL_RESULTS) {
    throw new Error('INVALID_QUIZ_SESSION');
  }

  // Prepare the data for CSV
  const finalResults: { [key: string]: string[] } = {};
  quizSession.quizCopy.questions.forEach((question) => {
    if (question.playerPerfAtQuestion) {
      question.playerPerfAtQuestion.forEach((performance) => {
        const playerName = performance.playerName;
        const playerScore = performance.score;

        // Calculate player rank
        const playerRank =
          question.playerPerfAtQuestion
            .sort((playerA, playerB) => playerB.score - playerA.score)
            .findIndex((player) => player.playerName === playerName) + 1;

        if (!finalResults[playerName]) {
          finalResults[playerName] = [];
        }

        // Add score and rank
        finalResults[playerName].push(`${playerScore}, ${playerRank}`);
      });
    }
  });

  // Create CSV content
  const header = ['Player'];
  quizSession.quizCopy.questions.forEach((_, i) => {
    header.push(`question${i + 1}score, question${i + 1}rank`);
  });

  const sortedList = Object.keys(finalResults).sort();
  const csvContent = [
    header.join(','),
    ...sortedList.map((playerName) => {
      return [playerName, ...finalResults[playerName]].join(',');
    })
  ].join('\n');

  // Write the CSV file
  const csvResult = `final_results_${quizId}_${sessionId}.csv`;
  const filePath = path.join(__dirname, 'public', 'csv', csvResult);
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, csvContent);

  // Return the file URL
  const fileUrl = `/public/csv/${csvResult}`;
  return { url: fileUrl };
};
