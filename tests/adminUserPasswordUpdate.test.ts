import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminUserPasswordUpdate,
  httpStatus,
  requestAdminAuthLogin,
  requestAdminUserPasswordUpdateV2
} from '../src/requestHelperFunctions';
import { tokenReturn } from '../src/interface';

const invalidPasswords = [
  { password: '12345678' },
  { password: 'abcdefgh' },
  { password: '1' },
  { password: '123456a' },
  { password: '' },
];

/// //////-----adminUserPasswordUpdate-----//////////
describe('test for adminUserPasswordUpdate', () => {
  let user1;
  let user1Token: string;

  beforeEach(() => {
    requestClear();
    user1 = requestAdminAuthRegister('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1Token = (user1.body as tokenReturn).token;
  });

  const testCase = [
    {
      version: 'v1',
      passwordUpdate: requestAdminUserPasswordUpdate,
    }, {
      version: 'v2',
      passwordUpdate: requestAdminUserPasswordUpdateV2
    }
  ];

  testCase.forEach(({ version, passwordUpdate }) => {
    describe(`Test for ${version}`, () => {
      // authUserId is not valid user
      test('invalid token', () => {
        const result = passwordUpdate(
          JSON.stringify('abcd'),
          'EricMa1234',
          '1234EricMa');
        expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });

      test('empty token', () => {
        const result = passwordUpdate(JSON.stringify(''), 'EricMa1234', '1234EricMa');
        expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });

      // Old password is not the correct old password
      test('old password is wrong', () => {
        const result = passwordUpdate(user1Token, 'wrongpassword', '1234EricMa');
        expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });

      // Old password and new password match exactly
      test('new password is same as the old one', () => {
        const result = passwordUpdate(user1Token, 'EricMa1234', 'EricMa1234');
        expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });

      // New password has already been used before by this user
      test('new password has been used before', () => {
        passwordUpdate(user1Token, 'EricMa1234', '1234EricMa');
        // update again
        const result = passwordUpdate(user1Token, '1234EricMa', 'EricMa1234');
        expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });

      // test for invalid passwords(too short, no characters/numbers)
      test('invalid new passwords', () => {
        invalidPasswords.forEach(({ password }) => {
          const result = passwordUpdate(user1Token, 'EricMa1234', password);
          expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(result.body).toStrictEqual({ error: expect.any(String) });
        });
      });

      // correct return type
      test('Correct return type', () => {
        const result = passwordUpdate(user1Token, 'EricMa1234', '1234EricMa');
        expect(result.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
        expect(result.body).toStrictEqual({});

        // try to login by using the old password
        // should fail
        let res = requestAdminAuthLogin('ericMa@unsw.edu.au', 'EricMa1234');
        expect(res.statusCode).toStrictEqual(400);
        expect(res.body).toStrictEqual({ error: expect.any(String) });

        // try to login with the new password
        // should success
        res = requestAdminAuthLogin('ericMa@unsw.edu.au', '1234EricMa');
        expect(res.statusCode).toStrictEqual(200);
        expect(res.body).toStrictEqual({ token: expect.any(String) });
      });
    });
  });
});
