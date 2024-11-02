import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100000;

export enum httpStatus {
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  SUCCESSFUL_REQUEST = 200,
}

import { clear } from './other';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminAuthLogout,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate
} from './auth';

import {
  adminQuizInfo,
  adminMoveQuizQuestion,
  adminQuizCreate,
  adminQuizDescriptionUpdate,
  adminQuizQuestionDuplicate,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizQuestionCreate,
  adminQuizQuestionRemove,
  adminQuizQuestionUpdate,
  adminQuizRemove,
  adminQuizRestore,
  adminQuizTransfer,
  adminTrashEmpty,
  adminTrashList,
  adminQuizUpdateThumbnail
} from './quiz';

// clear
/**
 * Makes a http request to clear everything
 *
 * @returns {} - empty object
 */
export const requestClear = (): {
  body: ReturnType <typeof clear>
  statusCode: number
} => {
  const res = request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminAuthRegister
/**
 * Makes http request to register a user
 *
 * @param { string } email
 * @param { string } password
 * @param { string } nameFirst
 * @param { string } nameLast
 * @returns { Response }
 */
export const requestAdminAuthRegister = (
  email: string, password: string, nameFirst: string, nameLast: string
): {
  body: ReturnType <typeof adminAuthRegister>,
  statusCode: number
} => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast
    },
    timeout: TIMEOUT_MS
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminAuthLogin
/**
 * Makes http request to login a user
 *
 * @param { string } email
 * @param { string } password
 * @returns { Response }
 */
export const requestAdminAuthLogin = (
  email: string, password: string
): {
  body: ReturnType<typeof adminAuthLogin>
  statusCode: number
} => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: {
      email: email,
      password: password,
    },
    timeout: TIMEOUT_MS
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminUserPasswordUpdate
/**
 * Makes http request to update password
 *
 * @param { string } token
 * @param { string } oldPassword
 * @param { string } newPassword
 * @returns { Response }
 */
export const requestAdminUserPasswordUpdate = (
  token: string, oldPassword: string, newPassword: string
): {
  body: ReturnType <typeof adminUserPasswordUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/password',
    {
      json: {
        token: token,
        oldPassword: oldPassword,
        newPassword: newPassword
      },
      timeout: TIMEOUT_MS
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminUserDetails
/**
 * Makes http request to get user details
 *
 * @param { string } token
 * @returns
 */
export const requestAdminUserDetails = (
  token: string
): {
  body: ReturnType <typeof adminUserDetails>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/user/details',
    {
      qs: { token },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminUserDetailsUpdate
/**
 * Makes http request to update user details
 * @param { string } token
 * @param { string } email
 * @param { string } nameFirst
 * @param { string } nameLast
 * @returns { Response }
 */
export const requestAdminUserDetailsUpdate = (
  token: string, email: string, nameFirst: string, nameLast: string
): {
  body: ReturnType <typeof adminUserDetailsUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/details',
    {
      json: {
        token: token,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast
      },
      timeout: TIMEOUT_MS
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};


// adminUserDetailsUpdateV2
/**
 * Makes http request to update user details
 * @param { string } token
 * @param { string } email
 * @param { string } nameFirst
 * @param { string } nameLast
 * @returns { Response }
 */
export const requestAdminUserDetailsUpdateV2 = (
  token: string, email: string, nameFirst: string, nameLast: string
): {
  body: ReturnType <typeof adminUserDetailsUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + '/v2/admin/user/details',
    {
      headers: {
        token: token
      },
      json: {
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast
      },
      timeout: TIMEOUT_MS
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};



// adminQuizList
/**
 * Makes http request to get list of quizzes
 *
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizList = (
  token: string
): {
  body: ReturnType <typeof adminQuizList>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: { token },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizCreate
/**
 * Makes http request to create a quiz
 *
 * @param { string } token
 * @param { string} name
 * @param { string} description
 * @returns { Response }
 */
export const requestAdminQuizCreate = (
  token: string, name: string, description: string
): {
  body: ReturnType <typeof adminQuizCreate>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: {
        token: token,
        name: name,
        description: description,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizCreate
/**
 * Makes http request to create a quiz
 *
 * @param { string } token
 * @param { string} name
 * @param { string} description
 * @returns { Response }
 */
export const requestAdminQuizCreateV2 = (
  token: string, name: string, description: string
): {
  body: ReturnType <typeof adminQuizCreate>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/quiz',
    {
      headers: {
        token: token
      },
      json: {
        token: token,
        name: name,
        description: description,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizRemove
/**
 * Makes http request to remove a quiz
 *
 * @param { number } quizId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizRemove = (
  quizId: number, token: string
): {
  body: ReturnType <typeof adminQuizRemove>,
  statusCode: number
} => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: { token },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizInfo
/**
 * Makes http request to get quiz information
 *
 * @param { number } quizId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizInfo = (
  quizId: number, token: string
): {
  body: ReturnType <typeof adminQuizInfo>,
  statusCode: number,
} => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: { token },
      timeout: TIMEOUT_MS,
    }
  );

  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizInfoV2
/**
 * Makes http request to get quiz information v2
 *
 * @param { number } quizId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizInfoV2 = (
  quizId: number, token: string
): {
  body: ReturnType <typeof adminQuizInfo>,
  statusCode: number,
} => {
  const res = request(
    'GET',
    SERVER_URL + `/v2/admin/quiz/${quizId}`,
    {
      headers: { token },
      timeout: TIMEOUT_MS,
    }
  );

  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizNameUpdate
/**
 * Makes http request to update quiz name
 *
 * @param { number } quizId
 * @param { string } token
 * @param { string } name
 * @returns { Response }
 */
export const requestAdminQuizNameUpdate = (
  quizId: number, token: string, name: string
): {
  body: ReturnType <typeof adminQuizNameUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
    {
      json: {
        token: token,
        name: name,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizDescriptionUpdate
/**
 * Makes http request to update a quiz description
 *
 * @param { number } quizId
 * @param { string } token
 * @param { string } description
 * @returns { Response }
 */
export const requestAdminQuizDescriptionUpdate = (
  quizId: number, token: string, description: string
): {
  body: ReturnType<typeof adminQuizDescriptionUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/description`,
    {
      json: {
        token: token,
        description: description,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes HTTP request to update a quiz thumbnail URL
 *
 * @param {number} quizId
 * @param {string} token
 * @param {string} thumbnailUrl
 * @returns { Response }
 */
export const requestAdminQuizUpdateThumbnail = (
  quizId: number,
  token: string,
  thumbnailUrl: string
): {
  body: ReturnType<typeof adminQuizUpdateThumbnail>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/thumbnail`,
    {
      headers: {
        token: token,
      },
      json: {
        thumbnailUrl: thumbnailUrl,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminAuthLogout
/**
 * Makes http request to log out a user
 *
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminAuthLogout = (
  token: string
): {
  body: ReturnType <typeof adminAuthLogout>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/logout',
    {
      json: {
        token: token,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminTrashList
/**
 * Makes http request to list quizzes in the trash
 *
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminTrashList = (
  token: string
): {
  body: ReturnType <typeof adminTrashList>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash',
    {
      qs: { token },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizRestore
/**
 * Makes http request to restore a quiz
 *
 * @param { number } quizId
 * @param { string } token
 * @returns
 */
export const requestAdminQuizRestore = (
  quizId: number, token: string
): {
  body: ReturnType <typeof adminQuizRestore>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/restore`,
    {
      json: {
        token: token,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminTrashEmpty
/**
 * Makes http request to empty a trash
 *
 * @param { string } token
 * @param { array  } quizIds - array of quiz ID
 * @returns { Response }
 */
export const requestAdminTrashEmpty = (
  token: string, quizIds: number[]
): {
  body: ReturnType <typeof adminTrashEmpty>,
  statusCode: number
} => {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/admin/quiz/trash/empty',
    {
      qs: { token, quizIds: JSON.stringify(quizIds) },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizTransfer
/**
 * Makes http request to transfer a quiz to antoher user
 *
 * @param { number } quizId
 * @param { string }token
 * @param { string } userEmail
 * @returns { Response }
 */
export const requestAdminQuizTransfer = (
  quizId: number, token: string, userEmail: string
): {
  body: ReturnType <typeof adminQuizTransfer>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    {
      json: {
        token: token,
        userEmail: userEmail,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizQuestionCreate
/**
 * Makes http request to create a question
 *
 * @param { number } quizId
 * @param { string } token
 * @param { object } questionBody - an object containing question details
 * @returns { Response }
 */
export const requestAdminQuizQuestionCreate = (
  quizId: number, token: string, questionBody: object
): {
  body: ReturnType <typeof adminQuizQuestionCreate>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
    {
      json: {
        token: token,
        questionBody: questionBody,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizQuestionUpdate
/**
 * Makes http request to update a question
 *
 * @param { number } quizId
 * @param { number } questionId
 * @param { string } token
 * @param { object } questionBody
 * @returns { Response }
 */
export const requestAdminQuizQuestionUpdate = (
  quizId: number, questionId: number, token: string, questionBody: object
): {
  body: ReturnType <typeof adminQuizQuestionUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      json: {
        token: token,
        questionBody: questionBody,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizQuestionRemove
/**
 * Makes http requets to remove a question
 *
 * @param { number } quizId
 * @param { number } questionId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizQuestionRemove = (
  quizId: number, questionId: number, token: string
): {
  body: ReturnType <typeof adminQuizQuestionRemove>,
  statusCode: number
} => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      qs: { token },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminMoveQuizQuestion
/**
 * Makes http request to move a question to a new position
 *
 * @param { number } quizId
 * @param { number } questionId
 * @param { string } token
 * @param { number } newPosition
 * @returns { Response }
 */
export const requestAdminMoveQuizQuestion = (
  quizId: number, questionId: number, token: string, newPosition: number
): {
  body: ReturnType <typeof adminMoveQuizQuestion>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/move`,
    {
      json: {
        token: token,
        newPosition: newPosition,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizQuestionDuplicate
/**
 * Makes http request to duplicate a quiz
 *
 * @param { number } quizId
 * @param { number } questionId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizQuestionDuplicate = (
  quizId: number, questionId: number, token: string
): {
  body: ReturnType <typeof adminQuizQuestionDuplicate>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      json: {
        token: token,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};
