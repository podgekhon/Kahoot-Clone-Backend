import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

const invalidEmails = [
  { email: 'username.com' },
  { email: 'username@' }
];

const invalidNames = [
  { name: 'Eric!' },
  { name: 'John#' },
  { name: 'Anna$' },
  { name: 'A' },
  { name: 'VeryLongNameThatExceedsTwentyCharacters' },
  { name: '1Eric' },
  { name: '' }
];

const validNames = [
  { name: 'Jean-Paul' },
  { name: "O'Connor" },
  { name: 'Mary Anne' },
  { name: 'Containstwentycharac' },
  { name: 'tw' },
  { name: '  Eric  ' }
];

const invalidPasswords = [
  { password: '12345678' },
  { password: 'abcdefgh' },
  { password: '1' },
  { password: '123456a' },
  { password: '' },
];

/// //////////-----adminAuthRegister------///////////
describe.skip('adminAuthRegister', () => {
  describe('Tests with 1 ordinary user', () => {
    // let user1: authResponse | errorMessages;
    let user1Return: string;
    let user1: any;
    beforeEach(() => {
      user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'eric@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'Eric',
          nameLast: 'Yang'
        },
        timeout: TIMEOUT_MS
      });

      user1Return = JSON.parse(user1.body.toString());
    });

    // valid cases checking
    test('Check multiple invalid and valid registrations', () => {
      const user2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'pat@unsw.edu.au',
          password: '1234ABCD',
          nameFirst: 'Pat',
          nameLast: 'Yang'
        },
        timeout: TIMEOUT_MS
      });

      const user2Return = JSON.parse(user2.body.toString());

      const user3 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'sam@unsw.edu.au',
          password: '12',
          nameFirst: 'Sam',
          nameLast: 'Yang'
        },
        timeout: TIMEOUT_MS
      });

      const user3Return = JSON.parse(user3.body.toString());

      const user4 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'andrew',
          password: '1234abcd',
          nameFirst: 'Andrew',
          nameLast: 'Yang'
        },
        timeout: TIMEOUT_MS
      });

      const user4Return = JSON.parse(user4.body.toString());

      // Assertions for valid and invalid cases
      expect(user1Return).toStrictEqual({ token: expect.any(String) });
      expect(user1.statusCode).toStrictEqual(200);

      expect(user2Return).toStrictEqual({ token: expect.any(String) });

      expect(user3Return).toStrictEqual({ error: expect.any(String) });
      expect(user3.statusCode).toStrictEqual(400);

      expect(user4Return).toStrictEqual({ error: expect.any(String) });
      expect(user4.statusCode).toStrictEqual(400);
    });

    // Email address is used by another user.
    test('Check duplicate email', () => {
      const user2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'eric@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'Pat',
          nameLast: 'Yang'
        },
        timeout: TIMEOUT_MS
      });
      const user2Return = JSON.parse(user2.body.toString());
      expect(user2Return).toStrictEqual({ error: expect.any(String) });
    });

    test('Registering two people with the same name and passwords', () => {
      const user2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'pat@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'Eric',
          nameLast: 'Yang'
        },
        timeout: TIMEOUT_MS
      });
      const user2Return = JSON.parse(user2.body.toString());
      expect(user1Return).toStrictEqual({ token: expect.any(String) });
      expect(user2Return).toStrictEqual({ token: expect.any(String) });
    });
  });

  // Email does not satisfy validator.isEmail function
  test.each(invalidEmails)('Check invalid email for $email', ({ email }) => {
    const user = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: email,
        password: 'password123',
        nameFirst: 'Eric',
        nameLast: 'Yang'
      },
      timeout: TIMEOUT_MS
    });

    const userReturn = JSON.parse(user.body.toString());
    expect(userReturn).toStrictEqual({ error: expect.any(String) });
  });

  // Unusual But Valid Characters in Emails
  test('valid email with + symbol', () => {
    const user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'eric+@unsw.edu.au',
        password: '1234abcd',
        nameFirst: 'Eric',
        nameLast: 'Yang'
      },
      timeout: TIMEOUT_MS
    });

    const user1Return = JSON.parse(user1.body.toString());
    expect(user1Return).toStrictEqual({ token: expect.any(String) });
  });

  // nameFirst contains characters other than lowercase letters,
  // uppercase letters, spaces, hyphens, or apostrophes.
  // nameFirst is less than 2 characters or more than 20 characters.
  describe('Checking for invalid nameFirst', () => {
    test.each(invalidNames)('Check invalid nameLast for $name', ({ name }) => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'eric@unsw.edu.au',
          password: '1234abcd',
          nameFirst: name,
          nameLast: 'Yang'
        },
        timeout: TIMEOUT_MS
      });
      const userReturn = JSON.parse(user.body.toString());
      expect(userReturn).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Checking for valid nameFirst', () => {
    test.each(validNames)('Check valid nameFirst for $name', ({ name }) => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'eric@unsw.edu.au',
          password: '1234abcd',
          nameFirst: name,
          nameLast: 'Yang'
        },
        timeout: TIMEOUT_MS,
      });

      const userReturn = JSON.parse(user.body.toString());
      expect(userReturn).toStrictEqual({ token: expect.any(String) });
    });
  });

  // nameLast contains characters other than lowercase letters,
  // uppercase letters, spaces, hyphens, or apostrophes.
  // nameLast is less than 2 characters or more than 20 characters.

  describe('Checking for invalid nameLast', () => {
    test.each(invalidNames)('Check invalid nameLast for $name', ({ name }) => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'eric@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'Eric',
          nameLast: name
        },
        timeout: TIMEOUT_MS,
      });

      const userReturn = JSON.parse(user.body.toString());
      expect(userReturn).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Checking for valid nameLast', () => {
    test.each(validNames)('Check valid nameLast for $name', ({ name }) => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'eric@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'Eric',
          nameLast: name
        },
        timeout: TIMEOUT_MS,
      });

      const userReturn = JSON.parse(user.body.toString());
      expect(userReturn).toStrictEqual({ token: expect.any(String) });
    });
  });

  // Password is less than 8 characters.
  describe('Checking for invalid Password', () => {
    test.each(invalidPasswords)('Check invalid Password for $password', ({ password }) => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'eric@unsw.edu.au',
          password,
          nameFirst: 'Eric',
          nameLast: 'Yang'
        },
        timeout: TIMEOUT_MS,
      });

      const userReturn = JSON.parse(user.body.toString());
      expect(userReturn).toStrictEqual({ error: expect.any(String) });
    });
  });
});

/// ////////-----adminAuthLogin-----////////////
describe.skip('adminAuthLogin', () => {
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

    expect(resAuthLogin.statusCode).toStrictEqual(200);
    userId = JSON.parse(resAuthLogin.body.toString());
    expect(userId).toEqual({ token: expect.any(String) });
  });
});

/// //////-----adminUserPasswordUpdate-----//////////
describe.skip('test for adminUserPasswordUpdate', () => {
  let user1;
  let user1Return;
  let user1token: string;
  beforeEach(() => {
    user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ericMa@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma'
      },
      timeout: TIMEOUT_MS
    });
    user1Return = JSON.parse(user1.body.toString());
    user1token = user1Return.token;
  });

  // authUserId is not valid user
  test('invalid token', () => {
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
  });
});

/// ////////-----adminUserDetails-----////////////
describe.skip('test for adminUserDetails', () => {
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

// tests for adminUserDetailsUpdate
describe.skip('adminUserDetailsUpdate', () => {
  let admin: any;
  let adminToken: string;

  beforeEach(() => {
    const response = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'admin@unsw.edu.au',
        password: 'AdminPass1234',
        nameFirst: 'Admin',
        nameLast: 'User'
      },
      timeout: TIMEOUT_MS
    });
    admin = JSON.parse(response.body.toString());
    adminToken = admin.token;
  });

  test('Update user details successfully', () => {
    const updateResponse = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: adminToken,
        nameFirst: 'UpdatedFirst',
        nameLast: 'UpdatedLast',
        email: 'newadmin@unsw.edu.au'
      },
      timeout: TIMEOUT_MS
    });
    const updateResult = JSON.parse(updateResponse.body.toString());
    expect(updateResponse.statusCode).toStrictEqual(200);
    expect(updateResult).toStrictEqual({});
  });

  test('Update user details with invalid email', () => {
    const updateResponse = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: adminToken,
        nameFirst: 'UpdatedFirst',
        nameLast: 'UpdatedLast',
        email: 'invalidEmail'
      },
      timeout: TIMEOUT_MS
    });
    const updateResult = JSON.parse(updateResponse.body.toString());
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with invalid first name', () => {
    const updateResponse = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: adminToken,
        nameFirst: 'Invalid@Name',
        nameLast: 'UpdatedLast',
        email: 'newadmin@unsw.edu.au'
      },
      timeout: TIMEOUT_MS
    });
    const updateResult = JSON.parse(updateResponse.body.toString());
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with invalid last name', () => {
    const updateResponse = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: adminToken,
        nameFirst: 'UpdatedFirst',
        nameLast: 'Invalid@Name',
        email: 'newadmin@unsw.edu.au'
      },
      timeout: TIMEOUT_MS
    });
    const updateResult = JSON.parse(updateResponse.body.toString());
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with all empty fields', () => {
    const updateResponse = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: adminToken,
        nameFirst: '',
        nameLast: '',
        email: ''
      },
      timeout: TIMEOUT_MS
    });
    const updateResult = JSON.parse(updateResponse.body.toString());
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResult).toStrictEqual({ error: expect.any(String) });
  });
});

// adminUserLogout
describe('POST /v1/admin/auth/logout', () => {
  let user1;
  let user1Return;
  let user1token: string;

  beforeEach(() => {
    user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ericMa@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma'
      },
      timeout: TIMEOUT_MS
    });
    user1Return = JSON.parse(user1.body.toString());
    user1token = user1Return.token;
  });

  test('invalid token', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: JSON.stringify('invalidToken'),
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: JSON.stringify(''),
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('valid token', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: user1token,
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(200);
    expect(JSON.parse(result.body.toString())).toStrictEqual({});
  });

  test('logout and reuse token', () => {
    const result1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: user1token,
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result1.statusCode).toStrictEqual(200);

    const result2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: user1token,
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result2.statusCode).toStrictEqual(401);
    expect(JSON.parse(result2.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});
