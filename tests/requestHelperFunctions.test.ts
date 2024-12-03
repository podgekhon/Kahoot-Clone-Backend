import
{
  requestAdminAuthLogin,
  requestAdminAuthRegister
} from '../src/requestHelperFunctions';
import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

describe('requestAdminAuthLogin', () => {
  beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  });

  test('Successful login request', () => {
    requestAdminAuthRegister(
      'user@gmail.com',
      'validPassword1',
      'user',
      'one'
    );
    const response = requestAdminAuthLogin('user@gmail.com', 'validPassword1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('Invalid email login request', () => {
    const response = requestAdminAuthLogin('invalidEmail@gmail.com', 'validPassword1');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('Invalid password login request', () => {
    const response = requestAdminAuthLogin('validEmail@gmail.com', 'invalidPassword');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});


