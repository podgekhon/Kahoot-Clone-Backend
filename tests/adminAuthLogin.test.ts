import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

/// ////////-----adminAuthLogin-----////////////
describe('adminAuthLogin', () => {
  let user: { token: string };
  let userId: { authUserId: number };

  // test for email address doesn't exists when login
  test('Check invalid email', () => {
    const resAuthLogin = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      {
        json: {
          email: 'XiaoyuanMa@unsw.edu.au',
          password: '1234abcd'
        },
        timeout: TIMEOUT_MS,
      }
    );

    expect(resAuthLogin.statusCode).toStrictEqual(400);
    userId = JSON.parse(resAuthLogin.body.toString());
    expect(userId).toEqual({ error: expect.any(String) });
  });

  // test for incorrect password login
  test('password not correct', () => {
    const resRegister = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'XiaoyuanMa@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'Xiaoyuan',
          nameLast: 'Ma'
        },
        timeout: TIMEOUT_MS,
      }
    );

    expect(resRegister.statusCode).toStrictEqual(200);
    user = JSON.parse(resRegister.body.toString());

    const resAuthLogin = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      {
        json: {
          token: user.token,
          email: 'XiaoyuanMa@unsw.edu.au',
          password: 'abcd1234'
        },
        timeout: TIMEOUT_MS,
      }
    );

    expect(resAuthLogin.statusCode).toStrictEqual(400);
    userId = JSON.parse(resAuthLogin.body.toString());
    expect(userId).toEqual({ error: expect.any(String) });
  });

  // test for successful login
  test('successful login', () => {
    const resRegister = request(
      'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: 'XiaoyuanMa@unsw.edu.au',
            password: '1234abcd',
            nameFirst: 'Xiaoyuan',
            nameLast: 'Ma'
          },
          timeout: TIMEOUT_MS,
        }
    );

    user = JSON.parse(resRegister.body.toString());

    const resAuthLogin = request(
      'POST',
        `${url}:${port}/v1/admin/auth/login`,
        {
          json: {
            email: 'XiaoyuanMa@unsw.edu.au',
            password: '1234abcd'
          },
          timeout: TIMEOUT_MS,
        }
    );
      // check status code and return type
    expect(resAuthLogin.statusCode).toStrictEqual(200);
    userId = JSON.parse(resAuthLogin.body.toString());
    expect(userId).toEqual({ token: expect.any(String) });

    // get user details

    const res = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',
      {
        qs: {
          token: user.token
        },
        timeout: TIMEOUT_MS
      }
    );
    // show the correct user details
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Xiaoyuan Ma',
        email: 'XiaoyuanMa@unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});
