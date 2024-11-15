import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizRemove,
  requestAdminQuizRemoveV2,
  requestAdminQuizList,
  requestAdminTrashList,
  requestAdminAuthLogout,
  requestAdminAuthLogin,
  requestAdminQuizSessionUpdate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestjoinPlayer
} from '../src/requestHelperFunctions';
import {
  quizCreateResponse,
  tokenReturn,
  quizStartSessionResponse
} from '../src/interface';
import { adminAction } from '../src/quiz';
import { httpStatus } from './adminAuthRegister.test';
import { error } from 'console';

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
    const newuser = requestAdminAuthRegister(
      'test1@gmail.com',
      'validPassword5',
      'Guanlin1',
      'Kong1'
    );
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

  describe('tests for v2 routes', () => {
    test('empty token', () => {
      const deleteResponse = requestAdminQuizRemoveV2(quizID, ' ');
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
      const deleteResponse = requestAdminQuizRemoveV2(quizID, user1token);
      expect(deleteResponse.statusCode).toStrictEqual(401);
      expect(deleteResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Successfully delete quiz', () => {
      // create a session and change it to END state
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
      requestAdminQuizQuestionCreateV2(quizID, user1token, questionBody);

      const session = requestAdminStartQuizSession(quizID, user1token, 10);
      const sessionId = (session.body as quizStartSessionResponse).sessionId;

      requestjoinPlayer(sessionId, 'abcde123');
      requestAdminQuizSessionUpdate(quizID, sessionId, user1token, adminAction.END);
      const deleteResponse = requestAdminQuizRemoveV2(quizID, user1token);
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
    test('Session not in END state', () => {
      // create a session and change it to END state
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
      requestAdminQuizQuestionCreateV2(quizID, user1token, questionBody);

      const session = requestAdminStartQuizSession(quizID, user1token, 10);

      const deleteResponse = requestAdminQuizRemoveV2(quizID, user1token);
      expect(deleteResponse.statusCode).toEqual(httpStatus.BAD_REQUEST);
      // has correct return type
      expect(deleteResponse.body).toEqual({error: expect.any(String)});      
    });
  });
});
