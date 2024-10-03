import {getData} from "./dataStore.js"
/**
  * Provide a list of all quizzes that are owned by 
  * the currently logged in user.
  * 
  * @param {integer} authUserId - authUserId
  * 
  * @return {quizzes : [
  *     {
  *       quizId : integer 
  *       name : string
  *     }
  * ]}
*/
export const adminQuizList = (authUserId) => {
  const data = getData();
  // Find the user based on authUserId
  const user = data.users.find(user => user.userId === authUserId);
  
  // Check if the user exists
  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  // Find all quizzes owned by the user
  const userQuizzes = data.quizzes
    .filter(quiz => quiz.ownerId === authUserId)
    .map(quiz => ({
      quizId: quiz.quizId,
      name: quiz.name
    }));

  // Return the list of quizzes (empty array if no quizzes found)
  return { quizzes: userQuizzes };
};

/**
 * Checks if the provided user ID refers to a valid user.
 *
 * @param {string} authUserId - the user ID to be validated.
 * @returns {boolean} - returns true if the user exists, false otherwise.
 *
 */
export const isUserValid = (authUserId) => {
  //loop thru users array and match authUserId
  const data = getData();
  const user = data.users.find(users => users.userId === authUserId);

  //check if user valid
  if (user) {
    return true;
  }

  return false;
}

/**
  * Given basic details about a new quiz, create one for the logged in user.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {string} name - name of new quiz
  * @param {string} description - description of new quiz for logged in user
  * 
  * @returns {integer} - id of quiz
*/
export const adminQuizCreate = (authUserId, name, description) => {
  const data = getData();

  //checks if user is valid
  if (!isUserValid(authUserId)) {
    //if user not valid, return error
    return { error: "AuthUserId is not a valid user."};
  } 
  
  //checks for name length
  if (isNameLengthValid(name) !== undefined) {
    return isNameLengthValid(name);
  }

  //checks if check contains invalid characters
  if (!isStringValid(name)) {
    return { error: "Name contains invalid characters. Valid characters are alphanumeric and spaces."};
  }

  //checks for description is more than 100 characters
  if (description.length > 100) {
    return { error: "Description is more than 100 characters in length."};
  }

  //checks if quiz name is already used by another quiz the same user owns
  if (isNameTaken(authUserId, name)) {
    return { error: "Name is already used by the current logged in user for another quiz."};
  }
  
  //push new quiz object into db & return quizId
  const newQuiz = {
    quizId: data.quizzes.length,
    ownerId: authUserId,
    name: name,
    description: description,
    quiz: [],
    timeCreated: Math.floor(Date.now()),
    timeLastEdited: Math.floor(Date.now()),
  };


  data.quizzes.push(newQuiz);
  return { quizId: newQuiz.quizId };
}


/**
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * 
  * @returns {} - empty object
*/
export const adminQuizRemove = (authUserId, quizId) => {
  const data = getData();
  const error = isValidQuiz(authUserId, quizId, data);
  if (error) {
    return error;
  }  

  // remove the correct quiz
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);
  data.quizzes.splice(validQuizId, 1);

  return {};
}

/**
  * Get all of the relevant information about the current quiz.
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * 
  * @returns {object} - struct containing info for quiz 
*/
export const adminQuizInfo = (authUserId, quizId) => {
  const data = getData();

  // Check if authUserId is valid
  const user = data.users.find(user => user.userId === authUserId);
  if (!user) {
    return { error: 'authUserId is not a valid user.' };
  }

  // Check if quizId refers to a valid quiz
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: 'quizId does not refer to a valid quiz.' };
  }

  // Check if the quiz belongs to the given user
  if (quiz.ownerId !== authUserId) {  
    return { error: 'quizId does not refer to a quiz that this user owns.' };
  }

  // Return the quiz information
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
  };
}

/**
  * checks if string contains invalid characters
  * 
  * @param {string}  - any string user inputs
  * 
  * @returns {boolean} - false if string contains non alphanumeric 
*/
const isStringValid = (string) => {
  const containsInvalidChar = /[^a-zA-Z0-9\s]/.test(string);
  //checks if string contains invalid char
  if (containsInvalidChar) {
    return false;
  }
  
  return true;
}

//helper function: checks for valid name length
//function will return false if name length is < 3 or > 30
//return true if otherwise

/**
  * checks for length of name, returns error if name < 3 or > 30
  * 
  * @param {string} name - any string name
  * 
  * @returns {object} - returns specific error object depending on name length 
*/
const isNameLengthValid = (name) => {
    if (name.length < 3) {
      //if length is less than 3 char
      return { error: "Name is less than 3 characters." };
    } else if (name.length > 30) {
        //if length is more than 30 char
      return { error: "Name is more than 30 characters." };
    }

  return undefined;
}

//helper function: checks if the user has quizzes with same name
//function willl return true if they do
//return false if otherwise

/**
  * checks if name is already taken
  * 
  * @param {number}  authUserId - user's Id
  * @param {string}  name - any string name
  * 
  * @returns {boolean} - returns false if name is already taken 
*/
const isNameTaken = (authUserId, name) => {
  const data = getData();
  return data.quizzes.some((quiz) => {return (quiz.ownerId === authUserId &&
    name === quiz.name )});
}


/**
  * Update the name of the relevant quiz
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * @param {string} name - quiz name
  * 
  * @returns {} - empty object
*/
export const adminQuizNameUpdate = (authUserId, quizId, name) => {
  const data = getData(); 

  if (!isUserValid(authUserId)) {
    return { error: "AuthUserId is not a valid user."};
  } 

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: "Quiz ID does not refer to a valid quiz." };
  }
  if (quiz.ownerId !== authUserId) {
    return { error: "Quiz ID does not refer to a quiz that this user owns." };
  }

  //check if name contains invalid characters
  if (!isStringValid(name)) {
    return { error: "Name contains invalid characters. Valid characters are alphanumeric and spaces."};
  }
  //checks for name length
  if (isNameLengthValid(name) !== undefined) {
    return isNameLengthValid(name);
  }
  //check if user has duplicate quiz names 
  if (isNameTaken(authUserId, name)) {
    return { error: "Name is already used by the current logged in user for another quiz."};
  }

  quiz.name = name;
  // Update timeLastEdited
  quiz.timeLastEdited = Math.floor(Date.now());
  return { };
}


/**
  * Update the description of the relevant quiz
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * @param {string} description - quiz name
  * 
  * @returns {} - empty object
*/
export const adminQuizDescriptionUpdate = (authUserId, quizId, description) => {
  const data = getData();
  // error checkings for invalid userId, quizId
  const error = isValidQuiz(authUserId, quizId, data);
  if (error) {
    return error;
  }
  // new description should be less then 100 characters
  if(description.length > 100) {
    return { error: 'Description too long! (has to be less then 100 characters)'};
  }
  // update description and timeLastEdited
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);
  validQuizId.description = description;
  validQuizId.timeLastEdited = Math.floor(Date.now());
  return { }
}

/**
 * Validates if a quiz is associated with a valid user and is owned by that user.
 *
 * @param {string} authUserId - the user ID of the authorized user.
 * @param {string} quizId - the ID of the quiz to be validated.
 * @param {object} data - the dataset containing user and quiz information.
 * @returns {object|null} - an error object if validation fails, or null if the quiz and user are valid.
 *
 */
const isValidQuiz = (authUserId, quizId, data) => {
  const validUserId = data.users.find(user => user.userId === authUserId);
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);
  const validOwnerId = data.quizzes.find(quiz => quiz.ownerId === authUserId);
  
  // check invalid user id
  if (!validUserId) {
    return { error: 'AuthUserId is not valid.' };
  } else if (!validQuizId) {
    // invalid quiz id
    return { error: 'QuizID does not refer to a valid quiz.' };
  } else if (!validOwnerId) {
    // quiz id does not refer to it's owner
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }
  return null;
}