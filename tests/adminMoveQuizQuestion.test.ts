import {
  requestAdminAuthRegister,
  requestAdminMoveQuizQuestion,
  requestAdminMoveQuizQuestionV2,
  requestAdminQuizCreate,
  requestAdminQuizInfo,
  requestAdminQuizQuestionCreate,
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
  let user: { token: string };
  let quiz: { quizId: number };
  let question1: { questionId: number };
  let question2: { questionId: number };
  let question3: { questionId: number };

  beforeEach(() => {
    requestClear();
    const resRegister = requestAdminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    );
    user = resRegister.body as tokenReturn;

    const resCreateQuiz = requestAdminQuizCreate(
      user.token,
      'validQuizName',
      'validQuizDescription'
    );
    quiz = resCreateQuiz.body as quizCreateResponse;

    // Create three questions for the quiz
    const resCreateQuestion1 = requestAdminQuizQuestionCreate(
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
      }
    );
    question1 = resCreateQuestion1.body as quizQuestionCreateResponse;

    const resCreateQuestion2 = requestAdminQuizQuestionCreate(
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
      }
    );
    question2 = resCreateQuestion2.body as quizQuestionCreateResponse;

    const resCreateQuestion3 = requestAdminQuizQuestionCreate(
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
      }
    );
    question3 = resCreateQuestion3.body as quizQuestionCreateResponse;
  });

  // Run each test for both v1 and v2
  ['v1', 'v2'].forEach((version) => {
    const requestMoveQuizQuestion =
      version === 'v1' ? requestAdminMoveQuizQuestion : requestAdminMoveQuizQuestionV2;

    describe(`Version ${version}`, () => {
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
        const resQuizInfo = requestAdminQuizInfo(
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
