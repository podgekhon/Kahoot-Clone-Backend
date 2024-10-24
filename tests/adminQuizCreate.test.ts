import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizList,
  requestClear
} from '../src/helperfunctiontests';

import { tokenReturn, quizCreateResponse, userAuthRegister } from '../src/interface';

export enum httpStatus {
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  SUCCESSFUL_REQUEST = 200,
}

beforeEach(() => {
  requestClear();
});

describe('adminQuizCreate', () => {
  let user1: userAuthRegister;
  let user1Token: string;
  // register a user before each test

  beforeEach(() => {
    user1 = requestAdminAuthRegister('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1Token = (user1.body as tokenReturn).token;
  });

  test('invalid token', () => {
    const result = requestAdminQuizCreate('hahainvalid', 'Quiz1', 'Invalid token');

    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = requestAdminQuizCreate('', 'Quiz1', 'Empty token');

    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('name less than 3 characters', () => {
    const result = requestAdminQuizCreate(user1Token, '1', 'Too short name');

    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  // Name exceeds 30 characters
  test('name more than 30 characters', () => {
    const longName = 'a'.repeat(31);
    const result = requestAdminQuizCreate(user1Token, longName, 'Name too long');

    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('name contains invalid characters', () => {
    const result = requestAdminQuizCreate(user1Token, '~invalidname', 'Invalid characters');

    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  // Description exceeds 100 characters
  test('description is more than 100 characters', () => {
    const longDescription = 'a'.repeat(101);
    const result = requestAdminQuizCreate(user1Token, 'quiz1', longDescription);

    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('duplicate quiz names owned by same user', () => {
    requestAdminQuizCreate(user1Token, 'quiz1', 'First quiz');

    const result = requestAdminQuizCreate(user1Token, 'quiz1', 'Second quiz with same name');

    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  // Valid input test
  test('valid inputs', () => {
    const result = requestAdminQuizCreate(user1Token, 'quiz1', 'This is quiz 1');

    expect(result.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(result.body).toStrictEqual({ quizId: expect.any(Number) });

    // Validate quiz is in the quiz list
    const quizList = requestAdminQuizList(user1Token);
    const quizId = (result.body as quizCreateResponse).quizId;

    expect(quizList.body).toStrictEqual({
      quizzes: [{ quizId: quizId, name: 'quiz1' }]
    });
  });
});
