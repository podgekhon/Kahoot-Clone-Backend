import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizCreateV2,
  requestAdminQuizDescriptionUpdate,
  requestAdminQuizDescriptionUpdateV2,
  requestAdminQuizInfo,
  requestAdminQuizInfoV2,
  requestClear,
  httpStatus
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse
} from '../src/interface';

describe('HTTP tests for quiz description update (both v1 and v2 routes)', () => {
  const testCases = [
    {
      version: 'v1',
      requestQuizCreate: requestAdminQuizCreate,
      requestQuizDescriptionUpdate: requestAdminQuizDescriptionUpdate,
      requestQuizInfo: requestAdminQuizInfo,
    },
    {
      version: 'v2',
      requestQuizCreate: requestAdminQuizCreateV2,
      requestQuizDescriptionUpdate: requestAdminQuizDescriptionUpdateV2,
      requestQuizInfo: requestAdminQuizInfoV2,
    },
  ];

  testCases.forEach(
    ({
      version,
      requestQuizCreate,
      requestQuizDescriptionUpdate,
      requestQuizInfo
    }) => {
      describe(`Tests for ${version}`, () => {
        let user: { token: string };
        let quiz: { quizId: number };

        beforeEach(() => {
          requestClear();

          // Register a user and create a quiz
          const resRegister = requestAdminAuthRegister(
            'test@gmail.com',
            'validPassword5',
            'Patrick',
            'Chen'
          );
          user = resRegister.body as tokenReturn;

          const resCreateQuiz = requestQuizCreate(
            user.token,
            'validQuizName',
            'validQuizDescription'
          );
          quiz = resCreateQuiz.body as quizCreateResponse;
        });

        test('successfully updates the quiz description', () => {
          const resUpdateQuizDescription = requestQuizDescriptionUpdate(
            quiz.quizId,
            user.token,
            'Updated description'
          );

          expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
          expect(resUpdateQuizDescription.body).toStrictEqual({});

          const resQuizInfo = requestQuizInfo(
            quiz.quizId,
            user.token
          );
          expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
          expect(resQuizInfo.body).toMatchObject({
            description: 'Updated description'
          });
        });

        test('successfully updates quiz description with an empty string', () => {
          const resUpdateQuizDescription = requestQuizDescriptionUpdate(
            quiz.quizId,
            user.token,
            ''
          );
          expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
          expect(resUpdateQuizDescription.body).toStrictEqual({});

          const resQuizInfo = requestQuizInfo(
            quiz.quizId,
            user.token
          );
          expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
          expect(resQuizInfo.body).toMatchObject({
            description: ''
          });
        });

        test('returns error when token is not valid', () => {
          const resUpdateQuizDescription = requestQuizDescriptionUpdate(
            quiz.quizId,
            '',
            'New description'
          );
          expect(resUpdateQuizDescription.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when quizId is not valid', () => {
          const resUpdateQuizDescription = requestQuizDescriptionUpdate(
            -1,
            user.token,
            'New description'
          );

          expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
          expect(resUpdateQuizDescription.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when user does not own the quiz', () => {
          const resRegisterUser2 = requestAdminAuthRegister(
            'user2@gmail.com',
            'validPassword2',
            'User',
            'Two'
          );
          const user2 = resRegisterUser2.body as tokenReturn;

          const resUpdateQuizDescription = requestQuizDescriptionUpdate(
            quiz.quizId,
            user2.token,
            'New description'
          );
          expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
          expect(resUpdateQuizDescription.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when description is longer than 100 characters', () => {
          const longDescription = 'ABC'.repeat(100);
          const resUpdateQuizDescription = requestQuizDescriptionUpdate(
            quiz.quizId,
            user.token,
            longDescription
          );

          expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuizDescription.body).toStrictEqual({ error: expect.any(String) });
        });
      });
    }
  );
});
