import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionRemove,
  requestAdminQuizRemove,
  requestAdminTrashList,
  requestClear
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizQuestionCreateResponse
} from '../src/interface';

import {
  httpStatus
} from '../src/requestHelperFunctions';

beforeEach(() => {
  requestClear();
});

describe('Tests for adminQuizQuestionRemove', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  let questionId: number;

  beforeEach(() => {
    const resRegister = requestAdminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Eric',
      'Yang'
    );
    user = resRegister.body as tokenReturn;

    const resCreateQuiz = requestAdminQuizCreate(
      user.token,
      'validQuizName',
      'validQuizDescription'
    );
    quiz = (resCreateQuiz.body as quizCreateResponse);

    // Create a question to delete
    const questionBody = {
      question: 'Who is the Monarch of England?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Prince William', correct: false },
      ],
    };

    const resCreateQuestion = requestAdminQuizQuestionCreate(
      quiz.quizId,
      user.token,
      questionBody
    );
    questionId = (resCreateQuestion.body as quizQuestionCreateResponse).questionId;
  });

  test('successfully removes a quiz question', () => {
    const resRemoveQuestion = requestAdminQuizQuestionRemove(
      quiz.quizId,
      questionId,
      user.token
    );

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resRemoveQuestion.body).toStrictEqual({});
  });

  test('returns error when user is not the quiz owner', () => {
    const resRegisterUser2 = requestAdminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );
    const user2 = resRegisterUser2.body as tokenReturn;

    const resRemoveQuestion = requestAdminQuizQuestionRemove(
      quiz.quizId,
      questionId,
      user2.token
    );

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz ID is invalid', () => {
    const invalidQuizId = 9999;

    const resRemoveQuestion = requestAdminQuizQuestionRemove(
      invalidQuizId,
      questionId,
      user.token
    );

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove question when question ID is invalid', () => {
    const invalidQuestionId = questionId + 1;

    const result = requestAdminQuizQuestionRemove(
      quiz.quizId,
      invalidQuestionId,
      user.token
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove question when token is empty', () => {
    const result = requestAdminQuizQuestionRemove(
      quiz.quizId,
      questionId,
      ''
    );
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove question when token is invalid', () => {
    const result = requestAdminQuizQuestionRemove(
      quiz.quizId,
      questionId,
      'invalidToken'
    );
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Try removing a question that is already deleted', () => {
    // Remove question first
    requestAdminQuizQuestionRemove(quiz.quizId, questionId, user.token);

    // Try removing again
    const resRemoveQuestion = requestAdminQuizQuestionRemove(
      quiz.quizId,
      questionId,
      user.token
    );
    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('remove question after quiz is deleted', () => {
    requestAdminQuizRemove(quiz.quizId, user.token);

    const quizlist = requestAdminTrashList(user.token);
    expect(quizlist.body).toEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'validQuizName'
        }
      ]
    });
    const resRemoveQuestion = requestAdminQuizQuestionRemove(
      quiz.quizId,
      questionId,
      user.token
    );
    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resRemoveQuestion.body).toStrictEqual(
      { error: expect.any(String) }
    );
  });
});
