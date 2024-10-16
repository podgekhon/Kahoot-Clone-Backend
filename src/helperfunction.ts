import { getData, setData } from './dataStore';

import {
  token,
  errorMessages,
  emptyReturn,
  dataStore as data
} from './interface';

/**
  * Validates the session token and returns the associated authUserId if valid.
  *
  * @param {string} token - the token to validate
  *
  * @returns {{ authUserId: number } | { error: string }} - an object
  * containing authUserId if valid, or an error message if invalid
  */
export function validateToken(token: string): { authUserId: number } | { error: string } {
  const decodedToken = JSON.parse(decodeURIComponent(token));

  const data = getData();
  const session = data.sessions.find(s => s.sessionId === decodedToken.sessionId);

  if (session) {
    return { authUserId: session.userId };
  }

  return { error: 'Invalid token: session does not exist.' };
}

let lastSessionId = 0;
/**
  * Generates a session token for a given userId and stores the session
  * in the data store.
  *
  * @param {number} userId - The unique identifier of the user
  *
  * @returns {string} - A URL-encoded token containing the session ID
  */
export function generateToken(userId: number): string {
  const data = getData();
  const sessionId = lastSessionId++;
  const session: token = {
    sessionId,
    userId
  };
  data.sessions.push(session);
  setData(data);
  return encodeURIComponent(JSON.stringify({ sessionId: sessionId }));
}

/// ///////////////////////////////////////////////////////////////
/// ////////////// helper functions for auth.ts ///////////////////
/// ///////////////////////////////////////////////////////////////

/**
 *
 * @param {string} email - email use to register
 * @returns {boolean} - return true if valid
 */
export const isEmailUsed = (email: string): boolean => {
  const data = getData();
  return data.users.some(user => user.email === email);
};

/**
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
export const isValidPassword = (password: string): { valid?: boolean; error?: string } => {
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
export const isUserValid = (authUserId: number): boolean => {
  // loop thru users array and match authUserId
  const data = getData();
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

// helper function: checks for valid name length
// function will return false if name length is < 3 or > 30
// return true if otherwise

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

// helper function: checks if the user has quizzes with same name
// function willl return true if they do
// return false if otherwise

/**
  * checks if name is already taken
  *
  * @param {number}  authUserId - user's Id
  * @param {string}  name - any string name
  *
  * @returns {boolean} - returns false if name is already taken
*/
export const isNameTaken = (authUserId: number, name: string): boolean => {
  const data = getData();
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
 *
 */
export const isValidQuiz = (
  authUserId: number,
  quizId: number,
  data: data
): errorMessages | null => {
  const validUserId = data.users.find(user => user.userId === authUserId);
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);

  // check invalid user id
  if (!validUserId) {
    return { error: 'AuthUserId is not valid.' };
  } else if (!validQuizId) {
    // invalid quiz id
    return { error: 'QuizID does not refer to a valid quiz.' };
  } else if (validQuizId.ownerId !== authUserId) {
    // quiz id does not refer to it's owner
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }
  return null;
};


export function isErrorMessages(result: errorMessages | emptyReturn): result is errorMessages {
  return (result as errorMessages).error !== undefined;
}