import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestAdminViewQuizSessions,
  requestAdminQuizSessionUpdate,
  requestadminQuizSessionState,
  requestClear,
  httpStatus,
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse
} from '../src/interface';

import { adminAction } from '../src/quiz';

describe('HTTP tests for viewing quiz sessions', () => {
  let user: { token: string };
  let quiz: { quizId: number };

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

    // Add a question to the quiz to ensure it has at least one question
    const questionBody = {
      question: 'What is the capital of Australia?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    requestAdminQuizQuestionCreateV2(quiz.quizId, user.token, questionBody);
  });

  test('successfully retrieves active and inactive sessions in ascending order', () => {
    // Start three sessions for the quiz
    requestAdminStartQuizSession(quiz.quizId, user.token, 1);
    requestAdminStartQuizSession(quiz.quizId, user.token, 1);
    requestAdminStartQuizSession(quiz.quizId, user.token, 1);

    const resViewSessions = requestAdminViewQuizSessions(quiz.quizId, user.token);
    expect(resViewSessions.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    // Verify that the sessions are sorted in ascending order
    const activeSessions = resViewSessions.body.activeSessions;
    expect(activeSessions).toHaveLength(3);
    // Create a shallow copy of the array using ... syntax to avoid modifying
    // the original array during sorting
    expect(activeSessions).toEqual([...activeSessions].sort((a, b) => a - b));

    expect(resViewSessions.body.inactiveSessions).toStrictEqual([]);
  });

  test('successfully retrieves inactive sessions in ascending order', () => {
    const session1 = requestAdminStartQuizSession(quiz.quizId, user.token, 1).body.sessionId;
    const session2 = requestAdminStartQuizSession(quiz.quizId, user.token, 1).body.sessionId;
    const session3 = requestAdminStartQuizSession(quiz.quizId, user.token, 1).body.sessionId;

    // Move all sessions to the inactive state using the END action
    const endAction: adminAction = adminAction.END;
    requestAdminQuizSessionUpdate(quiz.quizId, session1, user.token, endAction);
    requestAdminQuizSessionUpdate(quiz.quizId, session2, user.token, endAction);
    requestAdminQuizSessionUpdate(quiz.quizId, session3, user.token, endAction);

    const resViewSessions = requestAdminViewQuizSessions(quiz.quizId, user.token);
    expect(resViewSessions.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    // Verify inactive sessions are in ascending order
    const { inactiveSessions } = resViewSessions.body;
    expect(inactiveSessions).toHaveLength(3);
    expect(inactiveSessions).toEqual([session1, session2, session3].sort((a, b) => a - b));
  });

  test('returns error when token is invalid', () => {
    const resViewSessions = requestAdminViewQuizSessions(quiz.quizId, '');
    expect(resViewSessions.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(resViewSessions.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user does not own the quiz', () => {
    const resRegisterUser2 = requestAdminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );
    const user2 = resRegisterUser2.body as tokenReturn;

    const resViewSessions = requestAdminViewQuizSessions(quiz.quizId, user2.token);
    expect(resViewSessions.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resViewSessions.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quizId is invalid', () => {
    const resViewSessions = requestAdminViewQuizSessions(-1, user.token);
    expect(resViewSessions.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resViewSessions.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns empty arrays when no sessions are present', () => {
    const resViewSessions = requestAdminViewQuizSessions(quiz.quizId, user.token);
    expect(resViewSessions.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resViewSessions.body).toMatchObject({
      activeSessions: [],
      inactiveSessions: [],
    });
  });
});
