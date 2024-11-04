import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminTrashEmpty,
  requestAdminQuizRemove,
  requestAdminQuizCreateV2,
  requestAdminTrashEmptyV2,
  requestAdminQuizRemoveV2,
  requestClear
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse
} from '../src/interface';

import {
  httpStatus
} from '../src/requestHelperFunctions';

beforeEach(() => {
  requestClear();
});

// tests for adminTrashEmpty
describe('Tests for adminTrashEmpty', () => {
  describe('Tests for adminTrashEmpty with one quiz', () => {
    let admin: { token: string };
    let quizId: number;

    beforeEach(() => {
      // Register an admin user
      const resRegister = requestAdminAuthRegister(
        'admin@unsw.edu.au',
        'AdminPass1234',
        'Admin',
        'User'
      );
      admin = resRegister.body as tokenReturn;

      // Create a quiz and get its ID
      const resCreateQuiz = requestAdminQuizCreate(
        admin.token,
        'Sample Quiz',
        'This is a sample quiz.'
      );
      quizId = (resCreateQuiz.body as quizCreateResponse).quizId;

      // Simulate moving the quiz to trash
      requestAdminQuizRemove(quizId, admin.token);
    });

    test('successfully empties trash with valid token and valid quiz IDs', () => {
      const emptyResponse = requestAdminTrashEmpty(admin.token, [quizId]);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      expect(emptyResponse.body).toStrictEqual({});
    });

    test('returns 401 error for invalid token', () => {
      const emptyResponse = requestAdminTrashEmpty('invalid_token', [quizId]);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
      expect(emptyResponse.body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('returns 401 error for empty token', () => {
      const emptyResponse = requestAdminTrashEmpty('', [quizId]);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
      expect(emptyResponse.body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('returns 400 error for quiz ID not in trash', () => {
      const emptyResponse = requestAdminTrashEmpty(admin.token, [999]);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(emptyResponse.body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('quiz ID that does not belong to the current user', () => {
      // Create a new admin user
      const resRegisterNewAdmin = requestAdminAuthRegister(
        'newadmin@unsw.edu.au',
        'NewAdminPass1234',
        'New',
        'Admin'
      );
      const newAdmin = resRegisterNewAdmin.body as tokenReturn;

      // Attempt to empty the trash using the new admin's token
      const emptyResponse = requestAdminTrashEmpty(newAdmin.token, [quizId]);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
      expect(emptyResponse.body).toStrictEqual({
        error: expect.any(String),
      });
    });
  });

  describe('Tests for adminTrashEmpty with Multiple Quiz IDs', () => {
    let admin: { token: string };
    let quizIds: number[] = [];

    beforeEach(() => {
      quizIds = [];
      // Register an admin user
      const resRegister = requestAdminAuthRegister(
        'admin@unsw.edu.au',
        'AdminPass1234',
        'Admin',
        'User'
      );
      admin = resRegister.body as tokenReturn;

      for (let i = 0; i < 5; i++) {
        const resCreateQuiz = requestAdminQuizCreate(
          admin.token,
          `Sample Quiz ${i + 1}`,
          `This is sample quiz number ${i + 1}.`
        );
        const quizId = (resCreateQuiz.body as quizCreateResponse).quizId;
        quizIds.push(quizId);

        // Simulate moving the quiz to trash
        requestAdminQuizRemove(quizId, admin.token);
      }
    });

    test('successfully empties trash with valid token and duplicated quiz IDs', () => {
      const emptyResponse = requestAdminTrashEmpty(admin.token, [quizIds[0], quizIds[0]]);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      expect(emptyResponse.body).toStrictEqual({});
    });

    test('successfully empties trash with multiple valid quiz IDs', () => {
      const emptyResponse = requestAdminTrashEmpty(admin.token, quizIds);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      expect(emptyResponse.body).toStrictEqual({});
    });

    test('successfully empties trash with valid token and subset of valid quiz IDs', () => {
      const emptyResponse = requestAdminTrashEmpty(admin.token, [quizIds[0], quizIds[2]]);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      expect(emptyResponse.body).toStrictEqual({});
    });

    test('Emptying trash with mixed valid and invalid quiz IDs', () => {
      const emptyResponse = requestAdminTrashEmpty(admin.token, [quizIds[1], 9999, quizIds[3]]);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(emptyResponse.body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('empty trash with negative quiz ID values', () => {
      const emptyResponse = requestAdminTrashEmpty(admin.token, [-1, -2, -3]);

      expect(emptyResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(emptyResponse.body).toStrictEqual({
        error: expect.any(String),
      });
    });
  });
});
