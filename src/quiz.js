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
const adminQuizList = (authUserId) => {
  const { users, quizzes } = getData();
  const user = users.find(u => u.authUserId === authUserId);
  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  const user_quizzes = quizzes.filter(quiz => quiz.ownerId === authUserId);
  const user_user_quizzes_details = user_quizzes.map(quiz => ({
    quizId: quiz.quizId,
    name: quiz.name
  }));
  return { quizzes: user_user_quizzes_details };
};
 
export {adminQuizList}

//helper function: checks if user is valid
//function will return true if auth is a valid user
//false if invalid user
export const isUserValid = (authUserId) => {
  //loop thru users array and match authUserId
  const data = getData();

  for (let i = 0; i < data.users.length; i++) {
    if (authUserId === data.users[i].authUserId) {
      return true;
    }
  }

  return false;
}

//helper function: checks if string contains invalid characters
//function will return false if string contains invalid char
//return true if otherwise
const isStringValid = (string) => {
  for (let i = 0; i < string.length; i++) {
    let char = string[i];

    //loops through string
    if (!(char >= 'a' && char <= 'z') && 
        !(char >= 'A' && char <= 'Z') && 
        !(char >= '0' && char <= '9') && 
        char !== ' ') {
          //if invalid:
          return false;
    }
  }

  //if valid
  return true;
}

//helper function: checks for valid name length
//function will return false if name length is < 3 or > 30
//return true if otherwise
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
const isNameTaken = (authUserId, name) => {
  const data = getData();
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].ownerId === authUserId &&
        name === data.quizzes[i].name
    ) {
      return true;
    }
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

    //if user valid
  } else {
  
    //checks for name length
    if (isNameLengthValid(name) !== undefined) {
      return isNameLengthValid(name);
    }

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
  }

  //if all inputs are valid, push new quiz object into db & return quizId
  const newQuiz = {
    quizId: data.quizzes.length,
    ownerId: authUserId,
    name: name,
    description: description,
    quiz: [],
    timeCreated: Date.now(),
    timeLastEdited: Date.now(),
  };

  data.quizzes.push(newQuiz);
  return newQuiz.quizId;
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
  const user = data.users.find(user => user.authUserId === authUserId);
  if (!user) {
    return { error: 'authUserId is not a valid user.' };
  }

  // Check if quizId refers to a valid quiz
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: 'quizId does not refer to a valid quiz.' };
  }

  // Check if the quiz belongs to the given user
  // Assuming each quiz has an ownerId field to track ownership
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

  //2. if quizId not valid
  //3. if user does not own quiz
  //4. name contains invalid char
  //5. name length < 3 or > 30
  //6. name alr used.

  //check if userId is valid
  if (!isUserValid(authUserId)) {
    //if userId invalid
    return { error: "AuthUserId is not a valid user."};

    //userId valid
  } else { 

    //check if quizId is valid
    if (quizId > data.quizzes.length ||
        quizId < 0 ) {
          return { error: 'Quiz ID does not refer to a valid quiz.'};
    }

    //check if quizId belongs to user
    if (data.quizzes[quizId].ownerId !== authUserId) {
      return { error: "Quiz ID does not refer to a quiz that this user owns."};
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
  }

  //if inputs are valid
  data.quizzes[quizId].name = name;
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
  // update description
  const validQuizId = data.quizzes.find(quiz => quiz.quizId === quizId);
  validQuizId.description = description;
  return { }
}


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