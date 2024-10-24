import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Test for adminQuizTransfer', () => {
  let user1: { token: string};
  let user2: { token: string};

  let User1QuizList: string;
  let User2QuizList: string;

  let user1Token: string;

  beforeEach(() => {
    const resRegisterUser1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'user1@gmail.com',
          password: 'validPassword1',
          nameFirst: 'User',
          nameLast: 'One'
        },
        timeout: TIMEOUT_MS
      }
    );
    user1 = JSON.parse(resRegisterUser1.body.toString());
    expect(resRegisterUser1.statusCode).toStrictEqual(200);
    user1Token = user1.token;

    const resUser1QuizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user1Token,
        },
        timeout: TIMEOUT_MS,
      }
    );

    User1QuizList = JSON.parse(resUser1QuizList.body.toString());
    expect(resUser1QuizList.statusCode).toStrictEqual(200);
    expect(User1QuizList).toStrictEqual({
      quizzes: []
    });
  });

  test('Valid adminQuizTransfer', () => {
    const resRegisterUser2 = request(
      'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: 'user2@gmail.com',
            password: 'validPassword2',
            nameFirst: 'User',
            nameLast: 'Two',
          },
          timeout: 100,
        }
    );

    user2 = JSON.parse(resRegisterUser2.body.toString());
    expect(resRegisterUser2.statusCode).toStrictEqual(200);
    const user2Token = user2.token;

    const resCreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user2Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resCreateQuiz.statusCode).toStrictEqual(200);
    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    const resUser2QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user2Token,
          userEmail: 'user1@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(200);
    const quizTransfer = JSON.parse(resUser2QuizTransfer.body.toString());

    const resUser2QuizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user2Token,
        },
        timeout: TIMEOUT_MS,
      }
    );

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(200);
    User2QuizList = JSON.parse(resUser2QuizList.body.toString());

    expect(User2QuizList).toStrictEqual({
      quizzes: []
    });

    const resAfterTransferUser1QuizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user1Token,
        },
        timeout: TIMEOUT_MS,
      }
    );

    const afterTransferUser1Quizlist = JSON.parse(
      resAfterTransferUser1QuizList.body.toString()
    );

    expect(afterTransferUser1Quizlist).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Math Quiz',
        }
      ]
    });

    expect(quizTransfer).toStrictEqual({});
  });

  test('returns error receiver is not a real user', () => {
    const resCreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        },
        timeout: TIMEOUT_MS
      }
    );

    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    expect(resCreateQuiz.statusCode).toStrictEqual(200);

    const resUser1QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user1Token,
          userEmail: 'NotRealUser@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    const quizTransfer = JSON.parse(resUser1QuizTransfer.body.toString());

    expect(resUser1QuizTransfer.statusCode).toStrictEqual(400);
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error if user sends to themself', () => {
    const resCreateQuiz = request(
      'POST',
        `${url}:${port}/v1/admin/quiz`,
        {
          json: {
            token: user1Token,
            name: 'Math Quiz',
            description: 'this is a math quiz'
          }
        }
    );

    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    expect(resCreateQuiz.statusCode).toStrictEqual(200);

    const resUser1QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user1Token,
          userEmail: 'user1@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    const quizTransfer = JSON.parse(resUser1QuizTransfer.body.toString());

    expect(resUser1QuizTransfer.statusCode).toStrictEqual(400);
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error if receiver has a quiz with same name', () => {
    const resCreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resCreateQuiz.statusCode).toStrictEqual(200);

    const resRegisterUser2 = request(
      'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: 'user2@gmail.com',
            password: 'validPassword2',
            nameFirst: 'User',
            nameLast: 'Two',
          },
          timeout: 100,
        }
    );
    user2 = JSON.parse(resRegisterUser2.body.toString());
    expect(resRegisterUser2.statusCode).toStrictEqual(200);
    const user2Token = user2.token;

    const resUser2CreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user2Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resUser2CreateQuiz.statusCode).toStrictEqual(200);
    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    const resUser2QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user2Token,
          userEmail: 'user1@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    const quizTransfer = JSON.parse(resUser2QuizTransfer.body.toString());

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(400);
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });

  test('return error if token is invalid', () => {
    const resRegisterUser2 = request(
      'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: 'user2@gmail.com',
            password: 'validPassword2',
            nameFirst: 'User',
            nameLast: 'Two',
          },
          timeout: 100,
        }
    );

    user2 = JSON.parse(resRegisterUser2.body.toString());
    expect(resRegisterUser2.statusCode).toStrictEqual(200);
    const user2Token = user2.token;

    const resCreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user2Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resCreateQuiz.statusCode).toStrictEqual(200);
    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    const resUser2QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: '',
          userEmail: 'user1@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(401);
    const quizTransfer = JSON.parse(resUser2QuizTransfer.body.toString());
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });

  test('return error if user is not an owner of this quiz', () => {
    const resUser1CreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resUser1CreateQuiz.statusCode).toStrictEqual(200);
    const quiz = JSON.parse(resUser1CreateQuiz.body.toString());
    const quizId = quiz.quizId;

    const resRegisterUser2 = request(
      'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: 'user2@gmail.com',
            password: 'validPassword2',
            nameFirst: 'User',
            nameLast: 'Two',
          },
          timeout: 100,
        }
    );

    request(
      'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: 'user3@gmail.com',
            password: 'validPassword3',
            nameFirst: 'User',
            nameLast: 'Three',
          },
          timeout: 100,
        }
    );

    user2 = JSON.parse(resRegisterUser2.body.toString());
    expect(resRegisterUser2.statusCode).toStrictEqual(200);
    const user2Token = user2.token;

    const resUser2QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user2Token,
          userEmail: 'user3@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(403);
    const quizTransfer = JSON.parse(resUser2QuizTransfer.body.toString());
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });
});
