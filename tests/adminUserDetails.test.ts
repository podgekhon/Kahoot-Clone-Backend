import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

/// ////////-----adminUserDetails-----////////////
describe('test for adminUserDetails', () => {
  let user: { token: string };

  beforeEach(() => {
    const resRegister = request('POST', `${url}:${port}/v1/admin/auth/register`, {
      json: {
        email: 'test@gmail.com',
        password: 'validPassword5',
        nameFirst: 'Patrick',
        nameLast: 'Chen',
      },
      timeout: 100,
    });
    user = JSON.parse(resRegister.body as string);
  });

  test('successfully returns details of a valid user', () => {
    const resDetails = request(
      'GET',
        `${url}:${port}/v1/admin/user/details`,
        {
          qs: {
            token: user.token,
          },
          timeout: 100,
        }
    );
    const result = JSON.parse(resDetails.body as string);

    expect(result).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Patrick Chen',
        email: 'test@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('returns error when token is not valid', () => {
    const resDetails = request(
      'GET',
        `${url}:${port}/v1/admin/user/details`,
        {
          qs: {
            token: 'invalidToken',
          },
          timeout: 100,
        }
    );
    const result = JSON.parse(resDetails.body as string);

    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('numSuccessfulLogins increments after successful logins', () => {
    // Simulate multiple successful logins
    request('POST', `${url}:${port}/v1/admin/auth/login`, {
      json: {
        email: 'test@gmail.com',
        password: 'validPassword5',
      },
      timeout: 100,
    });
    request('POST', `${url}:${port}/v1/admin/auth/login`, {
      json: {
        email: 'test@gmail.com',
        password: 'validPassword5',
      },
      timeout: 100,
    });

    const resDetails = request(
      'GET',
        `${url}:${port}/v1/admin/user/details`,
        {
          qs: {
            token: user.token,
          },
          timeout: 100,
        }
    );
    const result = JSON.parse(resDetails.body as string);

    // Check if the number of successful logins is correct (1 registration + 2 logins)
    expect(result.user.numSuccessfulLogins).toBe(3);
  });

  test('numFailedPasswordsSinceLastLogin increments on failed login attempts', () => {
    // Simulate failed login attempts
    request('POST', `${url}:${port}/v1/admin/auth/login`, {
      json: {
        email: 'test@gmail.com',
        password: 'wrongPassword',
      },
      timeout: 100,
    });
    request('POST', `${url}:${port}/v1/admin/auth/login`, {
      json: {
        email: 'test@gmail.com',
        password: 'wrongPassword',
      },
      timeout: 100,
    });

    const resDetails = request(
      'GET',
        `${url}:${port}/v1/admin/user/details`,
        {
          qs: {
            token: user.token,
          },
          timeout: 100,
        }
    );
    const result = JSON.parse(resDetails.body as string);

    // Check if the number of failed login attempts is correct (2 failed attempts)
    expect(result.user.numFailedPasswordsSinceLastLogin).toBe(2);
  });

  test('numFailedPasswordsSinceLastLogin resets after a successful login', () => {
    // Simulate failed login attempts
    request('POST', `${url}:${port}/v1/admin/auth/login`, {
      json: {
        email: 'test@gmail.com',
        password: 'wrongPassword',
      },
      timeout: 100,
    });
    request('POST', `${url}:${port}/v1/admin/auth/login`, {
      json: {
        email: 'test@gmail.com',
        password: 'wrongPassword',
      },
      timeout: 100,
    });

    // Simulate a successful login
    request('POST', `${url}:${port}/v1/admin/auth/login`, {
      json: {
        email: 'test@gmail.com',
        password: 'validPassword5',
      },
      timeout: 100,
    });

    const resDetails = request(
      'GET',
        `${url}:${port}/v1/admin/user/details`,
        {
          qs: {
            token: user.token,
          },
          timeout: 100,
        }
    );
    const result = JSON.parse(resDetails.body as string);

    // Check if the failed attempts reset to 0 after a successful login
    expect(result.user.numFailedPasswordsSinceLastLogin).toBe(0);
  });
});
