import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizRemove', () => {
  let quiz: any;
  let adminToken: string;

  beforeEach(() => {
    const registerResponse = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'admin@unsw.edu.au',
        password: 'AdminPass1234',
        nameFirst: 'Admin',
        nameLast: 'User'
      },
      timeout: TIMEOUT_MS
    });
    adminToken = JSON.parse(registerResponse.body.toString()).token;

    const createQuizResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: adminToken,
        name: 'Test Quiz',
        description: 'This is a test quiz'
      },
      timeout: TIMEOUT_MS
    });
    quiz = JSON.parse(createQuizResponse.body.toString());
  });

  test('Successfully delete quiz', () => {
    const deleteResponse = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`,
      {
        qs: {
          token: adminToken
        },
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(200);
    // has correct return type
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({});
    // has empty quiz list
    const quizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: adminToken
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(JSON.parse(quizList.body.toString())).toStrictEqual({
      quizzes: []
    });
    // one quiz in the trash list
    const trashList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        qs: {
          token: adminToken
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(JSON.parse(trashList.body.toString())).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Test Quiz'
        }
      ]
    });
  });

  test('Attempt to delete non-existent quiz', () => {
    const deleteResponse = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/9999?token=' + adminToken,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(403);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });
  });

  test('Attempt to delete quiz with invalid quiz ID format', () => {
    const deleteResponse = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/invalidID?token=' + adminToken,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(403);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });
  });

  test('Attempt to delete already deleted quiz', () => {
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}?token=${adminToken}`, {
      timeout: TIMEOUT_MS
    });

    const deleteResponse = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}?token=${adminToken}`,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(403);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });
  });

  test('Attempt to delete quiz by non-admin user', () => {
    const registerOtherResponse = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'otheruser@unsw.edu.au',
        password: 'OtherPass1234',
        nameFirst: 'Other',
        nameLast: 'User'
      },
      timeout: TIMEOUT_MS
    });
    const otherToken = JSON.parse(registerOtherResponse.body.toString()).token;

    const deleteResponse = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}?token=${otherToken}`,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(403);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const deleteResponse = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}?token=${''}`,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(401);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });
  });

  test('invalid token', () => {
		// log out user1
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: adminToken,
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(200);
    expect(JSON.parse(result.body.toString())).toStrictEqual({});
    // log in user2
    const resRegister = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'user2@gmail.com',
          password: 'validPassword5',
          nameFirst: 'Eric',
          nameLast: 'Ma'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(resRegister.statusCode).toStrictEqual(200);
		// invalid token
		const deleteResponse = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}?token=${adminToken}`,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(401);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });

  });
});
