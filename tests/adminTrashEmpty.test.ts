import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

// tests for adminTrashEmpty
describe('Tests for adminTrashEmpty', () => {
  describe('Tests for adminTrashEmpty with one quiz', () => {
    let admin: { token: string };
    let quizId: number;

    beforeEach(() => {
      // Register an admin user
      const resRegister = request(
        'POST',
          `${SERVER_URL}/v1/admin/auth/register`,
          {
            json: {
              email: 'admin@unsw.edu.au',
              password: 'AdminPass1234',
              nameFirst: 'Admin',
              nameLast: 'User',
            },
            timeout: TIMEOUT_MS,
          }
      );
      admin = JSON.parse(resRegister.body as string);

      // Create a quiz and get its ID
      const resCreateQuiz = request(
        'POST',
          `${SERVER_URL}/v1/admin/quiz`,
          {
            json: {
              token: admin.token,
              name: 'Sample Quiz',
              description: 'This is a sample quiz.',
            },
            timeout: TIMEOUT_MS,
          }
      );
      const quizResponse = JSON.parse(resCreateQuiz.body as string);
      quizId = quizResponse.quizId;

      // Simulate moving the quiz to trash
      request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
        qs: {
          token: admin.token
        },
        timeout: TIMEOUT_MS,
      });
    });

    test('successfully empties trash with valid token and valid quiz IDs', () => {
      const Response = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: admin.token,
              quizIds: JSON.stringify([quizId]),
            },
            timeout: TIMEOUT_MS,
          }
      );
      const parsedBody = JSON.parse(Response.body.toString());
      expect(Response.statusCode).toStrictEqual(200);
      expect(parsedBody).toStrictEqual({});
    });

    test('returns 401 error for invalid token', () => {
      const emptyResponse = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: 'invalid_token',
              quizIds: JSON.stringify([quizId]),
            },
            timeout: TIMEOUT_MS,
          }
      );

      expect(emptyResponse.statusCode).toStrictEqual(401);
      expect(JSON.parse(emptyResponse.body as string)).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('returns 401 error for empty token', () => {
      const emptyResponse = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: '',
              quizIds: JSON.stringify([quizId]),
            },
            timeout: TIMEOUT_MS,
          }
      );

      expect(emptyResponse.statusCode).toStrictEqual(401);
      expect(JSON.parse(emptyResponse.body as string)).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('returns 400 error for quiz ID not in trash', () => {
      const emptyResponse = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: admin.token,
              // An ID that doesn't exist
              quizIds: JSON.stringify([999]),
            },
            timeout: TIMEOUT_MS,
          }
      );

      expect(emptyResponse.statusCode).toStrictEqual(400);
      expect(JSON.parse(emptyResponse.body as string)).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('returns 403 error for quiz ID that does not belong to the current user', () => {
      // Create a new admin user
      const resRegisterNewAdmin = request(
        'POST',
          `${SERVER_URL}/v1/admin/auth/register`,
          {
            json: {
              email: 'newadmin@unsw.edu.au',
              password: 'NewAdminPass1234',
              nameFirst: 'New',
              nameLast: 'Admin',
            },
            timeout: TIMEOUT_MS,
          }
      );
      const newAdmin = JSON.parse(resRegisterNewAdmin.body as string);

      // Attempt to empty the trash using the new admin's token
      const emptyResponse = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: newAdmin.token,
              // The quiz ID that belongs to the original admin
              quizIds: JSON.stringify([quizId]),
            },
            timeout: TIMEOUT_MS,
          }
      );

      expect(emptyResponse.statusCode).toStrictEqual(403);
      expect(JSON.parse(emptyResponse.body as string)).toStrictEqual({
        error: expect.any(String),
      });
    });
  });

  describe('Tests for adminTrashEmpty with Multiple Quiz IDs', () => {
    let admin: { token: string };
    let quizIds: number[] = [];
    let quizResponse: { quizId: number };
    beforeEach(() => {
      // Register an admin user
      quizIds = [];
      const resRegister = request(
        'POST',
        `${SERVER_URL}/v1/admin/auth/register`,
        {
          json: {
            email: 'admin@unsw.edu.au',
            password: 'AdminPass1234',
            nameFirst: 'Admin',
            nameLast: 'User',
          },
          timeout: TIMEOUT_MS,
        });
      admin = JSON.parse(resRegister.body as string);

      for (let i = 0; i < 5; i++) {
        const resCreateQuiz = request(
          'POST',
          `${SERVER_URL}/v1/admin/quiz`,
          {
            json: {
              token: admin.token,
              name: `Sample Quiz ${i + 1}`,
              description: `This is sample quiz number ${i + 1}.`,
            },
            timeout: TIMEOUT_MS,
          }
        );

        quizResponse = JSON.parse(resCreateQuiz.body as string);
        quizIds.push(quizResponse.quizId);

        // Simulate moving the quiz to trash
        request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizResponse.quizId}`, {
          qs: { token: admin.token },
          timeout: TIMEOUT_MS,
        });
      }
    });

    test('successfully empties trash with valid token and duplicated quiz IDs', () => {
      const emptyResponse = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: admin.token,
              // Passing a duplicate quiz ID
              quizIds: JSON.stringify([quizIds[0], quizIds[0]]),
            },
            timeout: TIMEOUT_MS,
          }
      );
      const parsedBody = JSON.parse(emptyResponse.body.toString());
      expect(emptyResponse.statusCode).toStrictEqual(200);
      expect(parsedBody).toStrictEqual({});
    });

    test('successfully empties trash with multiple valid quiz IDs', () => {
      const emptyResponse = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: admin.token,
              quizIds: JSON.stringify(quizIds),
            },
            timeout: TIMEOUT_MS,
          }
      );
      const parsedBody = JSON.parse(emptyResponse.body.toString());
      expect(emptyResponse.statusCode).toStrictEqual(200);
      expect(parsedBody).toStrictEqual({});
    });

    test('successfully empties trash with valid token and subset of valid quiz IDs', () => {
      const emptyResponse = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: admin.token,
              // Passing a subset of quiz IDs
              quizIds: JSON.stringify([quizIds[0], quizIds[2]]),
            },
            timeout: TIMEOUT_MS,
          }
      );
      const parsedBody = JSON.parse(emptyResponse.body.toString());
      expect(emptyResponse.statusCode).toStrictEqual(200);
      expect(parsedBody).toStrictEqual({});
    });

    test('Emptying trash with mixed valid and invalid quiz IDs', () => {
      const emptyResponse = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: admin.token,
              quizIds: JSON.stringify([quizIds[1], 9999, quizIds[3]]),
            },
            timeout: TIMEOUT_MS,
          }
      );

      expect(emptyResponse.statusCode).toStrictEqual(400);
      expect(JSON.parse(emptyResponse.body as string)).toStrictEqual({
        error: expect.any(String),
      });
    });
    test('empty trash with negative quiz ID values', () => {
      const quizIds = [-1, -2, -3];
      const emptyResponse = request(
        'DELETE',
          `${SERVER_URL}/v1/admin/quiz/trash/empty`,
          {
            qs: {
              token: admin.token,
              quizIds: JSON.stringify(quizIds),
            },
            timeout: TIMEOUT_MS,
          }
      );
      expect(emptyResponse.statusCode).toStrictEqual(400);
      expect(JSON.parse(emptyResponse.body as string)).toStrictEqual({
        error: expect.any(String),
      });
    });
  });
});
