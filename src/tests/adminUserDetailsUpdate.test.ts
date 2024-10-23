import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

// tests for adminUserDetailsUpdate
describe('adminUserDetailsUpdate', () => {
  let admin;
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

  test('invalid token', () => {
    const updateResponse = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: JSON.stringify('abcd'),
        nameFirst: 'UpdatedFirst',
        nameLast: 'UpdatedLast',
        email: 'ericMa@unsw.edu.au'
      },
      timeout: TIMEOUT_MS
    });
    const updateResult = JSON.parse(updateResponse.body.toString());
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResult).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const updateResponse = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: JSON.stringify(''),
        nameFirst: 'UpdatedFirst',
        nameLast: 'UpdatedLast',
        email: 'ericMa@unsw.edu.au'
      },
      timeout: TIMEOUT_MS
    });
    const updateResult = JSON.parse(updateResponse.body.toString());
    expect(updateResponse.statusCode).toStrictEqual(401);
    expect(updateResult).toStrictEqual({ error: expect.any(String) });
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

  test('Update user details successfully', () => {
    const updateResponse = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: adminToken,
        nameFirst: 'Eric',
        nameLast: 'Ma',
        email: 'newadmin@unsw.edu.au'
      },
      timeout: TIMEOUT_MS
    });
    const updateResult = JSON.parse(updateResponse.body.toString());
    expect(updateResponse.statusCode).toStrictEqual(200);
    expect(updateResult).toStrictEqual({});

    // get user details, it should be updated

    const resDetails = request(
      'GET',
      `${url}:${port}/v1/admin/user/details`,
      {
        qs: {
          token: adminToken,
        },
        timeout: 100,
      }
    );
    const result = JSON.parse(resDetails.body as string);
    expect(resDetails.statusCode).toStrictEqual(200);
    expect(result).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Eric Ma',
        email: 'newadmin@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});
