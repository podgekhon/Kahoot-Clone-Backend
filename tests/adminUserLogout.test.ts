import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogout,
  requestAdminUserDetails
} from '../src/requestHelperFunctions';
import { tokenReturn } from '../src/interface';

beforeEach(() => {
  requestClear();
});

// adminUserLogout
describe('POST /v1/admin/auth/logout', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    user1 = requestAdminAuthRegister('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1token = (user1.body as tokenReturn).token;
  });

  test('invalid token', () => {
    const result = requestAdminAuthLogout('1');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = requestAdminAuthLogout(' ');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('logout and reuse token', () => {
    const result1 = requestAdminAuthLogout(user1token);
    expect(result1.statusCode).toStrictEqual(200);
    const result2 = requestAdminAuthLogout(user1token);
    expect(result2.statusCode).toStrictEqual(401);
    expect(result2.body).toStrictEqual({ error: expect.any(String) });
  });

  test('valid token and success to logout', () => {
    const result = requestAdminAuthLogout(user1token);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual({});

    // try to get details after logout
    // should fail
    const resDetails = requestAdminUserDetails(user1token);
    expect(resDetails.statusCode).toStrictEqual(401);
    expect(resDetails.body).toStrictEqual({ error: expect.any(String) });
  });
});
