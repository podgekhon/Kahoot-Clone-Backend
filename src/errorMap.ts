import { httpStatus } from './requestHelperFunctions';

export const errorMap: Record<string, { status: number, message: string }> = {
  INVALID_TOKEN: {
    status: httpStatus.UNAUTHORIZED,
    message: 'Token is empty or invalid (does not refer to valid logged in user session)'
  },
  INVALID_NAMEFIRST: {
    status: httpStatus.BAD_REQUEST,
    message: 'First name has an invalid format'
  },
  INVALID_NAMELAST: {
    status: httpStatus.BAD_REQUEST,
    message: 'Last name has an invalid format'
  },
  INVALID_QUIZ: {
    status: httpStatus.FORBIDDEN,
    message: 'Valid token is provided, but quiz doesn\'t exist.'
  },
  INVALID_OWNER: {
    status: httpStatus.FORBIDDEN,
    message: 'Valid token is provided, but user is not an owner of this quiz'
  },
  INVALID_QUESTION_ID: {
    status: httpStatus.BAD_REQUEST,
    message: 'Question Id does not refer to a valid question within this quiz.'
  },
  INVALID_QUESTION_LENGTH: {
    status: httpStatus.BAD_REQUEST,
    message: 'Question length must be between 5 and 50 characters.'
  },
  INVALID_ANSWER_COUNT: {
    status: httpStatus.BAD_REQUEST,
    message: 'There must be between 2 and 6 answer options.'
  },
  INVALID_TIME_LIMIT: {
    status: httpStatus.BAD_REQUEST,
    message: 'The question timeLimit is not a positive number.'
  },
  EXCEEDED_TOTAL_TIME_LIMIT: {
    status: httpStatus.BAD_REQUEST,
    message: 'The sum of the question timeLimits in the quiz exceeds 3 minutes.'
  },
  INVALID_POINTS: {
    status: httpStatus.BAD_REQUEST,
    message: 'Points must be between 1 and 10.'
  },
  INVALID_ANSWER_LENGTH: {
    status: httpStatus.BAD_REQUEST,
    message: 'Each answer must be between 1 and 30 characters.'
  },
  DUPLICATE_ANSWERS: {
    status: httpStatus.BAD_REQUEST,
    message: 'Duplicate answer options are not allowed.'
  },
  NO_CORRECT_ANSWER: {
    status: httpStatus.BAD_REQUEST,
    message: 'There must be at least one correct answer.'
  },
  INVALID_ANSWER_SUBMITTED: {
    status: httpStatus.BAD_REQUEST,
    message: 'Less than 1 answer ID was submitted.'
  },
  DUPLICATE_ANSWERS_SUBMITTED: {
    status: httpStatus.BAD_REQUEST,
    message: 'Duplicate answer IDs provided'
  },
  INVALID_ANSWERID: {
    status: httpStatus.BAD_REQUEST,
    message: 'Answer IDs are not valid for this particular question'
  },
  INVALID_POSITION: {
    status: httpStatus.BAD_REQUEST,
    message: 'NewPosition is less than 0 or greater than the number of questions.'
  },
  SAME_POSITION: {
    status: httpStatus.BAD_REQUEST,
    message: 'NewPosition is the same as the current question position.'
  },
  INVALID_USEREMAIL: {
    status: httpStatus.BAD_REQUEST,
    message: 'Email is not registered.'
  },
  BAD_USEREMAIL_FORMAT: {
    status: httpStatus.BAD_REQUEST,
    message: 'Invalid email format.'
  },
  USEREMAIL_INUSE: {
    status: httpStatus.BAD_REQUEST,
    message: 'Email is already used by another user.'
  },
  ALREADY_OWNS: {
    status: httpStatus.BAD_REQUEST,
    message: 'User currently owns this quiz.'
  },
  DUPLICATE_QUIZNAME: {
    status: httpStatus.BAD_REQUEST,
    message: 'User already has a quiz with the same name.'
  },
  DESCRIPTION_TOO_LONG: {
    status: httpStatus.BAD_REQUEST,
    message: 'Description is more than 100 characters in length.'
  },
  INVALID_QUIZ_THUMBNAIL_URL_START: {
    status: httpStatus.BAD_REQUEST,
    message: 'Quiz thumbnail URL must start with "http://" or "https://".'
  },
  INVALID_QUIZ_THUMBNAIL_URL_END: {
    status: httpStatus.BAD_REQUEST,
    message: 'Quiz thumbnail URL must end with ".jpg", ".jpeg", or ".png".'
  },
  INVALID_QUESTION_THUMBNAIL_URL: {
    status: httpStatus.BAD_REQUEST,
    message: 'Question thumbnail URL format is invalid'
  },
  QUIZ_NAME_TOO_LONG: {
    status: httpStatus.BAD_REQUEST,
    message: 'Quiz name is either less than 3 characters long or more than 30 characters long.'
  },
  INVALID_QUIZ_NAME: {
    status: httpStatus.BAD_REQUEST,
    message: 'Quiz name contains invalid characters. Valid characters are alphanumeric and spaces.'
  },
  WRONG_PASSWORD: {
    status: httpStatus.BAD_REQUEST,
    message: 'Old Password is not the correct old password.'
  },
  OLD_PASSWORD_REUSE: {
    status: httpStatus.BAD_REQUEST,
    message: 'Old Password and New Password match exactly.'
  },
  NEW_PASSWORD_USED: {
    status: httpStatus.BAD_REQUEST,
    message: 'New Password has already been used before by this user.'
  },
  INVALID_PASSWORD: {
    status: httpStatus.BAD_REQUEST,
    message:
    'New Password is less than 8 characters or' +
    'does not contain at least one number and at least one letter.'
  },
  QUIZ_NOT_IN_TRASH: {
    status: httpStatus.BAD_REQUEST,
    message: 'Quiz ID refers to a quiz that is not currently in the trash.'
  },
  QUIZ_IN_TRASH: {
    status: httpStatus.BAD_REQUEST,
    message: 'The quiz is in trash.'
  },
  AUTO_START_NUM_TOO_HIGH: {
    status: httpStatus.BAD_REQUEST,
    message: 'autoStartNum is a number greater than 50.'
  },
  TOO_MANY_ACTIVE_SESSIONS: {
    status: httpStatus.BAD_REQUEST,
    message: '10 sessions that are not in END state currently exist for this quiz.'
  },
  NO_QUESTIONS_IN_QUIZ: {
    status: httpStatus.BAD_REQUEST,
    message: 'The quiz does not have any questions in it.'
  },
  EXIST_PLAYERNAME: {
    status: httpStatus.BAD_REQUEST,
    message: 'Name of user entered is not unique.'
  },
  INVALID_PLAYERNAME: {
    status: httpStatus.BAD_REQUEST,
    message: 'Name contains invalid characters.'
  },
  EXIST_PLAYERID: {
    status: httpStatus.BAD_REQUEST,
    message: 'Player ID does not exist.'
  },
  INVALID_SESSIONID: {
    status: httpStatus.BAD_REQUEST,
    message: 'Session Id does not refer to a valid session.'
  },
  SESSION_NOT_IN_LOBBY: {
    status: httpStatus.BAD_REQUEST,
    message: 'Session is not in LOBBY state.'
  },
  SESSION_IN_LOBBY_COUNTDOWN_RESULTS_END: {
    status: httpStatus.BAD_REQUEST,
    message: 'Session is in LOBBY, QUESTION_COUNTDOWN, FINAL_RESULTS or END state.'
  },
  SESSION_NOT_ON_QUESTION: {
    status: httpStatus.BAD_REQUEST,
    message: 'Session is not currently on this question.'
  },
  INVALID_QUESTION_POSITION: {
    status: httpStatus.BAD_REQUEST,
    message: 'Question position is not valid for the session this player is in.'
  },
  SESSION_NOT_IN_FINAL_RESULT: {
    status: httpStatus.BAD_REQUEST,
    message: 'Session is not in FINAL_RESULT state.'
  },
  SESSION_NOT_OPEN: {
    status: httpStatus.BAD_REQUEST,
    message: 'Session is not in QUESTION_OPEN state.'
  },
  SESSION_NOT_IN_END: {
    status: httpStatus.BAD_REQUEST,
    message: 'There is a session for this quiz is not in END state.'
  },
  SESSION_NOT_ACTIVE: {
    status: httpStatus.BAD_REQUEST,
    message: 'Session not found in active sessions of the quiz'
  },
  PLAYERID_NOT_EXIST: {
    status: httpStatus.BAD_REQUEST,
    message: 'Player ID does not exist'
  },
  INVALID_ACTION: {
    status: httpStatus.BAD_REQUEST,
    message: 'Invalid admin action.'
  },
  INVALID_PLAYER: {
    status: httpStatus.BAD_REQUEST,
    message: 'Player ID does not exist.'
  },
  INVALID_MESSAGE_LENGTH: {
    status: httpStatus.BAD_REQUEST,
    message: 'Message body is less than 1 character or more than 100 characters.'
  },
  INVALID_QUIZ_SESSION: {
    status: httpStatus.BAD_REQUEST,
    message: 'INVALID_QUIZ_SESSION'
  }
};
