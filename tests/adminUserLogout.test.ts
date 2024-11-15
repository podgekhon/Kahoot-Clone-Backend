import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogout,
  requestAdminAuthLogoutV2
} from '../src/requestHelperFunctions';
import { tokenReturn } from '../src/interface';

// adminUserLogout v1
describe('POST /v1/admin/auth/logout', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    requestClear();
    user1 = requestAdminAuthRegister('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1token = (user1.body as tokenReturn).token;
  });
  const testCase = [
    {
      version: 'v1',
      userLogout: requestAdminAuthLogout,
    }, {
      version: 'v2',
      userLogout: requestAdminAuthLogoutV2,
    }
  ];
  testCase.forEach(({ version, userLogout }) => {
    describe(`Test for ${version}`, () => {
      test('empty token', () => {
        const result = userLogout(' ');
        expect(result.statusCode).toStrictEqual(401);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });

      test('invalid token', () => {
        const result = userLogout('abcd');
        expect(result.statusCode).toStrictEqual(401);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });

      test('success logout', () => {
        const result = userLogout(user1token);
        expect(result.statusCode).toStrictEqual(200);
        expect(result.body).toStrictEqual({ });
      });
    });
  });
});
