import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizNameUpdate', () => {
  // invalid input tests
  let user1;
  let quiz1;
  let user1token: string;
  let quiz1Id: number;
  beforeEach(() => {
    user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ericMa@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma',
      },
      timeout: TIMEOUT_MS,
    });
    user1token = JSON.parse(user1.body.toString()).token;

    quiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'quiz1',
        description: 'this is quiz 1',
      },
      timeout: TIMEOUT_MS,
    });
    quiz1Id = JSON.parse(quiz1.body.toString()).quizId;
  });

  test('invalid token', () => {
  // log out user1
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: user1token,
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
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

    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user1token,
          name: 'newQuizName',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('empty token', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: JSON.stringify(''),
          name: 'newQuizName',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('invalid quizId', () => {
    const result = request('PUT', SERVER_URL + `/v1/admin/quiz/${10}/name`, {
      json: {
        token: user1token,
        name: 'newQuizName',
      },
    });
    expect(result.statusCode).toStrictEqual(403);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('user does not own quizId', () => {
    const user2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ee@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma',
      },
      timeout: TIMEOUT_MS,
    });
    const user2token = JSON.parse(user2.body.toString()).token;

    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user2token,
          name: 'newQuizName',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(403);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('name contains invalid characters', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user1token,
          name: 'newQuizName~!',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('name less than 3 characters', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user1token,
          name: '1',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('name more than 30 characters', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user1token,
          name:
              'fdsafdsgesagewagawggdsa' +
              'fdsafdsagsagewagafdsafdsafdsafdsafdsafsafdgregrehes',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('duplicate quiz names owned by same user', () => {
    const quiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'quiz2',
        description: 'this is quiz 2',
      },
      timeout: TIMEOUT_MS,
    });
    const quiz2Id = JSON.parse(quiz2.body.toString()).quizId;

    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz2Id}/name`,
      {
        json: {
          token: user1token,
          name: 'quiz1',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('updated successfully', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user1token,
          name: 'newQuizName',
        },
      }
    );
      // has correct status code and return type
    expect(result.statusCode).toStrictEqual(200);
    expect(JSON.parse(result.body.toString())).toStrictEqual({});

    // get info about current quiz
    // name should be updated
    const resQuizInfo = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quiz1Id}`,
        {
          qs: { token: user1token },
          timeout: 100,
        }
    );
    expect(resQuizInfo.statusCode).toStrictEqual(200);
    expect(JSON.parse(resQuizInfo.body.toString())).toMatchObject({
      name: 'newQuizName'
    });
  });
});
