//////----EXTERNAL FILES-----/////
import {getData, setData} from "./dataStore.js"
import validator from 'validator';

/////------ASSUMPTIONS----//////
// assume functions are case sensitive
// assume white space is kept

/////-----GLOBAL VARIABLES------/////
const data = getData();


/**
 * Register a user with an email, password, and names, then returns their authUserId value.
 * 
 * @param {string} email 
 * @param {string} password
 * 
 * @returns {integer} authUserId
*/

const adminAuthRegister = (email, password, nameFirst, nameLast) => {  
  // 1. Email address is used by another user.
  const isEmailUsed = data.users.some(user => user.email === email);
  if (isEmailUsed) {
    return { "error": "Email already used" };
  }

  // 2. Validate password length
  if (password.length < 8) {
    return { "error": "Password is too short" };
  }

  // 3. Validate email format
  if (!validator.isEmail(email)) {
    return { "error": "Invalid email format" };
  }

  // 4. Validate first name (NameFirst)
  const namePattern = /^[a-zA-Z'-\s]+$/;
  if (!namePattern.test(nameFirst)) {
    return { "error": "NameFirst contains invalid characters." };
  }
  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { "error": "NameFirst must be between 2 and 20 characters." };
  }

  // 5. Validate last name (NameLast)
  if (!namePattern.test(nameLast)) {
    return { "error": "NameLast contains invalid characters." };
  }
  if (nameLast.length < 2 || nameLast.length > 20) {
    return { "error": "NameLast must be between 2 and 20 characters." };
  }

  // 6. Check that password contains at least one number and one letter
  const containsLetter = /[a-zA-Z]/.test(password);
  const containsNumber = /\d/.test(password);
  if (!containsLetter || !containsNumber) {
    return { "error": "Password must contain at least one letter and one number." };
  }

  // 7. Register the user and update the data
  const authUserId = data.users.length + 1;
  data.users.push({
    authUserId: authUserId,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    name: `${nameFirst} ${nameLast}`,
  });

  return authUserId ;
}
export {adminAuthRegister}

/**
  * Given a registered user's email and password returns their authUserId value.
  * 
  * @param {string} email - description of paramter
  * @param {string} password - description of parameter
  * 
  * 
  * @returns {integer} - UserId
*/
const adminAuthLogin = ( email, password ) => {
  return {
    authUserId: 1
  }
}

/**
  * Given an admin user's authUserId, return details about the user.
    "name" is the first and last name concatenated with a single space between them.
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
const adminUserDetails = ( authUserId ) => {
  return { user:
    {
      userId: 1,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
    }
  }
}


/**
 * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
 * 
 * @param {integer} authUserId - authUserId
 * @param {string} email - email
 * @param {string} nameFirst - First name
 * @param {string} nameLast - Last name
 * ...
 * @return {} no return;
*/
const adminUserDetailsUpdate = ( authUserId, email, nameFirst, nameLast ) => {

  // Check if authUserId is valid
  const currentUser = data.users.find(user => user.authUserId === authUserId);
  if (!currentUser) {
      return { error: 'AuthUserId is not a valid user.' };
  }

  // Check if email is valid
  if (!validator.isEmail(email)) {
      return { error: 'Invalid email format.' };
  }

  // Check if email is already used by another user (excluding the current authorised user)
  const emailInUse = data.users.find(user => user.email === email && user.authUserId !== authUserId);
  if (emailInUse) {
      return { error: 'Email is currently used by another user.' };
  }

  // Validate NameFirst (2-20 chars, and valid characters)
  if (nameFirst.length < 2 || nameFirst.length > 20) {
      return { error: 'NameFirst is less than 2 characters or more than 20 characters.' };
  }
  if (!/^[A-Za-z\s'-]+$/.test(nameFirst)) {
      return { error: 'NameFirst contains invalid characters.' };
  }

  // Validate NameLast (2-20 chars, and valid characters)
  if (nameLast.length < 2 || nameLast.length > 20) {
      return { error: 'NameLast is less than 2 characters or more than 20 characters.' };
  }
  if (!/^[A-Za-z\s'-]+$/.test(nameLast)) {
      return { error: 'NameLast contains invalid characters.' };
  }

  currentUser.email = email;
  currentUser.nameFirst = nameFirst;
  currentUser.nameLast = nameLast;
  
  return {};
}

/**
  * Given details relating to a password change, update the password of a logged in user.
  * 
  * @param {integer} authUserId - description of paramter
  * @param {string} oldPassword - oldPassword
  * @param {string} newPassword - newPassword
  * ...
  * @return {} no return;
*/
const adminUserPasswordUpdate = ( authUserId, oldPassword, newPassword  ) => {
    return { }
}

export const dataStructure = () => data; 
