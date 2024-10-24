import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

/// ////////-----adminQuizList-----////////////
describe('adminQuizList', () => {
  let user: { token: string};
  let quizList: string;
  let userToken: string;

  beforeEach(() => {
    const resRegister = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'test@gmail.com',
          password: 'validPassword5',
          nameFirst: 'Patrick',
          nameLast: 'Chen'
        },
        timeout: TIMEOUT_MS
      }
    );
    user = JSON.parse(resRegister.body.toString());
    expect(resRegister.statusCode).toStrictEqual(200);
    userToken = user.token;
  });

  test('returns an empty list when user has no quizzes', () => {
    const resAdminQuizlist = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list', {
        qs: {
          token: userToken,
        },
        timeout: TIMEOUT_MS,
      }
    );

    quizList = JSON.parse(resAdminQuizlist.body.toString());
    expect(resAdminQuizlist.statusCode).toStrictEqual(200);
    expect(quizList).toStrictEqual({ quizzes: [] });
  });

  test('returns a list of quizzes owned by the user', () => {
    // create a quiz
    request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: userToken,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );
    // create another quiz
    request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: userToken,
          name: 'English Quiz',
          description: 'this is an English quiz'
        }
      }
    );

    const resAdminQuizlist = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list', {
        qs: {
          token: userToken,
        },
        timeout: TIMEOUT_MS,
      }
    );

    quizList = JSON.parse(resAdminQuizlist.body.toString());
    expect(resAdminQuizlist.statusCode).toStrictEqual(200);
    expect(quizList).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Math Quiz'
        },
        {
          quizId: expect.any(Number),
          name: 'English Quiz'
        },
      ]
    });
  });

  test('returns an error when token is invalid', () => {
    // log out user1
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: userToken,
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

    // now user 2 is logged in, user 1 logged out
    const resAdminQuizlist = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list', {
        qs: {
          token: userToken,
        },
        timeout: TIMEOUT_MS,
      }
    );
    expect(resAdminQuizlist.statusCode).toStrictEqual(401);
    const quizList = JSON.parse(resAdminQuizlist.body.toString());
    expect(quizList).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const resAdminQuizlist = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list', {
        qs: {
          token: JSON.stringify(''),
        },
        timeout: TIMEOUT_MS,
      }
    );
    expect(resAdminQuizlist.statusCode).toStrictEqual(401);
    const quizList = JSON.parse(resAdminQuizlist.body.toString());
    expect(quizList).toStrictEqual({ error: expect.any(String) });
  });
});
