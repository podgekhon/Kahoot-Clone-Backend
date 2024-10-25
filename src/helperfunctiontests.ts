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
  adminQuizDuplicate,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizQuestionCreate,
  adminQuizQuestionRemove,
  adminQuizQuestionUpdate,
  adminQuizRemove,
  adminQuizRestore,
  adminQuizTransfer,
  adminTrashEmpty,
  adminTrashList
} from './quiz';

// clear
/**
 * call a http request to clear everything
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
 * make http request to register a user
 * @param { string } email
 * @param { string } password
 * @param { string } nameFirst
 * @param { string } nameLast
 * @returns
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
 * make http request to login a suer
 * @param { string } email
 * @param { string } password
 * @returns
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
 * make http request to update password
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
 * make http request to get user details
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
 * make http request to update user details
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

// adminQuizList
/**
 * make http request to get list of quizzes
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
 * make http request to create a quiz
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

// adminQuizRemove
/**
 * make http request to remove a quiz
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
 * make http request to get quiz information
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

// adminQuizNameUpdate
/**
 * make http request to update quiz name
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
 * make http request to update a quiz description
 * @param { number } quizId
 * @param { string } token
 * @param { string } description
 * @returns
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

// adminAuthLogout
/**
 * make http request to log out a user
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
 * make http request to list quizzes in the trash
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
 * make http request to restore a quiz
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
 * make http request to empty a trash
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
 * make http request to transfer a quiz to antoher user
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
 * make http request to create a question
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
 * make http request to update a question
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
 * make http requets to remove a question
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
 * make http request to move a question to a new position
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
 * make http request to duplicate a quiz
 * @param { number } quizId
 * @param { number } questionId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizQuestionDuplicate = (
  quizId: number, questionId: number, token: string
): {
  body: ReturnType <typeof adminQuizDuplicate>,
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
