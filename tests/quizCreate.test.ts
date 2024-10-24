import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizCreate', () => {
  let user1;
  let user1token: string;
  beforeEach(() => {
    // register a user
    user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ericMa@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma'
      },
      timeout: TIMEOUT_MS
    });
    user1token = JSON.parse(user1.body.toString()).token;
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
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'Quiz1',
          description: 'lol invalid token'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: JSON.stringify(''),
          name: 'Quiz1',
          description: 'lol invalid token'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('name less than 3 characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: '1',
          description: 'lol too short'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('name more than 30 characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'fdjskalgeiowagheowagnwageowhgiowegwaogdlsagdslagiowaghowhagowaofdsgd',
          description: 'toooooo long'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('name more than 30 characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'fdjskalgeiowagheowagnwageowhgiowegwaogdlsagdslagiowaghowhagowaofdsgd',
          description: 'toooooo long'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('name contains invalid characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: '~hahha',
          description: 'lol invalid quiz name'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('name contains invalid characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: '~hahha',
          description: 'lol invalid quiz name'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('description is more than 100 characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description:
            'fdsajfoejgiowajiogiowagjoawoeoiwafoiwoshi' +
            'shabifoewajiojgeoiwagiowhauhueiwaiuguirdfsafdsa' +
            'fdsafoeahgioewghioagoieajgioewoaigjoiwegjioewagjoiweajgo'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('description is more than 100 characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description:
            'fdsajfoejgiowajiogiowagjoawoeoiwafoiwoshi' +
            'shabifoewajiojgeoiwagiowhauhueiwaiuguirdfsafdsa' +
            'fdsafoeahgioewghioagoieajgioewoaigjoiwegjioewagjoiweajgo'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('duplicate quiz names owned by same user', () => {
    request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description: 'this is the first quiz'
        },
        timeout: TIMEOUT_MS
      }
    );
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description: 'this is the second quiz with name of quiz1'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
  test('duplicate quiz names owned by same user', () => {
    request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description: 'this is the first quiz'
        },
        timeout: TIMEOUT_MS
      }
    );
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description: 'this is the second quiz with name of quiz1'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  // valid input tests
  test('valid inputs', () => {
    const result = request(
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
    expect(result.statusCode).toStrictEqual(200);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ quizId: expect.any(Number) });
    // has one quiz in quiz list
    const quizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(JSON.parse(quizList.body.toString())).toStrictEqual({
      quizzes: [
        {
          quizId: JSON.parse(result.body.toString()).quizId,
          name: 'quiz1'
        }
      ]
    });
  });
});
