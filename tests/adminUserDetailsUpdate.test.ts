import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminUserDetailsUpdate,
  requestAdminUserDetails
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

  test('invalid token', () => {
    const updateResponse = requestAdminUserDetailsUpdate(
      'abcd',
      'newadmin@unsw.edu.au',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const updateResponse = requestAdminUserDetailsUpdate(
      ' ',
      'newadmin@unsw.edu.au',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with invalid email', () => {
    const updateResponse = requestAdminUserDetailsUpdate(
      user1token,
      'invalidemail',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with invalid first name', () => {
    const updateResponse = requestAdminUserDetailsUpdate(
      user1token,
      'newadmin@unsw.edu.au',
      '1',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with invalid last name', () => {
    const updateResponse = requestAdminUserDetailsUpdate(
      user1token,
      'newadmin@unsw.edu.au',
      'Guanlin',
      '1'
    );
    expect(updateResponse.statusCode).toStrictEqual(400);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details with all empty fields', () => {
    const updateResponse = requestAdminUserDetailsUpdate(' ', ' ', ' ', ' ');
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details successfully', () => {
    const updateResponse = requestAdminUserDetailsUpdate(
      user1token,
      'newadmin@unsw.edu.au',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(200);
    expect(updateResponse.body).toStrictEqual({});

    // get user details, it should be updated
    const resDetails = requestAdminUserDetails(user1token);
    expect(resDetails.statusCode).toStrictEqual(200);
    expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
  });
});

describe('test for adminUserDetails V2', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    user1 = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    user1token = (user1.body as tokenReturn).token;
  });

  test('invalid token', () => {
    const updateResponse = requestAdminUserDetailsUpdate(
      'abcd',
      'newadmin@unsw.edu.au',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const updateResponse = requestAdminUserDetailsUpdate(
      ' ',
      'newadmin@unsw.edu.au',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Update user details successfully', () => {
    const updateResponse = requestAdminUserDetailsUpdate(
      user1token,
      'newadmin@unsw.edu.au',
      'Guanlin',
      'Kong'
    );
    expect(updateResponse.statusCode).toStrictEqual(200);
    expect(updateResponse.body).toStrictEqual({});

    // get user details, it should be updated
    const resDetails = requestAdminUserDetails(user1token);
    expect(resDetails.statusCode).toStrictEqual(200);
    expect(resDetails.body).toStrictEqual({ user: expect.any(Object) });
  });
});
