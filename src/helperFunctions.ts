import {
  token,
  question,
  quiz,
  answerOption,
  dataStore as data,
  dataStore,
  quizSession,
  PlayerState,
  timers,
  emptyReturn
} from './interface';

import { quizState } from './quiz';

import { getData, setData } from './dataStore';

/**
 * Checks if a given quesiton thumbnail url is valid
 * @param {string} url - the thumbnail url to validate
 * @returns {boolean}
 */
export function validQuestionThumbnailUrl(url: string): boolean {
  if (!url) return false;

  if (!/^https?:\/\/.*/i.test(url)) return false;

  // Check if URL ends with jpg, jpeg, or png
  const validExtensions = /\.(jpg|jpeg|png)$/i;
  if (!validExtensions.test(url)) return false;

  return true;
}

/**
 * Generates a random color from a predefined list of colors.
 *
 * @returns {string} - A randomly chosen color from the array.
 */
export function generateRandomColour(): string {
  const colours = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];
  return colours[Math.floor(Math.random() * colours.length)];
}

/**
 * Generates a random Id.
 *
 * @returns {number} - a random integer Id
 */
export function generateRandomId(): number {
  const randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  return randomId;
}

/**
  * Validates the session token and returns the associated authUserId if valid.
  *
  * @param {string} token - the token to validate
  *
  * @returns {{ authUserId: number }} - an object
  * containing authUserId if valid
  */
export function validateToken(
  token: string,
  data: dataStore
): {
  authUserId: number
} {
  let parsedToken;
  try {
    // Try to decode and parse the token as a valid JSON string
    parsedToken = JSON.parse(token);
  } catch (error) {
    // If parsing fails, return an error message
    throw new Error('INVALID_TOKEN');
  }

  const session = data.sessions.find(s => s.sessionId === parsedToken.sessionId);
  if (session) {
    return { authUserId: session.userId };
  }
  throw new Error('INVALID_TOKEN');
}

/**
  * Generates a session token for a given userId and stores the session
  * in the data store.
  *
  * @param {number} userId - The unique identifier of the user
  *
  * @returns {string} - a token containing the sessionId
  */
export function generateToken(userId: number, data: dataStore): string {
  const sessionId = generateRandomId();
  const session: token = {
    sessionId,
    userId
  };
  data.sessions.push(session);
  return JSON.stringify({ sessionId: sessionId });
}

/// ///////////////////////////////////////////////////////////////
/// ////////////// helper functions for auth.ts ///////////////////
/// ///////////////////////////////////////////////////////////////

/**
 * check whether email has been used before
 *
 * @param {string} email - email use to register
 * @returns {boolean} - return true if valid
 */
export const isEmailUsed = (email: string, data: dataStore): boolean => {
  return data.users.some(user => user.email === email);
};

/**
 * check whether name is valid, returning boolen
 *
 * @param {string} name - user's firstname or lastname
 * @returns {boolean} - return true if name is valid
 */
export const isNameValid = (name: string): boolean => {
  const namePattern = /^[a-zA-z'-\s]+$/;
  return namePattern.test(name) && name.length >= 2 && name.length <= 20;
};

/**
 * Validates a password based on length, letter, and number criteria.
 *
 * @param {string} password - The password to be validated.
 * @returns {object} - { valid: true } if the password is valid.
 *
 */
export const isValidPassword = (
  password: string
): { valid?: boolean; error?: string } => {
  // Check if password length is at least 8 characters
  if (password.length < 8) {
    throw new Error('INVALID_PASSWORD');
  }

  // Check if password contains at least one letter
  const containsLetter = /[a-zA-Z]/.test(password);
  // Check if password contains at least one number
  const containsNumber = /\d/.test(password);
  if (!containsLetter || !containsNumber) {
    throw new Error('INVALID_PASSWORD');
  }

  return { valid: true };
};

/// ///////////////////////////////////////////////////////////////
/// ////////////// helper functions for quiz.ts ///////////////////
/// ///////////////////////////////////////////////////////////////

/**
  * checks if string contains invalid characters
  *
  * @param {string}  - any string user inputs
  *
  * @returns {boolean} - false if string contains non alphanumeric
*/
export const isStringValid = (string: string): boolean => {
  const containsInvalidChar = /[^a-zA-Z0-9\s]/.test(string);
  // checks if string contains invalid char
  if (containsInvalidChar) {
    return false;
  }

  return true;
};

/**
  * checks if name is already taken
  *
  * @param {number}  authUserId - user's Id
  * @param {string}  name - any string name
  *
  * @returns {boolean} - returns false if name is already taken
*/
export const isNameTaken = (authUserId: number, name: string, data: dataStore): boolean => {
  return data.quizzes.some((quiz) => {
    return (quiz.ownerId === authUserId &&
    name === quiz.name);
  });
};

/**
 * Validates if a quiz is associated with a valid user and is owned by that user.
 *
 * @param {integer} authUserId - the user ID of the authorized user.
 * @param {integer} quizId - the ID of the quiz to be validated.
 * @param {object} data - the dataset containing user and quiz information.
 * @returns {object|null} - an error object if validation fails,
 *                         or null if the quiz and user are valid.
 */
export const isValidQuiz = (
  authUserId: number,
  quizId: number,
  data: data
) => {
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);

  // check invalid user id
  if (!validQuizId) {
    // invalid quiz id
    throw new Error('INVALID_QUIZ');
  } else if (validQuizId.ownerId !== authUserId) {
    // quiz id does not refer to it's owner
    throw new Error('INVALID_OWNER');
  }
  return {};
};

/**
 * Validates the question details for a quiz.
 *
 * @param {question} questionBody - the body of the question
 * @param {quiz} quiz - the quiz object containing questions
 * @returns {emptyReturn}
 *
 */
export const isValidQuestion = (
  questionBody: question,
  quiz: quiz
): emptyReturn => {
  const { question, timeLimit, points, answerOptions } = questionBody;

  if (question.length < 5 || question.length > 50) {
    throw new Error('INVALID_QUESTION_LENGTH');
  }

  if (answerOptions.length < 2 || answerOptions.length > 6) {
    throw new Error('INVALID_ANSWER_COUNT');
  }

  if (timeLimit <= 0) {
    throw new Error('INVALID_TIME_LIMIT');
  }

  // Validate if the total quiz time limit is not exceeded
  // We need to add timeLimit to the reduce method because the
  // new question hasn't been added to the questions array yet.
  if (quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0) + timeLimit > 180) {
    throw new Error('EXCEEDED_TOTAL_TIME_LIMIT');
  }

  if (points < 1 || points > 10) {
    throw new Error('INVALID_POINTS');
  }
  return {};
};

/**
 * Validates the answer options for a quiz question.
 * @param {Array} answerOptions - the array of answer options to validate
 * @returns {emptyReturn}
 *
 */
export const validateAnswers = (
  answerOptions: answerOption[]
) => {
  const answerSet = new Set();
  let hasCorrectAnswer = false;

  for (const answerOption of answerOptions) {
    if (answerOption.answer.length < 1 || answerOption.answer.length > 30) {
      throw new Error('INVALID_ANSWER_LENGTH');
    }
    if (answerSet.has(answerOption.answer)) {
      throw new Error('DUPLICATE_ANSWERS');
    }
    answerSet.add(answerOption.answer);
    if (answerOption.correct) {
      hasCorrectAnswer = true;
    }
  }

  if (!hasCorrectAnswer) {
    throw new Error('NO_CORRECT_ANSWER');
  }
  return {};
};

/**
 * Generate a random name consisting of 5 unique letters followed by 3 unique digits.
 *
 * @returns {string} - A random name in the format of "[5 letters][3 numbers]",
 *                     ensuring no repetitions of letters or numbers.
 */
export function generateRandomName(): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  let randomLetters = '';
  let randomNumbers = '';

  while (randomLetters.length < 5) {
    const randomChar = letters[Math.floor(Math.random() * letters.length)];
    if (!randomLetters.includes(randomChar)) {
      randomLetters += randomChar;
    }
  }

  while (randomNumbers.length < 3) {
    const randomNum = numbers[Math.floor(Math.random() * numbers.length)];
    if (!randomNumbers.includes(randomNum)) {
      randomNumbers += randomNum;
    }
  }

  return randomLetters + randomNumbers;
}

/**
 * Find the corresponding QuizSession by playerID.
 *
 * @param {object} data - the dataset containing user and quiz information.
 * @param {integer} playerId - the playerId.
 * @returns {string} - return the corresponding activeSession or return null if no session found
 */
export function findQuizSessionByPlayerId(data: dataStore, playerId: number): quizSession | null {
  // Search through all quizzes
  for (const quiz of data.quizzes) {
    // Find in activeSessions
    const activeSession = quiz.activeSessions.find(session =>
      session.players.some(player => player.playerId === playerId)
    );
    if (activeSession) return activeSession;
  }
  // Return null if no session is found
  for (const quiz of data.quizzes) {
    // Find in inactiveSessions
    const inactiveSession = quiz.inactiveSessions.find(session =>
      session.players.some(player => player.playerId === playerId)
    );
    if (inactiveSession) {
      throw new Error('SESSION_IN_END');
    }
  }
  return null;
}

/**
 * changes the state of session when admin action is NEXT_QUESTION.
 *
 * @param {quizSession} quizSession - the dataset containing user and quiz information.
 * @param {number} sessionId - the playerId.
 * @param {number} quizId - the playerId.
 * @param {timers} timers - an array of setTimeout functions
 */
// admin action to go next question
export const actionNextQuestion = (
  quizSession: quizSession,
  sessionId: number,
  quizId: number,
  timers: timers
) => {
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
};

/**
 * changes the state of session when admin action is SKIP_COUNTDOWN
 *
 * @param {quizSession} quizSession - the dataset containing user and quiz information.
 * @param {number} sessionId - the playerId.
 * @param {number} quizId - the playerId.
 * @param {timers} timers - an array of setTimeout functions
 */
export const actionSkipCountdown = (
  quizSession: quizSession,
  sessionId: number,
  quizId: number,
  timers: timers
) => {
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
};

/**
 * changes the state of session when admin action is ANSWER_SHOW
 *
 * @param {quizSession} quizSession - the dataset containing user and quiz information.
 * @param {number} sessionId - the playerId.
 * @param {timers} timers - an array of setTimeout functions
 */
export const actionAnswerShow = (
  quizSession: quizSession,
  sessionId: number,
  timers: timers
) => {
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
};

/**
 * changes the state of session when admin action is GO_TO_FINAL_RESULTS
 *
 * @param {quizSession} quizSession - the dataset containing user and quiz information.
 * @param {number} sessionId - the playerId.
 * @param {timers} timers - an array of setTimeout functions
 */
export const actionGoToFinalResults = (
  quizSession: quizSession,
  sessionId: number
) => {
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
};
