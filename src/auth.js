import {getData, setData} from "./dataStore.js"
/**
 * Register a user with an email, password, and names, then returns their authUserId value.
 * 
 * @param {string} email 
 * @param {string} password
 * 
 * @returns {integer} authUserId
*/
export const adminAuthRegister = ( email, password, nameFirst, nameLast ) => {
  // let data = getData();

  // for (const user of data.users) {
  //   if (user.email === email) {
  //     return {"error": "Email already used"};
  //   }
  // }

  // if (password.length < 8) {
  //   return {"error": "Password is too short"};
  // }

  // data.users.push({
  //   email: email,
  //   password: passwords,
  //   name: `$(nameFirst) ${nameLast}`,
  // });
  
  return {
        authUserId: 1
    };
}

/**
  * Given a registered user's email and password returns their authUserId value.
  * 
  * @param {string} email - description of paramter
  * @param {string} password - description of parameter
  * 
  * 
  * @returns {integer} - UserId
*/
export const adminAuthLogin = ( email, password ) => {
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
export const adminUserDetails = ( authUserId ) => {
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
export const adminUserDetailsUpdate = ( authUserId, email, nameFirst, nameLast ) => {
    return { }
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
export const adminUserPasswordUpdate = ( authUserId, oldPassword, newPassword  ) => {
    return { }
}
