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
import { adminAuthRegister } from './auth';

// clear
export const requestClear = (): {
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


// adminUserPasswordUpdate
export const requestAdminUserPasswordUpdate = (
  token: string,
  oldPassword: string,
  newPassword: string
): {
  statusCode: number,
  body: ReturnType <typeof adminAuthRegister>
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
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode};
}