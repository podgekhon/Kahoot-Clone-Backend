import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogout,
  requestAdminAuthLogoutv2
} from '../src/requestHelperFunctions';
import { tokenReturn } from '../src/interface';

beforeEach(() => {
  requestClear();
});

// adminUserLogout v1
describe('POST /v1/admin/auth/logout', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    user1 = requestAdminAuthRegister('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1token = (user1.body as tokenReturn).token;
  });

  test('empty token', () => {
    const result = requestAdminAuthLogout(' ');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid token', () => {
    const result = requestAdminAuthLogout('abcd');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('success logout', () => {
    const result = requestAdminAuthLogout(user1token);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual({ });
  });
});

// adminUserLogout v1
describe('POST /v1/admin/auth/logout', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    user1 = requestAdminAuthRegister('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1token = (user1.body as tokenReturn).token;
  });

  test('empty token', () => {
    const result = requestAdminAuthLogoutv2(' ');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid token', () => {
    const result = requestAdminAuthLogoutv2('abcd');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('success logout', () => {
    const result = requestAdminAuthLogoutv2(user1token);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual({ });
  });
});
