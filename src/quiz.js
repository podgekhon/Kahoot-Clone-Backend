/**
  * Given basic details about a new quiz, create one for the logged in user.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} name - name of new quiz
  * @param {strings} description - description of new quiz for logged in user
  * 
  * @returns {integer} - id of quiz
*/

const adminQuizCreate = (authUserId, name, description) => {
    return {
        quizId: 2
    }
}

/**
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * 
  * @returns {}
*/
const adminQuizRemove = (authUserId, quizId) => {
  return {
    
  }
}

/**
  * Get all of the relevant information about the current quiz.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * 
  * @returns {object} - struct containing info for quiz 
*/
const adminQuizInfo = (authUserId, quizId) => {
  return {
      quizId: 1,
      name: 'My Quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'This is my quiz',
    }
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