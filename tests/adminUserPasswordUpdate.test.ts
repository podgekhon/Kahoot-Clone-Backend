import request from 'sync-request-curl';
import { port, url } from '../config.json';

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
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

/// //////-----adminUserPasswordUpdate-----//////////
describe('test for adminUserPasswordUpdate', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    // register a user
    user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ericMa@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma'
      },
      timeout: TIMEOUT_MS
    });
    user1token = JSON.parse(user1.body.toString()).token;
  });

  // authUserId is not valid user
  test('invalid token', () => {
    // update request
    const result = request(
      'PUT',
      SERVER_URL + '/v1/admin/user/password',
      {
        json: {
          token: JSON.stringify('abcd'),
          oldPassword: 'EricMa1234',
          newPassword: '1234EricMa'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    // update request
    const result = request(
      'PUT',
      SERVER_URL + '/v1/admin/user/password',
      {
        json: {
          token: JSON.stringify(''),
          oldPassword: 'EricMa1234',
          newPassword: '1234EricMa'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  // Old password is not the correct old password
  test('old password is wrong', () => {
    // update request
    const result = request(
      'PUT',
      SERVER_URL + '/v1/admin/user/password',
      {
        json: {
          token: user1token,
          oldPassword: 'wrong',
          newPassword: '1234EricMa'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  // Old password and new password match exactly
  test('new password is same as the old one', () => {
    // update request
    const result = request(
      'PUT',
      SERVER_URL + '/v1/admin/user/password',
      {
        json: {
          token: user1token,
          oldPassword: 'EricMa1234',
          newPassword: 'EricMa1234'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  // New password has already been used before by this user
  test('new password has been used before', () => {
    // update request
    request(
      'PUT',
      SERVER_URL + '/v1/admin/user/password',
      {
        json: {
          token: user1token,
          oldPassword: 'EricMa1234',
          newPassword: '1234EricMa'
        },
        timeout: TIMEOUT_MS
      }
    );
    // update again
    const result = request(
      'PUT',
      SERVER_URL + '/v1/admin/user/password',
      {
        json: {
          token: user1token,
          oldPassword: '1234EricMa',
          newPassword: 'EricMa1234'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  // test for invalid passwords(too short, no characters/numbers)
  test('invalid new passwords', () => {
    invalidPasswords.forEach(({ password }) => {
      const result = request(
        'PUT',
        SERVER_URL + '/v1/admin/user/password',
        {
          json: {
            token: user1token,
            oldPassword: 'EricMa1234',
            newPassword: password
          },
          timeout: TIMEOUT_MS
        }
      );
      expect(result.statusCode).toStrictEqual(400);
      expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
    });
  });

  // correct return type
  test('Correct return type', () => {
    const result = request(
      'PUT',
      SERVER_URL + '/v1/admin/user/password',
      {
        json: {
          token: user1token,
          oldPassword: 'EricMa1234',
          newPassword: '1234EricMa'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(200);
    expect(JSON.parse(result.body.toString())).toStrictEqual({});

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
