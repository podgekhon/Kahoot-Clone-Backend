import request from 'sync-request-curl';
import { port, url } from './config.json';
import { adminAction, adminQuizSessionUpdate } from './quiz';

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
  adminQuizUpdateThumbnail,
  adminStartQuizSession,
  adminViewQuizSessions,
  adminQuizSessionState
} from './quiz';

import {
  joinPlayer,
  playerAnswerQuestion,
  playerMessage,
  playerState,
  playerMessageList,
  playerQuestion,
  playerResults
} from './player';

import {
  messageBody,
  requestOptions
} from './interface';

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

/**
 * Makes http request to update password
 *
 * @param { string } token
 * @param { string } oldPassword
 * @param { string } newPassword
 * @returns { Response }
 */
export const requestAdminUserPasswordUpdateV2 = (
  token: string, oldPassword: string, newPassword: string
): {
  body: ReturnType <typeof adminUserPasswordUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + '/v2/admin/user/password',
    {
      headers: {
        token: token
      },
      json: {
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

// adminUserDetails
/**
 * Makes http request to get user details
 *
 * @param { string } token
 * @returns
 */
export const requestAdminUserDetailsupdatev2 = (
  token: string
): {
  body: ReturnType <typeof adminUserDetails>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + '/v2/admin/user/details',
    {
      headers: {
        token: token
      },
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

/**
 * Makes http request to remove a quiz
 *
 * @param { number } quizId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizRemoveV2 = (
  quizId: number, token: string
): {
  body: ReturnType <typeof adminQuizRemove>,
  statusCode: number
} => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v2/admin/quiz/${quizId}`,
    {
      headers: {
        token: token
      },
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

// adminQuizNameUpdate v1
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

// adminQuizNameUpdate v2
/**
 * Makes http request to update quiz name
 *
 * @param { number } quizId
 * @param { string } token
 * @param { string } name
 * @returns { Response }
 */
export const requestAdminQuizNameUpdateV2 = (
  quizId: number, token: string, name: string
): {
  body: ReturnType <typeof adminQuizNameUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/name`,
    {
      headers: {
        token: token
      },
      json: {
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
 * Makes HTTP request to update a quiz description using v2 route
 *
 * @param { number } quizId
 * @param { string } token
 * @param { string } description
 * @returns { Response }
 */
export const requestAdminQuizDescriptionUpdateV2 = (
  quizId: number,
  token: string,
  description: string
): {
  body: ReturnType<typeof adminQuizDescriptionUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/description`,
    {
      headers: {
        token: token,
      },
      json: {
        description: description,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
  * Makes HTTP request to start a new session for a quiz.
  *
  * @param {number} quizId - the quizId to start a session for
  * @param {string} token  - the token of the user
  * @param {number} autoStartNum - the auto-start number for the session
  * @returns {Response}
  */
export const requestAdminStartQuizSession = (
  quizId: number, token: string, autoStartNum: number
): {
  body: ReturnType<typeof adminStartQuizSession>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/start`,
    {
      headers: {
        token: token
      },
      json: {
        autoStartNum: autoStartNum
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes HTTP request to view active and inactive sessions for a quiz.
 *
 * @param {number} quizId - the quizId to retrieve sessions for
 * @param {string} token - the token of the user
 * @returns {Response}
 */
export const requestAdminViewQuizSessions = (
  quizId: number, token: string
): {
  body: ReturnType<typeof adminViewQuizSessions>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/sessions`,
    {
      headers: {
        token: token
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

// adminAuthLogout v1
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

// adminAuthLogout v2
/**
 * Makes http request to log out a user
 *
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminAuthLogoutv2 = (
  token: string
): {
  body: ReturnType <typeof adminAuthLogout>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/auth/logout',
    {
      headers: {
        token: token,
      },
      json: {
        token: token,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminTrashList v1
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

// adminTrashList v2
/**
 * Makes http request to list quizzes in the trash
 *
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminTrashListv2 = (
  token: string
): {
  body: ReturnType <typeof adminTrashList>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + '/v2/admin/quiz/trash',
    {
      headers: {
        token: token
      },
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
/**
 * Makes http request to restore a quiz
 *
 * @param { number } quizId
 * @param { string } token
 * @returns
 */
export const requestAdminQuizRestoreV2 = (
  quizId: number, token: string
): {
  body: ReturnType <typeof adminQuizRestore>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/restore`,
    {
      headers: {
        token: token
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminTrashEmpty v1
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

// adminTrashEmpty v2
/**
 * Makes http request to empty a trash
 *
 * @param { string } token
 * @param { array  } quizIds - array of quiz ID
 * @returns { Response }
 */
export const requestAdminTrashEmptyV2 = (
  token: string, quizIds: number[]
): {
  body: ReturnType <typeof adminTrashEmpty>,
  statusCode: number
} => {
  const res = request(
    'DELETE',
    SERVER_URL + '/v2/admin/quiz/trash/empty',
    {
      headers: { token },
      qs: { quizIds: JSON.stringify(quizIds) },
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
const makeQuizTransferRequest = (
  quizId: number,
  token: string,
  userEmail: string,
  version: string,
  headers: Record<string, string> = {}
): { body: ReturnType <typeof adminQuizTransfer>, statusCode: number } => {
  const res = request(
    'POST',
    SERVER_URL + `/${version}/admin/quiz/${quizId}/transfer`,
    {
      headers,
      json: {
        token: token,
        userEmail: userEmail,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// v1 route
export const requestAdminQuizTransfer = (
  quizId: number, token: string, userEmail: string
) => makeQuizTransferRequest(quizId, token, userEmail, 'v1');

// v2 route
export const requestAdminQuizTransferV2 = (
  quizId: number, token: string, userEmail: string
) => makeQuizTransferRequest(quizId, token, userEmail, 'v2');

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

/**
 * Makes http request to create a question using v2 route
 *
 * @param { number } quizId
 * @param { string } token
 * @param { object } questionBody - an object containing question details
 * @returns { Response }
 */
export const requestAdminQuizQuestionCreateV2 = (
  quizId: number, token: string, questionBody: object
): {
  body: ReturnType <typeof adminQuizQuestionCreate>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question`,
    {
      headers: {
        token: token
      },
      json: {
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

/**
 * Makes http request to update a question using v2 route
 *
 * @param { number } quizId
 * @param { number } questionId
 * @param { string } token
 * @param { object } questionBody
 * @returns { Response }
 */
export const requestAdminQuizQuestionUpdateV2 = (
  quizId: number, questionId: number, token: string, questionBody: object
): {
  body: ReturnType <typeof adminQuizQuestionUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      headers: {
        token: token
      },
      json: {
        questionBody: questionBody,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizQuestionRemove v1
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
      qs: { token: token },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizQuestionRemove v2
/**
 * Makes http requets to remove a question
 *
 * @param { number } quizId
 * @param { number } questionId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizQuestionRemoveV2 = (
  quizId: number, questionId: number, token: string
): {
  body: ReturnType <typeof adminQuizQuestionRemove>,
  statusCode: number
} => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      headers: { token: token },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminMoveQuizQuestion
/**
 * Makes an HTTP request to move a question to a new position
 *
 * @param {number} quizId
 * @param {number} questionId
 * @param {string} token
 * @param {number} newPosition
 * @param {string} version - v1 or v2
 * @returns {Response}
 */
const requestAdminMoveQuizQuestionGeneric = (
  quizId: number, questionId: number, token: string, newPosition: number, version: string
): {
  body: ReturnType<typeof adminMoveQuizQuestion>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}/question/${questionId}/move`;

  const options: requestOptions = {
    json: { newPosition },
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.json = { token, newPosition };
  } else {
    options.headers = { token };
  }

  const res = request('PUT', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes HTTP request to move a question to a new position using v1 route
 */
export const requestAdminMoveQuizQuestionV1 = (
  quizId: number, questionId: number, token: string, newPosition: number
) => requestAdminMoveQuizQuestionGeneric(quizId, questionId, token, newPosition, 'v1');

/**
 * Makes HTTP request to move a question to a new position using v2 route
 */
export const requestAdminMoveQuizQuestionV2 = (
  quizId: number, questionId: number, token: string, newPosition: number
) => requestAdminMoveQuizQuestionGeneric(quizId, questionId, token, newPosition, 'v2');

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

/**
 * Makes http request to duplicate a quiz
 *
 * @param { number } quizId
 * @param { number } questionId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminQuizQuestionDuplicateV2 = (
  quizId: number, questionId: number, token: string
): {
  body: ReturnType <typeof adminQuizQuestionDuplicate>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      headers: {
        token: token,
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

export const requestjoinPlayer = (
  sessionId: number, playerName: string
): {
  body: ReturnType <typeof joinPlayer>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/player/join',
    {
      json: {
        sessionId: sessionId,
        playerName: playerName
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminQuizSessionUpdate
/**
 * Makes http request to update quiz session status
 *
 * @param { number } quizId
 * @param { number } sessionId
 * @param { string } token
 * @param { adminAction } action
 * @returns { Response }
 */
export const requestAdminQuizSessionUpdate = (
  quizId: number,
  sessionId: number,
  token: string,
  actionBody: adminAction
): {
  body: ReturnType <typeof adminQuizSessionUpdate>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: { token },
      json: {
        action: actionBody
      },
      timeout: TIMEOUT_MS,
    }
  );

  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

export const requestPlayerMessage = (
  playerId: number,
  message: messageBody
) : {
  body: ReturnType <typeof playerMessage>,
  statusCode: number
} => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/player/${playerId}/chat`,
    {
      json: {
        message: message,
      },
      timeout: TIMEOUT_MS
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

export const requestadminQuizSessionState = (
  quizId: number, sessionId: number, token: string
): {
  body: ReturnType <typeof adminQuizSessionState>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: {
        token: token
      },
      json: {
        quizId: quizId,
        sessionId: sessionId
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

export const requestplayerState = (
  playerId: number
): {
  body: ReturnType <typeof playerState>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}`,
    {
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

export const requestPlayerMessageList = (
  playerId: number
) : {
  body: ReturnType <typeof playerMessageList>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}/chat`,
    {
      timeout: TIMEOUT_MS
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Allow the current player to submit answer(s) to the currently active question.
 *
 * @param { number[] } answerIds
 * @param { number } playerId
 * @param { number } questionPosition
 * @returns { Response }
 */
export const requestPlayerAnswerQuestion = (
  answerIds: number[], playerId: number, questionPosition: number
): {
  body: ReturnType <typeof playerAnswerQuestion>,
  statusCode: number
} => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/player/${playerId}/question/${questionPosition}/answer`,
    {
      json: {
        answerIds: answerIds
      },
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Get the final results for a whole session a player is playing in
 *
 * @param { number } playerId
 * @returns { Response }
 */
export const requestPlayerResults = (
  playerId: number
): {
  body: ReturnType <typeof playerResults>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}/results`,
    {
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// playerQuestion
/**
 * Current question information for a player
 *
 * @param { number } playerId
 * @param { number } questionPosition
 * @returns { Response }
 */
export const requestPlayerQuestion = (
  playerId: number, questionPosition: number
): {
  body: ReturnType <typeof playerQuestion>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}/question/${questionPosition}`,
    {
      timeout: TIMEOUT_MS
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};
