import { getData } from "./dataStore"
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
export const adminQuizList = ( authUserId  ) => {
  return { quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  }
}

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
  
    //checks for length of name
    if (name.length < 3) {
      //if length is less than 3 char
      return { error: "Name is less than 3 characters." };
    } else if (name.length > 30) {
        //if length is more than 30 char
      return { error: "Name is more than 30 characters." };
    }

    //checks for invalid characters 
    for (let i = 0; i < name.length; i++) {
      let char = name[i];

      if (!(char >= 'a' && char <= 'z') && 
          !(char >= 'A' && char <= 'Z') && 
          !(char >= '0' && char <= '9') && 
          char !== ' ') {

        return { error: "Name contains invalid characters. Valid characters are alphanumeric and spaces."};
      }
    }

    //checks for description is more than 100 characters
    if (description.length > 100) {
      return { error: "Description is more than 100 characters in length."};
    }

    //checks if quiz name is already used by another quiz the same user owns
    for (let i = 0; i < data.quizzes.length; i++) {
      if (data.quizzes[i].ownerId === authUserId &&
          name === data.quizzes[i].name
      ) {
        return { error: "Name is already used by the current logged in user for another quiz."};
      }
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
  return { }
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
  return {
      quizId: 1,
      name: 'My Quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'This is my quiz',
  }
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
  return { }
}


/**
  * Update the description of the relevant quiz
  * 
  * @param {integer} authUserId - id of authUser
  * @param {integer} quizId - id of quiz
  * @param {string} name - quiz name
  * 
  * @returns {} - empty object
*/
export const adminQuizDescriptionUpdate = (authUserId, quizId, name) => {
  return { }
}