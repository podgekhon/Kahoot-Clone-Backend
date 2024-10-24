import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

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
export const requestClear = (): {
  body: ReturnType <typeof clear>
  statusCode: number
} => {
  const res = request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminAuthRegister
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
export const requestadminMoveQuizQuestion = (
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

// adminQuizDuplicate
export const requestAdminQuizDuplicate = (
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
