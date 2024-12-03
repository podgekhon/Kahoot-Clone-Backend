// import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

import { mocked } from 'jest-mock';
import request, { Response } from 'sync-request-curl';
jest.mock('sync-request-curl'); // Mock the library
import {
  userAuthRegister,
  authLoginResponse,
  tokenReturn
} from '../src/interface';
import {
  requestAdminAuthLogin,
  requestAdminAuthRegister,
  requestAdminUserDetails
} from '../src/requestHelperFunctions';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

/// ////////-----adminAuthLogin-----////////////
describe('adminAuthLogin', () => {
  let user: userAuthRegister;
  let authLogin: authLoginResponse;

  beforeEach(() => {
    user = requestAdminAuthRegister(
      'user@gmail.com',
      'validPassword1',
      'user',
      'one'
    );
    expect(user.statusCode).toStrictEqual(200);
  });

  // test for email address doesn't exists when login
  test('Check invalid email', () => {
    authLogin = requestAdminAuthLogin('invalidEmail@gmail.com', 'validPassword1');
    expect(authLogin.statusCode).toStrictEqual(400);
    expect(authLogin.body).toEqual({ error: expect.any(String) });
  });

  // test for incorrect password login
  test('password not correct', () => {
    authLogin = requestAdminAuthLogin(
      'invalidEmail@gmail.com',
      'invalidPassword1'
    );

    expect(authLogin.statusCode).toStrictEqual(400);
    expect(authLogin.body).toEqual({ error: expect.any(String) });
  });

  // test for successful login
  test('successful login', () => {
    authLogin = requestAdminAuthLogin(
      'user@gmail.com',
      'validPassword1'
    );
    expect(authLogin.statusCode).toStrictEqual(200);
    expect(authLogin.body).toEqual({ token: expect.any(String) });
    // get user details

    const res = requestAdminUserDetails((authLogin.body as tokenReturn).token);
    // show the correct user details
    expect(res.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'user one',
        email: 'user@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});


describe('requestAdminAuthLogin helper function', () => {
  const mockRequest = mocked(request);

  beforeEach(() => {
    mockRequest.mockClear();
  });

  test('should return the parsed body and statusCode for a successful login', () => {
    // Mock the `request` response for a successful login
    mockRequest.mockReturnValueOnce({
      headers: {},
      getBody: () => Buffer.from(JSON.stringify({ token: 'fake-token' })),
      body: Buffer.from(JSON.stringify({ token: 'fake-token' })), // Optional
      statusCode: 200,
      url: 'mock-url',
    } as unknown as Response);

    const result = requestAdminAuthLogin('user@gmail.com', 'validPassword1');

    expect(mockRequest).toHaveBeenCalledWith('POST', expect.stringContaining('/v1/admin/auth/login'), {
      json: { email: 'user@gmail.com', password: 'validPassword1' },
      timeout: expect.any(Number),
    });

    expect(result).toEqual({
      body: { token: 'fake-token' },
      statusCode: 200,
    });
  });

  test('should handle an error response correctly', () => {
    // Mock the `request` response for an error
    mockRequest.mockReturnValueOnce({
      headers: {},
      getBody: () => Buffer.from(JSON.stringify({ error: 'EMAIL_NOT_EXISTS' })),
      body: Buffer.from(JSON.stringify({ error: 'EMAIL_NOT_EXISTS' })), // Optional
      statusCode: 400,
      url: 'mock-url',
    } as unknown as Response);

    const result = requestAdminAuthLogin('invalidEmail@gmail.com', 'validPassword1');

    expect(mockRequest).toHaveBeenCalledWith('POST', expect.stringContaining('/v1/admin/auth/login'), {
      json: { email: 'invalidEmail@gmail.com', password: 'validPassword1' },
      timeout: expect.any(Number),
    });

    expect(result).toEqual({
      body: { error: 'EMAIL_NOT_EXISTS' },
      statusCode: 400,
    });
  });

  test('should throw if `request` throws an error', () => {
    // Simulate a network failure
    mockRequest.mockImplementationOnce(() => {
      throw new Error('Network Error');
    });

    expect(() => {
      requestAdminAuthLogin('user@gmail.com', 'validPassword1');
    }).toThrow('Network Error');
  });
});