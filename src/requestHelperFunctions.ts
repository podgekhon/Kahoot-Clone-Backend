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
  adminQuizSessionState,
} from './quiz';

import {
  joinPlayer,
  playerAnswerQuestion,
  playerMessage,
  playerState,
  playerQuestion,
  playerResults,
  playerMessageList,
  playerQuestionResult
} from './player';

import {
  GetFinalResults,
  messageBody,
  requestOptions,
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

// adminUserDetails V2
/**
 * Makes http request to get user details
 *
 * @param { string } token
 * @returns
 */
export const requestAdminUserDetailsv2 = (
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
// Generic function for listing quizzes
/**
 * Makes an HTTP request to get a list of quizzes for the specified version
 *
 * @param {string} token -
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminQuizListGeneric = (
  token: string,
  version: string
): {
  body: ReturnType<typeof adminQuizList>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/list`;

  const options: requestOptions = {
    timeout: TIMEOUT_MS,
  };

  // Add query parameter for v1 or header for v2
  if (version === 'v1') {
    options.qs = { token };
  } else {
    options.headers = { token };
  }

  const res = request('GET', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to get a list of quizzes using v1 route
 */
export const requestAdminQuizList = (token: string) =>
  requestAdminQuizListGeneric(token, 'v1');

/**
 * Makes an HTTP request to get a list of quizzes using v2 route
 */
export const requestAdminQuizListV2 = (token: string) =>
  requestAdminQuizListGeneric(token, 'v2');

// adminQuizCreate
/**
 * Makes an HTTP request to create a quiz
 *
 * @param {string} token
 * @param {string} name
 * @param {string} description
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminQuizCreateGeneric = (
  token: string, name: string, description: string, version: string
): {
  body: ReturnType<typeof adminQuizCreate>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz`;

  const options: requestOptions = {
    json: { name, description },
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.json = { token, name, description };
  } else {
    options.headers = { token };
  }

  const res = request('POST', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to create a quiz using v1 route
 */
export const requestAdminQuizCreate = (
  token: string, name: string, description: string
) => requestAdminQuizCreateGeneric(token, name, description, 'v1');

/**
 * Makes an HTTP request to create a quiz using v2 route
 */
export const requestAdminQuizCreateV2 = (
  token: string, name: string, description: string
) => requestAdminQuizCreateGeneric(token, name, description, 'v2');

// adminQuizRemove
/**
 * Makes an HTTP request to remove a quiz
 *
 * @param {number} quizId
 * @param {string} token
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminQuizRemoveGeneric = (
  quizId: number,
  token: string,
  version: string
): {
  body: ReturnType<typeof adminQuizRemove>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}`;

  const options: requestOptions = {
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.qs = { token };
  } else {
    options.headers = { token };
  }

  const res = request('DELETE', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to remove a quiz using v1 route
 */
export const requestAdminQuizRemove = (quizId: number, token: string) =>
  requestAdminQuizRemoveGeneric(quizId, token, 'v1');

/**
 * Makes an HTTP request to remove a quiz using v2 route
 */
export const requestAdminQuizRemoveV2 = (quizId: number, token: string) =>
  requestAdminQuizRemoveGeneric(quizId, token, 'v2');

// adminQuizInfo

/**
 * Makes an HTTP request to get quiz information
 *
 * @param {number} quizId
 * @param {string} token
 * @param {string} version - 'v1' or 'v2'
 * @returns {Response}
 */
const requestAdminQuizInfoGeneric = (
  quizId: number,
  token: string,
  version: string
): {
  body: ReturnType<typeof adminQuizInfo>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}`;

  const options: requestOptions = {
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.qs = { token };
  } else {
    options.headers = { token };
  }

  const res = request('GET', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes HTTP request to get quiz information using v1 route
 */
export const requestAdminQuizInfo = (
  quizId: number,
  token: string
) => requestAdminQuizInfoGeneric(quizId, token, 'v1');

/**
 * Makes HTTP request to get quiz information using v2 route
 */
export const requestAdminQuizInfoV2 = (
  quizId: number,
  token: string
) => requestAdminQuizInfoGeneric(quizId, token, 'v2');

// adminQuizNameUpdate
/**
 * Makes an HTTP request to update quiz name
 *
 * @param {number} quizId - the Id of the quiz to update
 * @param {string} token
 * @param {string} name - new name of the quiz
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminQuizNameUpdateGeneric = (
  quizId: number,
  token: string,
  name: string,
  version: string
): {
  body: ReturnType<typeof adminQuizNameUpdate>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}/name`;

  const options: requestOptions = {
    json: { name },
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.json = { token, name };
  } else {
    options.headers = { token };
  }

  const res = request('PUT', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to update quiz name using v1 route
 */
export const requestAdminQuizNameUpdate = (quizId: number, token: string, name: string) =>
  requestAdminQuizNameUpdateGeneric(quizId, token, name, 'v1');

/**
 * Makes an HTTP request to update quiz name using v2 route
 */
export const requestAdminQuizNameUpdateV2 = (quizId: number, token: string, name: string) =>
  requestAdminQuizNameUpdateGeneric(quizId, token, name, 'v2');

// adminQuizDescriptionUpdate
/**
 * Makes an HTTP request to update a quiz description
 *
 * @param {number} quizId
 * @param {string} token
 * @param {string} description - new quiz description
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminQuizDescriptionUpdateGeneric = (
  quizId: number,
  token: string,
  description: string,
  version: string
): {
  body: ReturnType<typeof adminQuizDescriptionUpdate>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}/description`;

  const options: requestOptions = {
    json: { description },
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.json = { token, description };
  } else {
    options.headers = { token };
  }

  const res = request('PUT', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to update a quiz description using v1 route
 */
export const requestAdminQuizDescriptionUpdate = (
  quizId: number,
  token: string,
  description: string
) => requestAdminQuizDescriptionUpdateGeneric(quizId, token, description, 'v1');

/**
 * Makes an HTTP request to update a quiz description using v2 route
 */
export const requestAdminQuizDescriptionUpdateV2 = (
  quizId: number,
  token: string,
  description: string
) => requestAdminQuizDescriptionUpdateGeneric(quizId, token, description, 'v2');

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
export const requestAdminAuthLogoutV2 = (
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
      timeout: TIMEOUT_MS,
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminTrashList
/**
 * Makes an HTTP request to list quizzes in the trash for the specified version
 *
 * @param {string} token
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminTrashListGeneric = (
  token: string,
  version: string
): {
  body: ReturnType<typeof adminTrashList>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/trash`;

  const options: requestOptions = {
    timeout: TIMEOUT_MS,
  };

  // Set query string for v1 or headers for v2
  if (version === 'v1') {
    options.qs = { token };
  } else {
    options.headers = { token };
  }

  const res = request('GET', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to list quizzes in the trash using v1 route
 */
export const requestAdminTrashList = (token: string) =>
  requestAdminTrashListGeneric(token, 'v1');

/**
 * Makes an HTTP request to list quizzes in the trash using v2 route
 */
export const requestAdminTrashListV2 = (token: string) =>
  requestAdminTrashListGeneric(token, 'v2');

// adminQuizRestore
/**
 * Makes an HTTP request to restore a quiz for the specified version
 *
 * @param {number} quizId
 * @param {string} token
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminQuizRestoreGeneric = (
  quizId: number,
  token: string,
  version: string
): {
  body: ReturnType<typeof adminQuizRestore>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}/restore`;

  const options: requestOptions = {
    timeout: TIMEOUT_MS,
  };

  // Set token in body for v1 or in headers for v2
  if (version === 'v1') {
    options.json = { token };
  } else {
    options.headers = { token };
  }

  const res = request('POST', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to restore a quiz using v1 route
 */
export const requestAdminQuizRestore = (quizId: number, token: string) =>
  requestAdminQuizRestoreGeneric(quizId, token, 'v1');

/**
 * Makes an HTTP request to restore a quiz using v2 route
 */
export const requestAdminQuizRestoreV2 = (quizId: number, token: string) =>
  requestAdminQuizRestoreGeneric(quizId, token, 'v2');

// adminTrashEmpty
/**
 * Makes an HTTP request to empty the trash for the specified version
 *
 * @param {string} token - Authentication token
 * @param {number[]} quizIds - Array of quiz IDs to be deleted
 * @param {string} version - API version ("v1" or "v2")
 * @returns {Response} - The response body and status code
 */
const requestAdminTrashEmptyGeneric = (
  token: string,
  quizIds: number[],
  version: string
): {
  body: ReturnType<typeof adminTrashEmpty>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/trash/empty`;

  const options: requestOptions = {
    timeout: TIMEOUT_MS,
    qs: { quizIds: JSON.stringify(quizIds) },
  };

  // Set token in body for v1 or in headers for v2
  if (version === 'v1') {
    options.qs = { ...options.qs, token };
  } else {
    options.headers = { token };
  }

  const res = request('DELETE', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to empty the trash using v1 route
 */
export const requestAdminTrashEmpty = (token: string, quizIds: number[]) =>
  requestAdminTrashEmptyGeneric(token, quizIds, 'v1');

/**
 * Makes an HTTP request to empty the trash using v2 route
 */
export const requestAdminTrashEmptyV2 = (token: string, quizIds: number[]) =>
  requestAdminTrashEmptyGeneric(token, quizIds, 'v2');

// adminQuizTransfer
/**
 * Makes an HTTP request to transfer a quiz to another user for the specified version
 *
 * @param {number} quizId
 * @param {string} token
 * @param {string} userEmail - the email of the user to transfer the quiz to
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminQuizTransferGeneric = (
  quizId: number,
  token: string,
  userEmail: string,
  version: string
): {
  body: ReturnType<typeof adminQuizTransfer>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}/transfer`;

  const options: requestOptions = {
    timeout: TIMEOUT_MS,
  };

  // Set token in body for v1 or in headers for v2
  if (version === 'v1') {
    options.json = {
      token,
      userEmail,
    };
  } else {
    options.headers = { token };
    options.json = { userEmail };
  }

  // Make the request using the appropriate method
  const res = request('POST', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to transfer a quiz using the v1 route
 */
export const requestAdminQuizTransfer = (
  quizId: number,
  token: string,
  userEmail: string
) => requestAdminQuizTransferGeneric(quizId, token, userEmail, 'v1');

/**
 * Makes an HTTP request to transfer a quiz using the v2 route
 */
export const requestAdminQuizTransferV2 = (
  quizId: number,
  token: string,
  userEmail: string
) => requestAdminQuizTransferGeneric(quizId, token, userEmail, 'v2');

// adminQuizQuestionCreate
/**
 * Makes an HTTP request to create a question
 *
 * @param {number} quizId
 * @param {string} token
 * @param {object} questionBody - an object containing question details
 * @param {string} version - v1 or v2
 * @returns {Response}
 */
const requestAdminQuizQuestionCreateGeneric = (
  quizId: number, token: string, questionBody: object, version: string
): {
  body: ReturnType<typeof adminQuizQuestionCreate>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}/question`;

  const options: requestOptions = {
    json: { questionBody },
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.json = { token, questionBody };
  } else {
    options.headers = { token };
  }

  const res = request('POST', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes HTTP request to create a question using v1 route
 */
export const requestAdminQuizQuestionCreate = (
  quizId: number, token: string, questionBody: object
) => requestAdminQuizQuestionCreateGeneric(quizId, token, questionBody, 'v1');

/**
 * Makes HTTP request to create a question using v2 route
 */
export const requestAdminQuizQuestionCreateV2 = (
  quizId: number, token: string, questionBody: object
) => requestAdminQuizQuestionCreateGeneric(quizId, token, questionBody, 'v2');

// adminQuizQuestionUpdate
/**
 * Makes an HTTP request to update a question
 *
 * @param {number} quizId
 * @param {number} questionId
 * @param {string} token
 * @param {object} questionBody - An object containing question details
 * @param {string} version - v1 or v2
 * @returns {Response}
 */
const requestAdminQuizQuestionUpdateGeneric = (
  quizId: number, questionId: number, token: string, questionBody: object, version: string
): {
  body: ReturnType<typeof adminQuizQuestionUpdate>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}/question/${questionId}`;

  const options: requestOptions = {
    json: { questionBody },
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.json = { token, questionBody };
  } else {
    options.headers = { token };
  }

  const res = request('PUT', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes HTTP request to update a question using v1 route
 */
export const requestAdminQuizQuestionUpdate = (
  quizId: number, questionId: number, token: string, questionBody: object
) => requestAdminQuizQuestionUpdateGeneric(quizId, questionId, token, questionBody, 'v1');

/**
 * Makes HTTP request to update a question using v2 route
 */
export const requestAdminQuizQuestionUpdateV2 = (
  quizId: number, questionId: number, token: string, questionBody: object
) => requestAdminQuizQuestionUpdateGeneric(quizId, questionId, token, questionBody, 'v2');

// adminQuizQuestionRemove v1
/**
 * Makes an HTTP request to remove a quiz question
 *
 * @param {number} quizId
 * @param {number} questionId
 * @param {string} token
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminQuizQuestionRemoveGeneric = (
  quizId: number,
  questionId: number,
  token: string,
  version: string
): {
  body: ReturnType<typeof adminQuizQuestionRemove>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}/question/${questionId}`;

  const options: requestOptions = {
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.qs = { token };
  } else {
    options.headers = { token };
  }

  const res = request('DELETE', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to remove a quiz question using v1 route
 */
export const requestAdminQuizQuestionRemove = (
  quizId: number, questionId: number, token: string
) => requestAdminQuizQuestionRemoveGeneric(quizId, questionId, token, 'v1');

/**
 * Makes an HTTP request to remove a quiz question using v2 route
 */
export const requestAdminQuizQuestionRemoveV2 = (
  quizId: number, questionId: number, token: string
) => requestAdminQuizQuestionRemoveGeneric(quizId, questionId, token, 'v2');

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
export const requestAdminMoveQuizQuestion = (
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
 * Makes an HTTP request to duplicate a quiz question
 *
 * @param {number} quizId - the Id of the quiz
 * @param {number} questionId - the Id of the question to duplicate
 * @param {string} token
 * @param {string} version - "v1" or "v2"
 * @returns {Response}
 */
const requestAdminQuizQuestionDuplicateGeneric = (
  quizId: number,
  questionId: number,
  token: string,
  version: string
): {
  body: ReturnType<typeof adminQuizQuestionDuplicate>,
  statusCode: number
} => {
  const url = `${SERVER_URL}/${version}/admin/quiz/${quizId}/question/${questionId}/duplicate`;

  const options: requestOptions = {
    timeout: TIMEOUT_MS,
  };

  if (version === 'v1') {
    options.json = { token };
  } else {
    options.headers = { token };
  }

  const res = request('POST', url, options);
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

/**
 * Makes an HTTP request to duplicate a quiz question using v1 route
 */
export const requestAdminQuizQuestionDuplicate = (
  quizId: number, questionId: number, token: string
) => requestAdminQuizQuestionDuplicateGeneric(quizId, questionId, token, 'v1');

/**
 * Makes an HTTP request to duplicate a quiz question using v2 route
 */
export const requestAdminQuizQuestionDuplicateV2 = (
  quizId: number, questionId: number, token: string
) => requestAdminQuizQuestionDuplicateGeneric(quizId, questionId, token, 'v2');

// joinPlayer
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

// PlayerMessage
/**
 * Makes http request to post player message
 *
 * @param { number } playerId
 * @param { messageBody } message
 * @returns { Response }
 */
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

// adminQuizSessionState
/**
 * Makes http request to shouw quiz session state
 *
 * @param { number } quizId
 * @param { number } sessionId
 * @param { string } token
 * @returns { Response }
 */
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

// playerState
/**
 * Makes http request to shouw player state
 *
 * @param { number } playerId
 * @returns { Response }
 */
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

// PlayerMessageList
/**
 * Makes http request to shouw player message list
 *
 * @param { number } playerId
 * @returns { Response }
 */
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

// PlayerAnswerQuestion
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

// adminGetFinalResults
/**
 * Gets final results of all players for a completed quiz session.
 *
 * @param { number } quizId
 * @param { number } sessionId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminGetFinalResults = (
  quizId: number, sessionId: number, token: string
): GetFinalResults => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}/results`,
    {
      headers: { token },
      timeout: TIMEOUT_MS
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// PlayerResults
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

// PlayerQuestionResult
/**
 * Get the question results for a player
 *
 * @param { number } playerId
 * @param { number } questionPosition
 * @returns { Response }
 */
export const requestPlayerQuestionResult = (
  playerId: number, questionPosition: number
): {
  body: ReturnType <typeof playerQuestionResult>,
  statusCode: number
} => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}/question/${questionPosition}/results`,
    {
      timeout: TIMEOUT_MS
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

// adminGetFinalResultsCsv
/**
 * Gets final results of all players for a completed quiz session in CSV format.
 *
 * @param { number } quizId
 * @param { number } sessionId
 * @param { string } token
 * @returns { Response }
 */
export const requestAdminGetFinalResultsCsv = (
  quizId: number, sessionId: number, token: string
): GetFinalResults => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`,
    {
      headers: { token },
      timeout: TIMEOUT_MS
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};
