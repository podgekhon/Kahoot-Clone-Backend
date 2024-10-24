import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizRemove,
  requestAdminQuizList,
  requestAdminTrashList,
  requestAdminAuthLogout,
  requestAdminAuthLogin
} from '../src/helperfunctiontests';
import { quizCreateResponse, tokenReturn } from '../src/interface';

beforeEach(() => {
  requestClear();
});

describe('test for adminQuizRemove', () => {
  let user1;
  let quiz;
  let quizID: number;
  let user1token: string;
  beforeEach(() => {
    user1 = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    user1token = (user1.body as tokenReturn).token;
    quiz = requestAdminQuizCreate(user1token, 'Test Quiz', 'This is a test quiz');
    quizID = (quiz.body as quizCreateResponse).quizId;
  });

  test('Successfully delete quiz', () => {
    const deleteResponse = requestAdminQuizRemove(quizID, user1token);
    expect(deleteResponse.statusCode).toEqual(200);
    // has correct return type
    expect(deleteResponse.body).toEqual({});
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
          quizId: quizID,
          name: 'Test Quiz'
        }
      ]
    });
  });

  test('Attempt to delete non-existent quiz', () => {
    const deleteResponse = requestAdminQuizRemove(-1, user1token);
    expect(deleteResponse.statusCode).toStrictEqual(403);
    expect(deleteResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Attempt to delete quiz with invalid quiz ID format', () => {
    const deleteResponse = requestAdminQuizRemove(-11, user1token);
    expect(deleteResponse.statusCode).toStrictEqual(403);
    expect(deleteResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Attempt to delete already deleted quiz', () => {
    requestAdminQuizRemove(quizID, user1token);
    const deleteResponse = requestAdminQuizRemove(quizID, user1token);
    expect(deleteResponse.statusCode).toStrictEqual(403);
    expect(deleteResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Attempt to delete quiz by non-admin user', () => {
    const newuser = requestAdminAuthRegister('test1@gmail.com', 'validPassword5', 'Guanlin1', 'Kong1');
    const newtoken = (newuser.body as tokenReturn).token;
    const deleteResponse = requestAdminQuizRemove(quizID, newtoken);
    expect(deleteResponse.statusCode).toStrictEqual(401);
    expect(deleteResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const deleteResponse = requestAdminQuizRemove(quizID, ' ');
    expect(deleteResponse.statusCode).toStrictEqual(401);
    expect(deleteResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid token', () => {
    // log out user1
    const result = requestAdminAuthLogout(user1token);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual({});
    // log in user2
    const resRegister = requestAdminAuthLogin('test@gmail.com', 'validPassword5');
    expect(resRegister.statusCode).toStrictEqual(200);
    // invalid token
    const deleteResponse = requestAdminQuizRemove(quizID, user1token);
    expect(deleteResponse.statusCode).toStrictEqual(401);
    expect(deleteResponse.body).toStrictEqual({ error: expect.any(String) });
  });
});
