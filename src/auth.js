/**
 * Register a user with an email, password, and names, then returns their authUserId value.
 * 
 * @param {string} email 
 * @param {string} password
 * 
 * @returns {Integers} authUserId
*/
const adminAuthRegister = ( email, password, nameFirst, nameLast ) => {
    return {
        authUserId: 1
    }
}

/**
  * Given a registered user's email and password returns their authUserId value.
  * 
  * @param {string} email - description of paramter
  * @param {string} password - description of parameter
  * 
  * 
  * @returns {Integers} - UserId
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
  * @param {Integers} authUserId - description of paramter
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
 * @param {Integer} authUserId - authUserId
 * @param {string} email - email
 * @param {string} nameFirst - First name
 * @param {string} nameLast - Last name
 * ...
 * @return {} no return;
*/
const adminUserDetailsUpdate = ( authUserId, email, nameFirst, nameLast ) => {
    return { }
}

/**
  * Given details relating to a password change, update the password of a logged in user.
  * 
  * @param {Integer} authUserId - description of paramter
  * @param {string} oldPassword - oldPassword
  * @param {string} newPassword - newPassword
  * ...
  * @return {} no return;
*/
const adminUserPasswordUpdate = ( authUserId, oldPassword, newPassword  ) => {
    return { }
}