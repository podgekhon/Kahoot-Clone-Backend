import { 
  requestAdminAuthRegister, 
  requestClear 
} from '../src/requestHelperFunctions';
import { userAuthRegister } from '../src/interface';

// import request from 'sync-request-curl';
// import { port, url } from './config.json';

// const SERVER_URL = `${url}:${port}`;
// const TIMEOUT_MS = 100 * 1000;

export enum httpStatus {
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  SUCCESSFUL_REQUEST = 200,
}

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

beforeEach(() => {
  requestClear();
});

describe('adminAuthRegister', () => {
  describe('Tests with 1 ordinary user', () => {
    let user1: userAuthRegister;
    let user2: userAuthRegister;
    let user3: userAuthRegister;
    let user4: userAuthRegister;
    beforeEach(() => {
      user1 = requestAdminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    });

    // valid cases checking
    test('Check multiple invalid and valid registrations', () => {
      user2 = requestAdminAuthRegister('pat@unsw.edu.au', '1234ABCD', 'Pat', 'Yang');
      user3 = requestAdminAuthRegister('sam@unsw.edu.au', '12', 'Sam', 'Yang');
      user4 = requestAdminAuthRegister('andrew', '1234abcd', 'Andrew', 'Yang');

      // Assertions for valid and invalid cases
      expect(user1.body).toStrictEqual({ token: expect.any(String) });
      expect(user1.statusCode).toStrictEqual(200);

      expect(user2.body).toStrictEqual({ token: expect.any(String) });

      expect(user3.body).toStrictEqual({ error: expect.any(String) });
      expect(user3.statusCode).toStrictEqual(400);

      expect(user4.body).toStrictEqual({ error: expect.any(String) });
      expect(user4.statusCode).toStrictEqual(400);
    });

    // Email address is used by another user.
    test('Check duplicate email', () => {
      user2 = requestAdminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Pat', 'Yang');
      expect(user2.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Registering two people with the same name and passwords', () => {
      user2 = requestAdminAuthRegister('pat@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
      expect(user1.body).toStrictEqual({ token: expect.any(String) });
      expect(user2.body).toStrictEqual({ token: expect.any(String) });
    });
  });

  // Email does not satisfy validator.isEmail function
  test.each(invalidEmails)('Check invalid email', ({ email }) => {
    const user: userAuthRegister = requestAdminAuthRegister(
      email,
      'password123',
      'Eric',
      'Yang'
    );
    expect(user.body).toStrictEqual({ error: expect.any(String) });
  });

  // Unusual But Valid Characters in Emails
  test('valid email with + symbol', () => {
    const user: userAuthRegister = requestAdminAuthRegister(
      'eric+@unsw.edu.au',
      '1234abcd',
      'Eric',
      'Yang'
    );
    expect(user.body).toStrictEqual({ token: expect.any(String) });
  });

  // nameFirst contains characters other than lowercase letters,
  // uppercase letters, spaces, hyphens, or apostrophes.
  // nameFirst is less than 2 characters or more than 20 characters.
  describe('Checking for invalid nameFirst', () => {
    test.each(invalidNames)('Check invalid nameFirst for $name', ({ name }) => {
      const user: userAuthRegister = requestAdminAuthRegister(
        'eric@unsw.edu.au',
        '1234abcd',
        name,
        'Yang'
      );
      expect(user.body).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Checking for valid nameFirst', () => {
    test.each(validNames)('Check valid nameFirst for $name', ({ name }) => {
      const user: userAuthRegister = requestAdminAuthRegister(
        'eric@unsw.edu.au',
        '1234abcd',
        name,
        'Yang'
      );
      expect(user.body).toStrictEqual({ token: expect.any(String) });
    });
  });

  // nameLast contains characters other than lowercase letters,
  // uppercase letters, spaces, hyphens, or apostrophes.
  // nameLast is less than 2 characters or more than 20 characters.
  describe('Checking for invalid nameLast', () => {
    test.each(invalidNames)('Check invalid nameLast for $name', ({ name }) => {
      const user: userAuthRegister = requestAdminAuthRegister(
        'eric@unsw.edu.au',
        '1234abcd',
        'Eric',
        name
      );
      expect(user.body).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Checking for valid nameLast', () => {
    test.each(validNames)('Check valid nameLast for $name', ({ name }) => {
      const user: userAuthRegister = requestAdminAuthRegister(
        'eric@unsw.edu.au',
        '1234abcd',
        'Eric',
        name
      );
      expect(user.body).toStrictEqual({ token: expect.any(String) });
    });
  });

  // Password is less than 8 characters.
  describe('Checking for invalid Password', () => {
    test.each(invalidPasswords)('Check invalid Password for $password', ({ password }) => {
      const user: userAuthRegister = requestAdminAuthRegister(
        'eric@unsw.edu.au',
        password,
        'Eric',
        'Yang'
      );
      expect(user.body).toStrictEqual({ error: expect.any(String) });
    });
  });
});
