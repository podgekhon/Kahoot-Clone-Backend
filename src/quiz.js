/**
  * Given basic details about a new quiz, create one for the logged in user.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
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
  * @returns {integer} - id of quiz
*/
const adminQuizRemove = (authUserId, quizId) => {
  return {
    
  }
}