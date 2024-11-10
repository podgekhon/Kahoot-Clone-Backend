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
  playerMessage,
  playerState,
  playerMessageList
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
 * Makes an HTTP request to create a question
 *
 * @param {number} quizId
 * @param {string} token
 * @param {object} questionBody - An object containing question details
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
