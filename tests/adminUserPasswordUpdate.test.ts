import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import {
  requestClear,
  adminAuthRegisterHttp,
  requestAdminUserPasswordUpdate,
  httpStatus
} from '../src/helperfunctiontests';
import { tokenReturn } from '../src/interface';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

const invalidPasswords = [
  { password: '12345678' },
  { password: 'abcdefgh' },
  { password: '1' },
  { password: '123456a' },
  { password: '' },
];

beforeEach(() => {
  requestClear();
});

/// //////-----adminUserPasswordUpdate-----//////////
describe('test for adminUserPasswordUpdate', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    user1 = adminAuthRegisterHttp('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1token = (user1.body as tokenReturn).token;
  });

  // authUserId is not valid user
  test('invalid token', () => {
    const result = requestAdminUserPasswordUpdate(JSON.stringify('abcd'), 'EricMa1234', '1234EricMa');
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = requestAdminUserPasswordUpdate(JSON.stringify(''), 'EricMa1234', '1234EricMa');
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  // Old password is not the correct old password
  test('old password is wrong', () => {
    const result = requestAdminUserPasswordUpdate(user1token, 'wrongpassword', '1234EricMa');
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  // Old password and new password match exactly
  test('new password is same as the old one', () => {
    const result = requestAdminUserPasswordUpdate(user1token, 'EricMa1234', 'EricMa1234');
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  // New password has already been used before by this user
  test('new password has been used before', () => {
    requestAdminUserPasswordUpdate(user1token, 'EricMa1234', '1234EricMa');
    // update again
    const result = requestAdminUserPasswordUpdate(user1token, '1234EricMa', 'EricMa1234');
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  // test for invalid passwords(too short, no characters/numbers)
  test('invalid new passwords', () => {
    invalidPasswords.forEach(({ password }) => {
      const result = requestAdminUserPasswordUpdate(user1token, 'EricMa1234', password);
      expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(result.body).toStrictEqual({ error: expect.any(String) });
    });
  });

  // correct return type
  test('Correct return type', () => {
    const result = requestAdminUserPasswordUpdate(user1token, 'EricMa1234', '1234EricMa');
    expect(result.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(result.body).toStrictEqual({});

    // try to login by using the old password
    // should fail
    let res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      {
        json: {
          email: 'ericMa@unsw.edu.au',
          password: 'EricMa1234'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(400);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });

    // try to login with the new password
    // should success
    res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      {
        json: {
          email: 'ericMa@unsw.edu.au',
          password: '1234EricMa'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ token: expect.any(String) });
  });
});
