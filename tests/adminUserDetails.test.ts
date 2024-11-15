import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  requestAdminUserDetails,
  requestAdminUserDetailsv2
} from '../src/requestHelperFunctions';
import { tokenReturn } from '../src/interface';

/// ////////-----adminUserDetails-----////////////
describe('test for adminUserDetails', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    requestClear();
    user1 = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    user1token = (user1.body as tokenReturn).token;
  });
  const testCase = [
    {
      version: 'v1',
      userDetail: requestAdminUserDetails,
    }, {
      version: 'v2',
      userDetail: requestAdminUserDetailsv2,
    }
  ];
  testCase.forEach(({ version, userDetail }) => {
    describe(`Test for ${version}`, () => {
      test('successfully returns details of a valid user', () => {
        const resDetails = userDetail(user1token);
        expect(resDetails.body).toStrictEqual({
          user: {
            userId: expect.any(Number),
            name: 'Guanlin Kong',
            email: 'test@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        });
      });

      test('returns error when token is not valid', () => {
        const resDetails = userDetail('1');
        expect(resDetails.body).toStrictEqual({ error: expect.any(String) });
      });

      test('numSuccessfulLogins increments after successful logins', () => {
        // Simulate multiple successful logins
        requestAdminAuthLogin('test@gmail.com', 'validPassword5');
        requestAdminAuthLogin('test@gmail.com', 'validPassword5');
        const resDetails = userDetail(user1token);

        // Check if the number of successful logins is correct (1 registration + 2 logins)
        expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
      });

      test('numFailedPasswordsSinceLastLogin increments on failed login attempts', () => {
        // Simulate failed login attempts
        requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
        requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
        const resDetails = userDetail(user1token);

        // Check if the number of failed login attempts is correct (2 failed attempts)
        expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
      });

      test('numFailedPasswordsSinceLastLogin resets after a successful login', () => {
        // Simulate failed login attempts
        requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
        requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
        requestAdminAuthLogin('test@gmail.com', 'validPassword5');
        const resDetails = userDetail(user1token);

        // Check if the failed attempts reset to 0 after a successful login
        expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
      });
    });
  });
});
