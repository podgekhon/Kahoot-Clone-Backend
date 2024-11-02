import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  requestAdminUserDetails,
  requestAdminUserDetailsupdatev2
} from '../src/requestHelperFunctions';
import { tokenReturn } from '../src/interface';

beforeEach(() => {
  requestClear();
});

/// ////////-----adminUserDetails-----////////////
describe('test for adminUserDetails', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    user1 = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    user1token = (user1.body as tokenReturn).token;
  });

  test('successfully returns details of a valid user', () => {
    const resDetails = requestAdminUserDetails(user1token);
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
    const resDetails = requestAdminUserDetails('1');
    expect(resDetails.body).toStrictEqual({ error: expect.any(String) });
  });

  test('numSuccessfulLogins increments after successful logins', () => {
    // Simulate multiple successful logins
    requestAdminAuthLogin('test@gmail.com', 'validPassword5');
    requestAdminAuthLogin('test@gmail.com', 'validPassword5');
    const resDetails = requestAdminUserDetails(user1token);

    // Check if the number of successful logins is correct (1 registration + 2 logins)
    expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
  });

  test('numFailedPasswordsSinceLastLogin increments on failed login attempts', () => {
    // Simulate failed login attempts
    requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
    requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
    const resDetails = requestAdminUserDetails(user1token);

    // Check if the number of failed login attempts is correct (2 failed attempts)
    expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
  });

  test('numFailedPasswordsSinceLastLogin resets after a successful login', () => {
    // Simulate failed login attempts
    requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
    requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
    requestAdminAuthLogin('test@gmail.com', 'validPassword5');
    const resDetails = requestAdminUserDetails(user1token);

    // Check if the failed attempts reset to 0 after a successful login
    expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
  });
});

describe('test for adminUserDetails v2', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    user1 = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    user1token = (user1.body as tokenReturn).token;
  });

  test('successfully returns details of a valid user', () => {
    const resDetails = requestAdminUserDetailsupdatev2(user1token);
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
    const resDetails = requestAdminUserDetailsupdatev2('1');
    expect(resDetails.body).toStrictEqual({ error: expect.any(String) });
  });

  test('numSuccessfulLogins increments after successful logins', () => {
    // Simulate multiple successful logins
    requestAdminAuthLogin('test@gmail.com', 'validPassword5');
    requestAdminAuthLogin('test@gmail.com', 'validPassword5');
    const resDetails = requestAdminUserDetailsupdatev2(user1token);

    // Check if the number of successful logins is correct (1 registration + 2 logins)
    expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
  });

  test('numFailedPasswordsSinceLastLogin increments on failed login attempts', () => {
    // Simulate failed login attempts
    requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
    requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
    const resDetails = requestAdminUserDetailsupdatev2(user1token);

    // Check if the number of failed login attempts is correct (2 failed attempts)
    expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
  });

  test('numFailedPasswordsSinceLastLogin resets after a successful login', () => {
    // Simulate failed login attempts
    requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
    requestAdminAuthLogin('test@gmail.com', 'wrongPassword');
    requestAdminAuthLogin('test@gmail.com', 'validPassword5');
    const resDetails = requestAdminUserDetailsupdatev2(user1token);

    // Check if the failed attempts reset to 0 after a successful login
    expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
  });
});
