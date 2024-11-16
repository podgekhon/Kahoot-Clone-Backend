import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminUserDetailsUpdate,
  requestAdminUserDetails,
  requestAdminUserDetailsUpdateV2
} from '../src/requestHelperFunctions';
import { tokenReturn } from '../src/interface';

beforeEach(() => {
  requestClear();
});

const routeVersions = [
  {
    version: 'v1',
    userDetails: requestAdminUserDetails,
    userUpdateFunction: requestAdminUserDetailsUpdate,
  },
  {
    version: 'v2',
    userDetails: requestAdminUserDetails,
    userUpdateFunction: requestAdminUserDetailsUpdateV2,
  }
];

/// ////////-----adminUserDetailsUpdate-----////////////
describe.each(routeVersions)('adminUserDetailsUpdate tests for $version route', (
  {
    userUpdateFunction,
  }) => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    user1 = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    user1token = (user1.body as tokenReturn).token;
  });

  test('invalid token', () => {
    const updateResponse = userUpdateFunction(
      'abcd',
      'newadmin@unsw.edu.au',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const updateResponse = userUpdateFunction(
      ' ',
      'newadmin@unsw.edu.au',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with invalid email', () => {
    const updateResponse = userUpdateFunction(
      user1token,
      'invalidemail',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with duplicate', () => {
    requestAdminAuthRegister('test2@gmail.com', 'validPassword6', 'Eric', 'Yang');

    const updateResponse = userUpdateFunction(
      user1token,
      'test2@gmail.com',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with invalid first name', () => {
    const updateResponse = userUpdateFunction(
      user1token,
      'newadmin@unsw.edu.au',
      '1',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with invalid last name', () => {
    const updateResponse = userUpdateFunction(
      user1token,
      'newadmin@unsw.edu.au',
      'Guanlin',
      '1'
    );
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with all empty fields', () => {
    const updateResponse = userUpdateFunction(' ', ' ', ' ', ' ');
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details successfully', () => {
    const updateResponse = userUpdateFunction(
      user1token,
      'newadmin@unsw.edu.au',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(200);
    expect(updateResponse.body).toStrictEqual({});

    const resDetails = requestAdminUserDetails(user1token);
    expect(resDetails.statusCode).toStrictEqual(200);
    expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
  });
});
