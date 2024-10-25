import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import {
  userAuthRegister,
  authLoginResponse,
  tokenReturn
} from '../src/interface';
import {
  requestAdminAuthLogin,
  requestAdminAuthRegister,
  requestAdminUserDetails
} from '../src/requestHelperFunctions';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

/// ////////-----adminAuthLogin-----////////////
describe('adminAuthLogin', () => {
  let user: userAuthRegister;
  let authLogin: authLoginResponse;

  beforeEach(() => {
    user = requestAdminAuthRegister(
      'user@gmail.com',
      'validPassword1',
      'user',
      'one'
    );
    expect(user.statusCode).toStrictEqual(200);
  });

  // test for email address doesn't exists when login
  test('Check invalid email', () => {
    authLogin = requestAdminAuthLogin('invalidEmail@gmail.com', 'validPassword1');
    expect(authLogin.statusCode).toStrictEqual(400);
    expect(authLogin.body).toEqual({ error: expect.any(String) });
  });

  // test for incorrect password login
  test('password not correct', () => {
    authLogin = requestAdminAuthLogin(
      'invalidEmail@gmail.com',
      'invalidPassword1'
    );

    expect(authLogin.statusCode).toStrictEqual(400);
    expect(authLogin.body).toEqual({ error: expect.any(String) });
  });

  // test for successful login
  test('successful login', () => {
    authLogin = requestAdminAuthLogin(
      'user@gmail.com',
      'validPassword1'
    );
    expect(authLogin.statusCode).toStrictEqual(200);
    expect(authLogin.body).toEqual({ token: expect.any(String) });
    // get user details

    const res = requestAdminUserDetails((authLogin.body as tokenReturn).token);
    // show the correct user details
    expect(res.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'user one',
        email: 'user@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});
