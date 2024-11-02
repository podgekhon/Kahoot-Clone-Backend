import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizNameUpdate,
  requestAdminQuizNameUpdateV2,
  requestAdminQuizInfo,
  requestClear,
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

describe('HTTP tests for quiz description update', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  let user2: { token: string };
  beforeEach(() => {
    const resRegister = requestAdminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Guanlin',
      'Kong'
    );
    user = resRegister.body as tokenReturn;

    const resRegisterUser2 = requestAdminAuthRegister(
      'test2@gmail.com',
      'validPassword5',
      'John',
      'Doe'
    );
    user2 = resRegisterUser2.body as tokenReturn;

    const resCreateQuiz = requestAdminQuizCreate(
      user.token,
      'validQuizName',
      'validQuizDescription'
    );
    quiz = resCreateQuiz.body as quizCreateResponse;
  });

  test('invalid token', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, 'abcdefg', 'newquizname');
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, ' ', 'newquizname');
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid owner', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user2.token, 'newquizname~!');
    expect(result.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('duplicate quiz names owned by same user', () => {
    const resCreateQuiz2 = requestAdminQuizCreate(user.token, 'quiz2', 'this is quiz 2');
    const quiz2 = resCreateQuiz2.body as quizCreateResponse;
    const result = requestAdminQuizNameUpdate(quiz2.quizId, user.token, 'quiz2');
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid quiz name', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user.token, 'invalid@name!');
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('name length validation failure', () => {
    const longName = 'a'.repeat(256);
    const result = requestAdminQuizNameUpdate(quiz.quizId, user.token, longName);
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('duplicate quiz name', () => {
    // Create a quiz with this name first
    requestAdminQuizCreate(user.token, 'duplicateName', 'validQuizDescription');

    const result = requestAdminQuizNameUpdate(quiz.quizId, user.token, 'duplicateName');
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid quizId', () => {
    const result = requestAdminQuizNameUpdate(-1, user.token, 'newquizname');
    expect(result.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('name contains invalid characters', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user.token, 'newquizname~!');
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('name less than 3 characters', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user.token, '1');
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('name more than 30 characters', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user.token,
      '12345678901234567890123456789012345');
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('updated successfully', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user.token, 'newquizname');
    // has correct status code and return type
    expect(result.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(result.body).toStrictEqual({ });

    // get info about current quiz
    // name should be updated
    const resQuizInfo = requestAdminQuizInfo(quiz.quizId, user.token);
    expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resQuizInfo.body).toMatchObject({ name: 'newquizname' });
  });
});

describe('HTTP tests for quiz description update V2', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  beforeEach(() => {
    const resRegister = requestAdminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Guanlin',
      'Kong'
    );
    user = resRegister.body as tokenReturn;

    const resCreateQuiz = requestAdminQuizCreate(
      user.token,
      'validQuizName',
      'validQuizDescription'
    );
    quiz = resCreateQuiz.body as quizCreateResponse;
  });

  test('invalid token', () => {
    const result = requestAdminQuizNameUpdateV2(quiz.quizId, 'abcdefg', 'newquizname');
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = requestAdminQuizNameUpdateV2(quiz.quizId, ' ', 'newquizname');
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('updated successfully', () => {
    const result = requestAdminQuizNameUpdateV2(quiz.quizId, user.token, 'newquizname');
    expect(result.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(result.body).toStrictEqual({ });

    const resQuizInfo = requestAdminQuizInfo(quiz.quizId, user.token);
    expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resQuizInfo.body).toMatchObject({ name: 'newquizname' });
  });
});
