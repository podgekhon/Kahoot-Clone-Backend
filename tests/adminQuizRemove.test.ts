import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import { quizCreateResponse, tokenReturn } from '../src/interface';
import { requestAdminAuthRegister, httpStatus, requestAdminQuizCreate, requestAdminQuizRemove, requestAdminQuizList, requestAdminTrashList, requestAdminAuthLogout } from '../src/helperfunctiontests';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizRemove', () => {
  let quiz1Id: number;
  let user1token: string;

  beforeEach(() => {
    const user1 = requestAdminAuthRegister('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1token = (user1.body as tokenReturn).token;

    const quiz1 = requestAdminQuizCreate(user1token, 'Test Quiz', 'This is a test quiz');
    quiz1Id = (quiz1.body as quizCreateResponse).quizId;
  });

  test('Successfully delete quiz', () => {
    const res = requestAdminQuizRemove(quiz1Id, user1token);
    // has correct return type
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({});

    // has empty quiz list
    const quizList = requestAdminQuizList(user1token);
    expect(quizList.body).toStrictEqual({
      quizzes: []
    });
    
    // one quiz in the trash list
    const trashList = requestAdminTrashList(user1token);
    expect(trashList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Id,
          name: 'Test Quiz'
        }
      ]
    });
  });

  test('Attempt to delete non-existent quiz, invalid quizId', () => {
    const res = requestAdminQuizRemove(9999, user1token);
    expect(res.statusCode).toEqual(httpStatus.FORBIDDEN);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  test('Attempt to delete quiz with invalid quiz ID format', () => {
    const res = requestAdminQuizRemove(-1, user1token);
    expect(res.statusCode).toEqual(httpStatus.FORBIDDEN);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  test('Attempt to delete already deleted quiz', () => {
    requestAdminQuizRemove(quiz1Id, user1token);

    const res = requestAdminQuizRemove(quiz1Id, user1token);
    expect(res.statusCode).toEqual(httpStatus.FORBIDDEN);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  test('Attempt to delete quiz by non-admin user', () => {
    const user2 = requestAdminAuthRegister('otheruser@unsw.edu.au', 'OtherPass1234', 'Other', 'User');
    const user2token = (user2.body as tokenReturn).token;

    const res = requestAdminQuizRemove(quiz1Id, user2token);
    expect(res.statusCode).toEqual(httpStatus.FORBIDDEN);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const res = requestAdminQuizRemove(quiz1Id, JSON.stringify(''));
    expect(res.statusCode).toEqual(httpStatus.UNAUTHORIZED);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  test('invalid token', () => {
    // log out user1
    let res = requestAdminAuthLogout(user1token);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({});

    // register in user2
    const user2 = requestAdminAuthRegister('user2afds@unsw.edu.au', 'newuseraaa11', 'Eric', 'Ma');
    expect(user2.statusCode).toStrictEqual(200);
    // invalid token
    res = requestAdminQuizRemove(quiz1Id, user1token);
    expect(res.statusCode).toEqual(httpStatus.UNAUTHORIZED);
    expect(res.body).toEqual({ error: expect.any(String) });
  });
});
