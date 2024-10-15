import { getData, setData } from './dataStore'

import {
	token
} from './interface'

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
    userId,
  };
  data.sessions.push(session);
  setData(data);
  return encodeURIComponent(JSON.stringify({ sessionId }));
}


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
