import {
  requestAdminAuthRegister,
  requestAdminMoveQuizQuestion,
  requestAdminMoveQuizQuestionV2,
  requestAdminQuizCreate,
  requestAdminQuizCreateV2,
  requestAdminQuizInfo,
  requestAdminQuizInfoV2,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionCreateV2,
  requestClear,
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizQuestionCreateResponse,
  quizInfo
} from '../src/interface';

import {
  httpStatus
} from '../src/requestHelperFunctions';

describe('HTTP tests for adminMoveQuizQuestion (both v1 and v2 routes)', () => {
  const testCases = [
    {
      version: 'v1',
      requestMoveQuizQuestion: requestAdminMoveQuizQuestion,
      requestQuizCreate: requestAdminQuizCreate,
      requestQuizInfo: requestAdminQuizInfo,
      requestQuizQuestionCreate: requestAdminQuizQuestionCreate,
    },
    {
      version: 'v2',
      requestMoveQuizQuestion: requestAdminMoveQuizQuestionV2,
      requestQuizCreate: requestAdminQuizCreateV2,
      requestQuizInfo: requestAdminQuizInfoV2,
      requestQuizQuestionCreate: requestAdminQuizQuestionCreateV2,
    },
  ];

  testCases.forEach(
    ({
      version,
      requestMoveQuizQuestion,
      requestQuizCreate,
      requestQuizInfo,
      requestQuizQuestionCreate
    }) => {
      describe(`Tests for ${version}`, () => {
        let user: { token: string };
        let quiz: { quizId: number };
        let question1: { questionId: number };
        let question2: { questionId: number };
        let question3: { questionId: number };

        beforeEach(() => {
        // Clear any existing data
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

          // Create the first question
          const resCreateQuestion1 = requestQuizQuestionCreate(
            quiz.quizId,
            user.token,
            {
              question: 'What is the capital of France?',
              timeLimit: 10,
              points: 5,
              answerOptions: [
                { answer: 'Paris', correct: true },
                { answer: 'Sydney', correct: false },
              ],
              // add thumbnailUrl if v2
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            }
          );
          question1 = resCreateQuestion1.body as quizQuestionCreateResponse;

          // Create the second question
          const resCreateQuestion2 = requestQuizQuestionCreate(
            quiz.quizId,
            user.token,
            {
              question: 'What is the day today?',
              timeLimit: 10,
              points: 5,
              answerOptions: [
                { answer: 'Tuesday', correct: true },
                { answer: 'Friday', correct: false },
              ],
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image2.jpg' }),
            }
          );
          question2 = resCreateQuestion2.body as quizQuestionCreateResponse;

          // Create the third question
          const resCreateQuestion3 = requestQuizQuestionCreate(
            quiz.quizId,
            user.token,
            {
              question: 'What is the largest planet in our solar system?',
              timeLimit: 10,
              points: 5,
              answerOptions: [
                { answer: 'Jupiter', correct: true },
                { answer: 'Mars', correct: false },
              ],
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image3.jpg' }),
            }
          );
          question3 = resCreateQuestion3.body as quizQuestionCreateResponse;
        });

        test('successfully moves a quiz question and verifies its new position', () => {
        // Move the second question (question2) to position 0
          const resMoveQuestion = requestMoveQuizQuestion(
            quiz.quizId,
            question2.questionId,
            user.token,
            0
          );
          expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

          // Get quiz info to check if the question has been moved
          const resQuizInfo = requestQuizInfo(
            quiz.quizId,
            user.token
          );
          const quizInfo = resQuizInfo.body as quizInfo;

          // Check if the first question in the array is now question2
          expect(quizInfo.questions[0].questionId).toStrictEqual(question2.questionId);
          expect(quizInfo.questions[1].questionId).toStrictEqual(question1.questionId);
          expect(quizInfo.questions[2].questionId).toStrictEqual(question3.questionId);
        });

        test('returns error when newPosition is out of bounds', () => {
          const resMoveQuestion = requestMoveQuizQuestion(
            quiz.quizId,
            question1.questionId,
            user.token,
            -1
          );
          expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resMoveQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when questionId is invalid', () => {
          const resMoveQuestion = requestMoveQuizQuestion(
            quiz.quizId,
            // 99999 is an arbitrary questionId, hence invalid
            99999,
            user.token,
            1
          );
          expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resMoveQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when user is not the quiz owner', () => {
        // Register a second user
          const resRegisterUser2 = requestAdminAuthRegister(
            'user2@gmail.com',
            'validPassword2',
            'User',
            'Two'
          );
          const user2 = resRegisterUser2.body as tokenReturn;

          // User 2 tries to move the question in User 1's quiz
          const resMoveQuestion = requestMoveQuizQuestion(
            quiz.quizId,
            question1.questionId,
            user2.token,
            1
          );
          expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
          expect(resMoveQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when token is invalid', () => {
          const resMoveQuestion = requestMoveQuizQuestion(
            quiz.quizId,
            question1.questionId,
            'invalidToken',
            1
          );
          expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
          expect(resMoveQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when newPosition is the same as current position', () => {
          const resMoveQuestion = requestMoveQuizQuestion(
            quiz.quizId,
            question1.questionId,
            user.token,
            // The original position of question1 is zero
            0
          );
          expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resMoveQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when quiz does not exist', () => {
          const invalidQuizId = quiz.quizId + 1;
          const resMoveQuestion = requestMoveQuizQuestion(
            invalidQuizId,
            question1.questionId,
            user.token,
            1
          );
          expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
          expect(resMoveQuestion.body).toStrictEqual({ error: expect.any(String) });
        });
      });
    });
});
