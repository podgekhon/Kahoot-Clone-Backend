import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionRemove,
  requestAdminQuizRemove,
  requestAdminQuizQuestionRemoveV2,
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

const routeVersions = [
  { name: 'v1', removeFunction: requestAdminQuizQuestionRemove },
  { name: 'v2', removeFunction: requestAdminQuizQuestionRemoveV2 },
];

describe.each(routeVersions)('Tests for $name route', ({ name, removeFunction }) => {
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
    quiz = resCreateQuiz.body as quizCreateResponse;

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
    const resRemoveQuestion = removeFunction(quiz.quizId, questionId, user.token);

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

    const resRemoveQuestion = removeFunction(quiz.quizId, questionId, user2.token);

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz ID is invalid', () => {
    const invalidQuizId = 9999;

    const resRemoveQuestion = removeFunction(invalidQuizId, questionId, user.token);

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question ID is invalid', () => {
    const invalidQuestionId = questionId + 1;

    const resRemoveQuestion = removeFunction(quiz.quizId, invalidQuestionId, user.token);

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is empty', () => {
    const resRemoveQuestion = removeFunction(quiz.quizId, questionId, '');

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is invalid', () => {
    const resRemoveQuestion = removeFunction(quiz.quizId, questionId, 'invalidToken');

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when attempting to remove a question that is already deleted', () => {
    // Remove the question once
    removeFunction(quiz.quizId, questionId, user.token);

    // Attempt to remove the question again
    const resRemoveQuestion = removeFunction(quiz.quizId, questionId, user.token);

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when trying to remove a question after the quiz is deleted', () => {
    requestAdminQuizRemove(quiz.quizId, user.token);

    const resRemoveQuestion = removeFunction(quiz.quizId, questionId, user.token);

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  // TO BE Implemented
  // test('returns error when quiz is not in END state', () => {

  //   const resRemoveQuestion = removeFunction(quiz.quizId, questionId, user.token);

  //   expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
  //   expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  // });
});
