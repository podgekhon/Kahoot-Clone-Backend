import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('HTTP tests for quiz description update', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
    // Register a user
    const resRegister = request(
      'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: 'test@gmail.com',
            password: 'validPassword5',
            nameFirst: 'Patrick',
            nameLast: 'Chen',
          },
          timeout: 100,
        }
    );
    user = JSON.parse(resRegister.body as string);

    // Create a quiz
    const resCreateQuiz = request(
      'POST',
        `${url}:${port}/v1/admin/quiz`,
        {
          json: {
            token: user.token,
            name: 'validQuizName',
            description: 'validQuizDescription',
          },
          timeout: 100,
        }
    );
    quiz = JSON.parse(resCreateQuiz.body as string);
  });

  test('successfully updates the quiz description', () => {
    // Update the quiz description
    const resUpdateQuizDescription = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
        {
          json: {
            token: user.token,
            description: 'Updated description',
          },
          timeout: 100,
        }
    );

    expect(resUpdateQuizDescription.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({});

    // get quiz info
    // description should be updated
    const resQuizInfo = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
        {
          qs: { token: user.token },
          timeout: 100,
        }
    );
    expect(resQuizInfo.statusCode).toStrictEqual(200);
    expect(JSON.parse(resQuizInfo.body.toString())).toMatchObject({
      description: 'Updated description'
    });
  });

  test('successfully updates quiz description with an empty string', () => {
    // Update the quiz description with an empty string
    const resUpdateQuizDescription = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
        {
          json: {
            token: user.token,
            description: '',
          },
          timeout: 100,
        }
    );

    expect(resUpdateQuizDescription.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({});

    // get quiz info
    // description should be updated
    const resQuizInfo = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
        {
          qs: { token: user.token },
          timeout: 100,
        }
    );
    expect(resQuizInfo.statusCode).toStrictEqual(200);
    expect(JSON.parse(resQuizInfo.body.toString())).toMatchObject({ description: '' });
  });

  test('returns error when token is not valid', () => {
    // Attempt to update with an invalid token
    const resUpdateQuizDescription = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
        {
          json: {
            token: -1,
            description: 'New description',
          },
          timeout: 100,
        }
    );

    // Check for 401 error (invalid token)
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quizId is not valid', () => {
    // Attempt to update with an invalid quizId
    const resUpdateQuizDescription = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/999/description`,
        {
          json: {
            token: user.token,
            description: 'New description',
          },
          timeout: 100,
        }
    );

    expect(resUpdateQuizDescription.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user does not own the quiz', () => {
    // Register a second user
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
    const user2 = JSON.parse(resRegisterUser2.body as string);

    // User 2 tries to update User 1's quiz description
    const resUpdateQuizDescription = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
        {
          json: {
            token: user2.token,
            description: 'New description',
          },
          timeout: 100,
        }
    );

    // Check for 403 error (user not an owner of quiz)
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when description is longer than 100 characters', () => {
    // Attempt to update with a description longer than 100 characters
    const longDescription = 'ABC'.repeat(100);
    const resUpdateQuizDescription = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
        {
          json: {
            token: user.token,
            description: longDescription,
          },
          timeout: 100,
        }
    );

    // Check for httpStatus.BAD_REQUEST error (description too long)
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
});
