import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestAdminQuizRemove,
  requestClear,
  httpStatus
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse
} from '../src/interface';

beforeEach(() => {
  requestClear();
});

describe('HTTP tests for starting a new quiz session', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
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

    // Add a question to the quiz to ensure it has at least one question
    const questionBody = {
      question: 'What is the capital of Australia?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    requestAdminQuizQuestionCreateV2(quiz.quizId, user.token, questionBody);
  });

  test('successfully starts a new quiz session', () => {
    const resStartSession = requestAdminStartQuizSession(
      quiz.quizId,
      user.token,
      1
    );
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resStartSession.body).toMatchObject({ sessionId: expect.any(Number) });
  });

  test('returns error when autoStartNum is greater than 50', () => {
    const resStartSession = requestAdminStartQuizSession(
      quiz.quizId,
      user.token,
      // Invalid autoStartNum
      51
    );
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz has 10 active sessions', () => {
    // Simulate making 10 active sessions for the quiz
    for (let i = 0; i < 10; i++) {
      requestAdminStartQuizSession(quiz.quizId, user.token, 1);
    }
    const resStartSession = requestAdminStartQuizSession(
      quiz.quizId,
      user.token,
      1
    );
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when the quiz has no questions', () => {
    // Create a new quiz without adding questions
    const resCreateQuiz2 = requestAdminQuizCreate(
      user.token,
      'emptyQuiz',
      'No questions in this quiz'
    );
    const emptyQuiz = resCreateQuiz2.body as quizCreateResponse;

    const resStartSession = requestAdminStartQuizSession(
      emptyQuiz.quizId,
      user.token,
      1
    );
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz is in trash', () => {
    // Trash the quiz before starting a session
    requestAdminQuizRemove(quiz.quizId, user.token);

    const resStartSession = requestAdminStartQuizSession(
      quiz.quizId,
      user.token,
      1
    );
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is invalid', () => {
    const resStartSession = requestAdminStartQuizSession(
      quiz.quizId,
      // Invalid token since empty
      '',
      1
    );
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user does not own the quiz', () => {
    // Register a second user
    const resRegisterUser2 = requestAdminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );
    const user2 = resRegisterUser2.body as tokenReturn;

    // User 2 tries to start a session for User 1's quiz
    const resStartSession = requestAdminStartQuizSession(
      quiz.quizId,
      user2.token,
      1
    );

    expect(resStartSession.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quizId is invalid', () => {
    const resStartSession = requestAdminStartQuizSession(
      // Invalid quizId
      -1,
      user.token,
      1
    );
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });
});
