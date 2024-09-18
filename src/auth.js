/**
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
  * <Brief description of what the function does>
  * 
  * @param {string} email - description of paramter
  * @param {string} password - description of parameter
  * ...
  * 
  * @returns {Integers} - UserId
*/

const adminAuthLogin = ( email, password ) => {
  return {
    authUserId: 1
  }
}

/**
  * @param {Integers} authUserId - authUserId
  * @param {String} email - email
  * @param {String} nameFirst - First name
  * @param {String} nameLast - Last name
  * ...
  * @return {} no return;
*/
const adminUserDetailsUpdate = ( authUserId, email, nameFirst, nameLast ) => {
    return { }
}

/**
  * <Brief description of what the function does>
  * 
  * @param {Integers} authUserId - description of paramter
  * @param {String} oldPassword - oldPassword
  * @param {String} newPassword - newPassword
  * ...
  * @return {} no return;
*/
const adminUserPasswordUpdate = ( authUserId, oldPassword, newPassword  ) => {
    return { }
}

/**
  * <Brief description of what the function does>
  * 
  * @param {Integers} authUserId - authUserId
  * 
  * @return {quizzes : [
  *     {
  *     quizId : Integers 
  *     name : String
  *     }
  * ]}
  * 
*/
const adminQuizList = ( authUserId  ) => {
    return { quizzes: [
        {
          quizId: 1,
          name: 'My Quiz',
        }
      ]
    }
}
