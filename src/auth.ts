/// ///----EXTERNAL FILES-----/////

/// //////////// UNCOMMENT THIS LINE BELOW //////////////
// import { TokenType } from 'yaml/dist/parse/cst.js';
import {
  getData,
  setData
} from './dataStore';

import {
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
  generateRandomId
} from './helperFunctions';

import validator from 'validator';

import sha256 from 'crypto-js/sha256';
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
 * @returns {tokenReturn} - An object containing a token upon successful registration
 */

export const adminAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): tokenReturn => {
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

  isValidPassword(password);
  // Check if the returned object from isValidPassword helper function has an

  const hashedPassword = sha256(password).toString();
  const authUserId = generateRandomId();

  data.users.push({
    userId: authUserId,
    email: email,
    currentPassword: hashedPassword,
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
 * @returns {tokenReturn} - An object containing a token upon successful registration
 */
export const adminAuthLogin = (email: string, password: string): tokenReturn => {
  const data = getData();
  // Find the user by email
  const user = data.users.find((user) => user.email === email);
  if (!user) {
    throw new Error('EMAIL_NOT_EXISTS');
  }

  // Check if the password is correct
  if (user.currentPassword !== sha256(password).toString()) {
    // Increment numFailedPasswordsSinceLastLogin
    user.numFailedPasswordsSinceLastLogin += 1;
    throw new Error('PASSWORD_INCORRECT');
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
 * @returns {userDetails} - An empty containting the user's details upon successful registration
 */
export const adminUserDetails = (token: string): userDetails => {
  const data = getData();
  // get userId
  const tokenValidation = validateToken(token, data);

  const authUserId = tokenValidation.authUserId;

  const user = data.users.find((user) => user.userId === authUserId);

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
 * @returns {emptyReturn} - An empty upon successful registration
 */
export const adminUserDetailsUpdate = (
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);

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
 * @returns {emptyReturn} - An empty upon successful registration
 */
export const adminUserPasswordUpdate = (
  token: string,
  oldPassword: string,
  newPassword: string
): emptyReturn => {
  const data = getData();
  // get userId from token
  const tokenValidation = validateToken(token, data);

  const authUserId = tokenValidation.authUserId;

  const user = data.users.find(user => user.userId === authUserId);

  if (user.currentPassword !== sha256(oldPassword).toString()) {
    throw new Error('WRONG_PASSWORD');
  }

  if (oldPassword === newPassword) {
    throw new Error('OLD_PASSWORD_REUSE');
  }

  // Check if the newPassword has been used before
  if (user.oldPasswords.includes(sha256(newPassword).toString())) {
    throw new Error('NEW_PASSWORD_USED');
  }

  isValidPassword(newPassword);

  // Add the current password to oldPasswords array
  user.oldPasswords.push(user.currentPassword);
  user.currentPassword = sha256(newPassword).toString();
  setData(data);
  return {};
};

/**
 * Logs out a user by deleting their session token.
 *
 * @param {string} token - The authentication token of the user
 *
 * @returns {emptyReturn} - An empty upon successful registration
 */
export const adminAuthLogout = (token: string): emptyReturn => {
  const data = getData();

  const validation = validateToken(token, data);

  const sessionIndex = data.sessions.findIndex(
    (session) => session.userId === validation.authUserId);

  data.sessions.splice(sessionIndex, 1);
  setData(data);

  return { };
};
