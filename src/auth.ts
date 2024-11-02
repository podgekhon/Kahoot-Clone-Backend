/// ///----EXTERNAL FILES-----/////

/// //////////// UNCOMMENT THIS LINE BELOW //////////////
// import { TokenType } from 'yaml/dist/parse/cst.js';
import { getData, setData } from './dataStore';
import {
  errorMessages,
  tokenReturn,
  userDetails,
  emptyReturn
} from './interface';

import {
  validateToken,
  generateToken,
  isEmailUsed,
  isNameValid,
  isValidPassword,
  randomId
} from './helperFunctions';

import validator from 'validator';
/// //------ASSUMPTIONS----//////
// assume functions are case sensitive
// assume white space is kept

/**
 * Register a user with an email, password, and names, then returns their token.
 *
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @param {string} nameFirst - The user's first name
 * @param {string} nameLast - The user's last name
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {tokenReturn} - An object containing a token upon successful registration
 */

export const adminAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): errorMessages | tokenReturn => {
  const data = getData();

  if (isEmailUsed(email, data)) {
    throw new Error('Email already used');
  }

  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (!isNameValid(nameFirst)) {
    throw new Error('First name invalid');
  }

  if (!isNameValid(nameLast)) {
    throw new Error('Last name invalid');
  }

  const passwordValidation = isValidPassword(password);
  // Check if the returned object from isValidPassword helper function has an
  // error field
  if (passwordValidation.error) {
    // Return the error if validation fails
    throw new Error('password invalid');
  }

  // Register the user and update the data
  const authUserId = randomId(100000);

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

  const token = generateToken(authUserId, data);
  setData(data);

  return { token };
};

/**
 * Given a registered user's email and password, returns their token upon successful login.
 *
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {tokenReturn} - An object containing a token upon successful registration
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
  const token = generateToken(user.userId, data);
  setData(data);
  return { token };
};

/**
 * Given a user's token, returns detailed information about the user.
 *
 * @param {string} token - The authentication token of the user
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {userDetails} - An empty containting the user's details upon successful registration
 */
export const adminUserDetails = (token: string): errorMessages | userDetails => {
  const data = getData();
  // get userId
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    return { error: 'invalid token' };
  }
  const authUserId = tokenValidation.authUserId;

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
 * Update the email, first name, and last name of a logged-in user.
 *
 * @param {string} token - The authentication token of the logged-in user
 * @param {string} email - The new email address to be set
 * @param {string} nameFirst - The new first name to be set
 * @param {string} nameLast - The new last name to be set
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {emptyReturn} - An empty upon successful registration
 */
export const adminUserDetailsUpdate = (
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): errorMessages | emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    throw new Error('INVALID_TOKEN');
  }
  const authUserId = tokenValidation.authUserId;
  const currentUser = data.users.find(user => user.userId === authUserId);

  if (!validator.isEmail(email)) {
    throw new Error('BAD_USEREMAIL_FORMAT');
  }

  // Check if email is already used by another user
  // (excluding the current authorised user)
  const emailInUse = data.users.find(
    user => user.email === email &&
    user.userId !== authUserId
  );

  if (emailInUse) {
    throw new Error('USEREMAIL_INUSE');
  }

  if (!isNameValid(nameFirst)) {
    throw new Error('INVALID_NAMEFIRST');
  }

  if (!isNameValid(nameLast)) {
    throw new Error('INVALID_NAMELAST');
  }

  currentUser.email = email;
  currentUser.nameFirst = nameFirst;
  currentUser.nameLast = nameLast;
  setData(data);
  return {};
};

/**
 * Update the password of a logged-in user.
 *
 * @param {string} token - The authentication token of the logged-in user
 * @param {string} oldPassword - The user's current password
 * @param {string} newPassword - The new password to be set
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {emptyReturn} - An empty upon successful registration
 */
export const adminUserPasswordUpdate = (
  token: string,
  oldPassword: string,
  newPassword: string
): errorMessages | emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);
  if ('error' in tokenValidation) {
    throw new Error('INVALID_TOKEN');
  }
  const authUserId = tokenValidation.authUserId;

  const user = data.users.find(user => user.userId === authUserId);

  if (user.currentPassword !== oldPassword) {
    throw new Error('WRONG_PASSWORD');
  }

  if (oldPassword === newPassword) {
    throw new Error('OLD_PASSWORD_REUSE');
  }

  // Check if the newPassword has been used before
  if (user.oldPasswords.includes(newPassword)) {
    throw new Error('NEW_PASSWORD_USED');
  }

  const passwordValidation = isValidPassword(newPassword);
  // Check if the returned object from isValidPassword helper function has an
  // error field
  if (passwordValidation.error) {
    // Return the error if validation fails
    throw new Error('INVALID_PASSWORD');
  }

  // Add the current password to oldPasswords array
  user.oldPasswords.push(user.currentPassword);
  user.currentPassword = newPassword;
  setData(data);
  return {};
};

/**
 * Logs out a user by deleting their session token.
 *
 * @param {string} token - The authentication token of the user
 *
 * @returns {errorMessages} - An object containing an error message if registration fails
 * @returns {emptyReturn} - An empty upon successful registration
 */
export const adminAuthLogout = (token: string): errorMessages | emptyReturn => {
  const data = getData();

  const validation = validateToken(token, data);
  if ('error' in validation) {
    return { error: 'invalid token' };
  }

  const sessionIndex = data.sessions.findIndex(
    (session) => session.userId === validation.authUserId);

  if (sessionIndex === -1) {
    return { error: 'Session not found.' };
  }

  data.sessions.splice(sessionIndex, 1);
  setData(data);

  return { };
};
