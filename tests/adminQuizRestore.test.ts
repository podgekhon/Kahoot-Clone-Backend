import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('test for quiz restore', () => {
  let user1;
  let quiz1;
  let user1token: string;
  let quiz1Id: number;
  beforeEach(() => {
    // register a user
    user1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'ericMa@unsw.edu.au',
          password: 'EricMa1234',
          nameFirst: 'Eric',
          nameLast: 'Ma'
        },
        timeout: TIMEOUT_MS
      }
    );
    user1token = JSON.parse(user1.body.toString()).token;
    // create a quiz
    quiz1 = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description: 'this is quiz 1'
        },
        timeout: TIMEOUT_MS
      }
    );
    quiz1Id = JSON.parse(quiz1.body.toString()).quizId;
    // remove a quiz
    request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}`,
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
  });

  test('restore successful', () => {
    // list the trash and quiz Info
    let result = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
      // quiz1 should be in the trash now
    expect(JSON.parse(result.body.toString())).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz1Id,
            name: 'quiz1',
          }
        ]
      }
    );
    // restore a quiz from the trash
    result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    const objBody = JSON.parse(result.body.toString());
    // check status code and return type
    expect(result.statusCode).toStrictEqual(200);
    expect(objBody).toStrictEqual({});
    // list the trash
    result = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    // nothing in the trash now
    expect(JSON.parse(result.body.toString())).toStrictEqual(
      {
        quizzes: []
      }
    );
    // list the quiz list
    result = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    // quiz1 should be back in quiz list
    expect(JSON.parse(result.body.toString())).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz1Id,
            name: 'quiz1'
          }
        ]
      }
    );
  });

  test('Quiz name of the restored quiz is already used by another active quiz', () => {
    // create quiz2 which name is 'quiz1'
    request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description: 'this is quiz 1'
        },
        timeout: TIMEOUT_MS
      }
    );
    // restore quiz1
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    // create quiz2
    const quiz2 = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz2',
          description: 'this is quiz 2'
        },
        timeout: TIMEOUT_MS
      }
    );
    const quiz2Id = JSON.parse(quiz2.body.toString()).quizId;
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz2Id}/restore`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: JSON.stringify('')
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid token', () => {
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: JSON.stringify('abcd')
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid quizId (quiz doesnt exist)', () => {
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id + 1}/restore`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(403);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('valid token, but user is not the owner', () => {
    const user2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'XiaoyuanMa@unsw.edu.au',
          password: 'EricMa1234',
          nameFirst: 'Xiaoyuan',
          nameLast: 'Ma'
        },
        timeout: TIMEOUT_MS
      }
    );
    const user2token = JSON.parse(user2.body.toString()).token;

    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: user2token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(403);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});
