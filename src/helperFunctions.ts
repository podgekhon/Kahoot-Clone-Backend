import {
  token,
  errorMessages,
  emptyReturn,
  question,
  quiz,
  answerOption,
  dataStore as data,
  dataStore
} from './interface';

/**
 * Generates a random hexadecimal color code.
 *
 * @returns {string} - A string representing a random hexadecimal color code,
 * starting with # followed by six hexadecimal digits.
 */
export function generateRandomColour(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
  * Validates the session token and returns the associated authUserId if valid.
  *
  * @param {string} token - the token to validate
  *
  * @returns {{ authUserId: number } | { error: string }} - an object
  * containing authUserId if valid, or an error message if invalid
  */
export function validateToken(
  token: string,
  data: dataStore
): {
  authUserId: number
} | { error: string } {
  let decodedToken;
  try {
    // Try to decode and parse the token as a valid JSON string
    decodedToken = JSON.parse(decodeURIComponent(token));
  } catch (error) {
    // If parsing fails, return an error message
    return { error: 'Invalid token format.' };
  }

  const session = data.sessions.find(s => s.sessionId === decodedToken.sessionId);
  if (session) {
    return { authUserId: session.userId };
  }
  return { error: 'Invalid token: session does not exist.' };
}

/**
  * Generates a session token for a given userId and stores the session
  * in the data store.
  *
  * @param {number} userId - The unique identifier of the user
  *
  * @returns {string} - A URL-encoded token containing the session ID
  */
export function generateToken(userId: number, data: dataStore): string {
  const sessionId = randomId(1000000);
  const session: token = {
    sessionId,
    userId
  };
  data.sessions.push(session);
  return encodeURIComponent(JSON.stringify({ sessionId: sessionId }));
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
 * @returns {object} An object with an error message if invalid, or
 * { valid: true } if the password is valid.
 *
 */
export const isValidPassword = (
  password: string
): { valid?: boolean; error?: string } => {
  // Check if password length is at least 8 characters
  if (password.length < 8) {
    return { error: 'Password is less than 8 characters.' };
  }

  // Check if password contains at least one letter
  const containsLetter = /[a-zA-Z]/.test(password);
  // Check if password contains at least one number
  const containsNumber = /\d/.test(password);
  if (!containsLetter || !containsNumber) {
    return {
      error: 'Password must contain at least one letter and one number.'
    };
  }

  return { valid: true };
};

/// ///////////////////////////////////////////////////////////////
/// ////////////// helper functions for quiz.ts ///////////////////
/// ///////////////////////////////////////////////////////////////
/**
 * Checks if the provided user ID refers to a valid user.
 *
 * @param {integer} authUserId - the user ID to be validated.
 * @returns {boolean} - returns true if the user exists, false otherwise.
 *
 */
export const isUserValid = (authUserId: number, data: dataStore): boolean => {
  // loop thru users array and match authUserId
  const user = data.users.find(users => users.userId === authUserId);

  // check if user valid
  if (user) {
    return true;
  }

  return false;
};

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
  * checks for length of name, returns error if name < 3 or > 30
  *
  * @param {string} name - any string name
  *
  * @returns {object} - returns specific error object depending on name length
*/
export const isNameLengthValid = (name: string): errorMessages | null => {
  if (name.length < 3) {
    // if length is less than 3 char
    return { error: 'Name is less than 3 characters.' };
  } else if (name.length > 30) {
    // if length is more than 30 char
    return { error: 'Name is more than 30 characters.' };
  }

  return undefined;
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
): errorMessages | null => {
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);

  // check invalid user id
  if (!validQuizId) {
    // invalid quiz id
    return { error: 'INVALID_QUIZ' };
  } else if (validQuizId.ownerId !== authUserId) {
    // quiz id does not refer to it's owner
    return { error: 'INVALID_OWNER' };
  }
  return null;
};

/**
 * Validates the question details for a quiz.
 *
 * @param {object} questionBody - the body of the question
 * @param {object} quiz - the quiz object containing questions
 * @returns {object} - an object with an error message if invalid,
 * or null if the question details are valid.
 *
 */
export const isValidQuestion = (
  questionBody: question,
  quiz: quiz
): errorMessages | null => {
  const { question, timeLimit, points, answerOptions } = questionBody;

  if (question.length < 5 || question.length > 50) {
    return { error: 'INVALID_QUESTION_LENGTH' };
  }

  if (answerOptions.length < 2 || answerOptions.length > 6) {
    return { error: 'INVALID_ANSWER_COUNT' };
  }

  if (timeLimit <= 0) {
    return { error: 'INVALID_TIME_LIMIT' };
  }

  // Validate if the total quiz time limit is not exceeded
  // We need to add timeLimit to the reduce method because the
  // new question hasn't been added to the questions array yet.
  if (quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0) + timeLimit > 180) {
    return { error: 'EXCEEDED_TOTAL_TIME_LIMIT' };
  }

  if (points < 1 || points > 10) {
    return { error: 'INVALID_POINTS' };
  }

  return null;
};

/**
 * Validates the answer options for a quiz question.
 *
 *
 * @param {Array} answerOptions - the array of answer options to validate
 * @returns {errorMessages | null} - an object with an error message if
 * validation fails, or null if the answers are valid.
 *
 */
export const validateAnswers = (
  answerOptions: answerOption[]
): errorMessages | null => {
  const answerSet = new Set();
  let hasCorrectAnswer = false;

  for (const answerOption of answerOptions) {
    if (answerOption.answer.length < 1 || answerOption.answer.length > 30) {
      return { error: 'INVALID_ANSWER_LENGTH' };
    }
    if (answerSet.has(answerOption.answer)) {
      return { error: 'DUPLICATE_ANSWERS' };
    }
    answerSet.add(answerOption.answer);
    if (answerOption.correct) {
      hasCorrectAnswer = true;
    }
  }

  if (!hasCorrectAnswer) {
    return { error: 'NO_CORRECT_ANSWER' };
  }

  return null;
};

/**
 *  check whether the return of a request is error message
 *
 * @param {errorMessages| emptyReturn} result - result of http request
 * @returns {boolean}
 */
export function isErrorMessages(result: errorMessages | emptyReturn): result is errorMessages {
  return (result as errorMessages).error !== undefined;
}

/**
 * given a number, return a number between 0 and the number
 *
 * @param {number} max - max number
 * @returns {number} - random number between 0 and max
 */
export function randomId(max: number): number {
  return Math.floor(Math.random() * (max + 1));
}
