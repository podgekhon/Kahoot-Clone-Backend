import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizCreateV2,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizQuestionRemove,
  requestAdminQuizQuestionRemoveV2,
  requestAdminQuizRemove,
  requestAdminQuizRemoveV2,
  requestClear
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizQuestionCreateResponse,
} from '../src/interface';

import {
  httpStatus
} from '../src/requestHelperFunctions';

beforeEach(() => {
  requestClear();
});

const routeVersions = [
  {
    name: 'v1',
    removeFunction: requestAdminQuizQuestionRemove,
    createFunction: requestAdminQuizCreate,
    createQuestionFunction: requestAdminQuizQuestionCreate,
    removeQuizFunction: requestAdminQuizRemove
  },
  {
    name: 'v2',
    removeFunction: requestAdminQuizQuestionRemoveV2,
    createFunction: requestAdminQuizCreateV2,
    createQuestionFunction: requestAdminQuizQuestionCreateV2,
    removeQuizFunction: requestAdminQuizRemoveV2
  }
];

describe.each(routeVersions)('Tests for $name route', (
  {
    name,
    removeFunction,
    createFunction,
    createQuestionFunction,
    removeQuizFunction
  }) => {
  let user: { token: string };
  let quiz: { quizId: number };
  let question: { questionId: number };

  beforeEach(() => {
    const resRegister = requestAdminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Eric',
      'Yang'
    );
    user = resRegister.body as tokenReturn;

    const resCreateQuiz = createFunction(
      user.token,
      'validQuizName',
      'validQuizDescription'
    );
    quiz = resCreateQuiz.body as quizCreateResponse;

    const questionBody = name === 'v2'
      ? {
          question: 'What is the capital of Australia?',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            { answer: 'Canberra', correct: true },
            { answer: 'Sydney', correct: false },
          ],
          thumbnailUrl: 'https://example.com/image.jpg',
        }
      : {
          question: 'Who is the Monarch of England?',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince William', correct: false },
          ],
        };

    const resCreateQuestion = createQuestionFunction(
      quiz.quizId,
      user.token,
      questionBody
    );
    question = resCreateQuestion.body as quizQuestionCreateResponse;
  });

  test('successfully removes a quiz question', () => {
    const resRemoveQuestion = removeFunction(quiz.quizId, question.questionId, user.token);
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

    const resRemoveQuestion = removeFunction(quiz.quizId, question.questionId, user2.token);

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz ID is invalid', () => {
    const invalidQuizId = 9999;

    const resRemoveQuestion = removeFunction(invalidQuizId, question.questionId, user.token);

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question ID is invalid', () => {
    const invalidquestion = question.questionId + 1;

    const resRemoveQuestion = removeFunction(quiz.quizId, invalidquestion, user.token);

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is empty', () => {
    const resRemoveQuestion = removeFunction(quiz.quizId, question.questionId, '');

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is invalid', () => {
    const resRemoveQuestion = removeFunction(quiz.quizId, question.questionId, 'invalidToken');

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when attempting to remove a question that is already deleted', () => {
    // Remove the question once
    removeFunction(quiz.quizId, question.questionId, user.token);

    // Attempt to remove the question again
    const resRemoveQuestion = removeFunction(quiz.quizId, question.questionId, user.token);

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resRemoveQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when trying to remove a question after the quiz is deleted', () => {
    removeQuizFunction(quiz.quizId, user.token);

    const resRemoveQuestion = removeFunction(quiz.quizId, question.questionId, user.token);

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
