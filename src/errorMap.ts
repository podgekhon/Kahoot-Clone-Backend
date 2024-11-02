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
  INVALID_THUMBNAIL_URL_START: {
    status: httpStatus.BAD_REQUEST,
    message: 'Thumbnail URL must start with "http://" or "https://".'
  },
  INVALID_THUMBNAIL_URL_END: {
    status: httpStatus.BAD_REQUEST,
    message: 'Thumbnail URL must end with ".jpg", ".jpeg", or ".png".'
  },
  QUIZ_NAME_TOO_LONG: {
    status: httpStatus.BAD_REQUEST,
    message: 'Quiz name is either less than 3 characters long or more than 30 characters long.'
  },
  INVALID_QUIZ_NAME: {
    status: httpStatus.BAD_REQUEST,
    message: 'Quiz name contains invalid characters. Valid characters are alphanumeric and spaces.'
  }
};
