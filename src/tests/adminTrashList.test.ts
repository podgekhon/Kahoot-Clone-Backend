import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

// tests for trash list
describe('adminTrashList', () => {
  let adminToken: string;
  let quizId: number;

  beforeEach(() => {
    const response = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'admin@unsw.edu.au',
          password: 'AdminPass1234',
          nameFirst: 'Admin',
          nameLast: 'User'
        },
        timeout: TIMEOUT_MS
      });
    adminToken = JSON.parse(response.body as string).token;

    const quizResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Sample Quiz',
        description: 'This is a sample quiz.'
      },
      timeout: TIMEOUT_MS
    });
    const quiz = JSON.parse(quizResponse.body as string);
    quizId = quiz.quizId;
  });

  test('empty token', () => {
    const trashListResponse = request('GET', `${SERVER_URL}/v1/admin/quiz/trash?token=12345`, {
      json: { token: 12345 },
      timeout: TIMEOUT_MS
    });
    expect(trashListResponse.statusCode).toStrictEqual(401);
    expect(JSON.parse(trashListResponse.body.toString())).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Get trash list with invalid format token', () => {
    const trashListResponse = request('GET', `${SERVER_URL}/v1/admin/quiz/trash?token=12345`, {
      json: { token: 12345 },
      timeout: TIMEOUT_MS
    });
    expect(trashListResponse.statusCode).toStrictEqual(401);
  });

  test('Get trash list with valid token but missing fields in response', () => {
    request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
      json: { token: adminToken },
      timeout: TIMEOUT_MS
    });

    const trashListResponse = request(
      'GET',
      `${SERVER_URL}/v1/admin/quiz/trash?token=${adminToken}`,
      {
        json: { token: adminToken },
        timeout: TIMEOUT_MS,
      }
    );
    const trashList = JSON.parse(trashListResponse.body.toString());
    expect(trashListResponse.statusCode).toStrictEqual(200);
    expect(trashList).toHaveProperty('quizzes');
  });

  test('Get trash list with token from different user', () => {
    const newAdminResponse = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'newadmin@unsw.edu.au',
        password: 'NewAdminPass1234',
        nameFirst: 'New',
        nameLast: 'Admin'
      },
      timeout: TIMEOUT_MS
    });
    const newAdmin = JSON.parse(newAdminResponse.body.toString());
    const newAdminToken = newAdmin.token;

    const trashListResponse = request(
      'GET',
      `${SERVER_URL}/v1/admin/quiz/trash?token=${newAdminToken}`,
      {
        json: { token: newAdminToken },
        timeout: TIMEOUT_MS,
      }
    );
    const trashList = JSON.parse(trashListResponse.body.toString());
    expect(trashListResponse.statusCode).toStrictEqual(200);
    expect(trashList).toHaveProperty('quizzes');
  });
});
