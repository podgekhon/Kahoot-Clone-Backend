import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 10000;

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
  adminQuizCreate,
  adminQuizDescriptionUpdate,
  adminQuizRemove,
  adminMoveQuizQuestion,
  adminQuizDuplicate,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizQuestionCreate,
  adminQuizQuestionRemove,
  adminQuizQuestionUpdate,
  adminQuizRestore,
  adminQuizTransfer
} from './quiz'

// clear
export const clearHttp = (): {
statusCode: number,
body: ReturnType <typeof clear> } => {
  const res = request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// adminAuthRegister
export const adminAuthRegisterHttp = (
  email: string, password: string, nameFirst: string, nameLast: string): {
statusCode: number,
body: ReturnType <typeof adminAuthRegister> } => {
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
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

