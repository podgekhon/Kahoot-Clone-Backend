/// ///----EXTERNAL FILES-----/////

/// //////////// UNCOMMENT THIS LINE BELOW //////////////
// import { TokenType } from 'yaml/dist/parse/cst.js';
import { getData, setData } from './dataStore';
import { token } from './interface';
import {
  errorMessages,
  tokenReturn,
  userDetails,
} from './interface';
import validator from 'validator';
/// //------ASSUMPTIONS----//////
// assume functions are case sensitive
// assume white space is kept

// Global variable to keep track of the last used session ID
let lastSessionId = 0;

interface emptyReturn {}
/**
 * Register a user with an email, password, and names,
 * then returns their authUserId value.
 *
 * @param {string} email
 * @param {string} password
 *
 * @returns {integer} authUserId
*/

export const adminAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): errorMessages | tokenReturn => {
  const data = getData();
  // Check if Email address is used by another user.
  if (isEmailUsed(email)) {
    return { error: 'Email already used' };
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return { error: 'Invalid email format' };
  }

  // Validate first name (NameFirst)
  if (!isNameValid(nameFirst)) {
    return { error: 'First name invalid' };
  }

  // Validate last name (NameLast)
  if (!isNameValid(nameLast)) {
    return { error: 'Last name invalid' };
  }

  const passwordValidation = isValidPassword(password);
  // Check if the returned object from isValidPassword helper function has an
  // error field
  if (passwordValidation.error) {
    // Return the error if validation fails
    return { error: 'password invalid' };
  }

  // 7. Register the user and update the data
  const authUserId = data.users.length + 1;
  data.users.push({
    userId: authUserId,
    email: email,
    currentPassword: password,
    oldPasswords: [],
    nameFirst: nameFirst,
    nameLast: nameLast,
    name: `${nameFirst} ${nameLast}`,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  });
  const token = generateToken(authUserId);
  setData(data);
  return { token };
};

// helper functions for adminAuthRegister

/**
  * Generates a session token for a given userId and stores the session
  * in the data store.
  *
  * @param {number} userId - The unique identifier of the user
  *
  * @returns {string} - A URL-encoded token containing the session ID
  */
function generateToken(userId: number): string {
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
const isEmailUsed = (email: string): boolean => {
  const data = getData();
  return data.users.some(user => user.email === email);
};

/**
 *
 * @param {string} name - user's firstname or lastname
 * @returns {boolean} - return true if name is valid
 */
const isNameValid = (name: string): boolean => {
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
const isValidPassword = (password: string): { valid?: boolean; error?: string } => {
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

/**
  * Given a registered user's email and password returns their authUserId value.
  *
  * @param {string} email - description of paramter
  * @param {string} password - description of parameter
  *
  *
  * @returns {integer} - UserId
*/
export const adminAuthLogin = (email: string, password: string): errorMessages | tokenReturn => {
  const data = getData();
  // Find the user by email
  const user = data.users.find((user) => user.email === email);
  if (!user) {
    return { error: 'Email address does not exist.' };
  }

  // Check if the password is correct
  if (user.currentPassword !== password) {
    // Increment numFailedPasswordsSinceLastLogin
    user.numFailedPasswordsSinceLastLogin += 1;
    return { error: 'Password is not correct for the given email.' };
  }

  // Reset numFailedPasswordsSinceLastLogin and increment numSuccessfulLogins
  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins += 1;
  const token = generateToken(user.userId);

  return { token };
};

/**
  * Given an admin user's authUserId, return details about the user.
  * "name" is the first and last name concatenated
  * with a single space between them.
  *
  * @param {integer} authUserId - description of paramter
  *
  * @returns { user:
  *    {
  *     userId: Integers,
  *     name: string,
  *     email: string,
  *     numSuccessfulLogins: Integers,
  *     numFailedPasswordsSinceLastLogin: Integers,
  *  }
  *}
*/
export const adminUserDetails = (authUserId: number): errorMessages | userDetails => {
  const data = getData();
  // Find the user by authUserId
  const user = data.users.find((user) => user.userId === authUserId);
  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  const userDetails = {
    userId: user.userId,
    name: `${user.nameFirst} ${user.nameLast}`,
    email: user.email,
    numSuccessfulLogins: user.numSuccessfulLogins,
    numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
  };

  return { user: userDetails };
};

/**
 * Given an admin user's authUserId and a set of properties,
 * update the properties of this logged in admin user.
 *
 * @param {integer} authUserId - authUserId
 * @param {string} email - email
 * @param {string} nameFirst - First name
 * @param {string} nameLast - Last name
 * ...
 * @return {} no return;
*/
export const adminUserDetailsUpdate = (
  authUserId: number,
  email: string,
  nameFirst: string,
  nameLast: string
): errorMessages | emptyReturn => {
  const data = getData();
  // Check if authUserId is valid
  const currentUser = data.users.find(user => user.userId === authUserId);
  if (!currentUser) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  // Check if email is valid
  if (!validator.isEmail(email)) {
    return { error: 'Invalid email format.' };
  }

  // Check if email is already used by another user
  // (excluding the current authorised user)
  const emailInUse = data.users.find(
    user => user.email === email &&
    user.userId !== authUserId
  );

  if (emailInUse) {
    return { error: 'Email is currently used by another user.' };
  }

  // Validate first name (NameFirst)
  if (!isNameValid(nameFirst)) {
    return { error: 'First name invalid' };
  }

  // Validate last name (NameLast)
  if (!isNameValid(nameLast)) {
    return { error: 'Last name invalid' };
  }

  currentUser.email = email;
  currentUser.nameFirst = nameFirst;
  currentUser.nameLast = nameLast;

  return {};
};

/**
  * Given details relating to a password change,
  * update the password of a logged in user.
  *
  * @param {integer} authUserId - description of paramter
  * @param {string} oldPassword - oldPassword
  * @param {string} newPassword - newPassword
  * ...
  * @return {} no return;
*/
export const adminUserPasswordUpdate = (
  authUserId: number,
  oldPassword: string,
  newPassword: string
): errorMessages | emptyReturn => {
  const data = getData();
  const user = data.users.find(user => user.userId === authUserId);

  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  if (user.currentPassword !== oldPassword) {
    return { error: 'Old Password is not the correct old password' };
  }

  if (oldPassword === newPassword) {
    return { error: 'Old Password and New Password match exactly' };
  }

  // Check if the newPassword has been used before
  if (user.oldPasswords.includes(newPassword)) {
    return { error: 'New Password has already been used before by this user.' };
  }

  const passwordValidation = isValidPassword(newPassword);
  // Check if the returned object from isValidPassword helper function has an
  // error field
  if (passwordValidation.error) {
    // Return the error if validation fails
    return passwordValidation;
  }

  // Add the current password to oldPasswords array
  user.oldPasswords.push(user.currentPassword);
  user.currentPassword = newPassword;
  return {};
};
