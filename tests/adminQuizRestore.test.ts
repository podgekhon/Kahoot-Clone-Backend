import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import {
  requestAdminAuthLogout,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizList,
  requestAdminQuizRemove,
  requestAdminQuizRestore,
  requestAdminQuizRestoreV2,
  requestAdminTrashList,
  requestClear
} from '../src/requestHelperFunctions';
import { quizCreateResponse, tokenReturn } from '../src/interface';
import { httpStatus } from './adminAuthRegister.test';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;



describe(`Test for quiz restore`, () => {
  let user1token: string;
  let quiz1Id: number;
  beforeEach(() => {
    requestClear();
    // register a user
    const user1 = requestAdminAuthRegister('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1token = (user1.body as tokenReturn).token;
    // create a quiz
    const quiz1 = requestAdminQuizCreate(user1token, 'quiz1', 'this is quiz 1');
    quiz1Id = (quiz1.body as quizCreateResponse).quizId;
    // remove a quiz
    requestAdminQuizRemove(quiz1Id, user1token);
  });

  const testCase = [
    {
      version: 'v1',
      quizRestore: requestAdminQuizRestore
    }, {
      version: 'v2',
      quizRestore: requestAdminQuizRestoreV2
    }
  ]
  testCase.forEach(({version, quizRestore}) => {
    describe(`Test for ${version}`, () => {
      test('restore successful', () => {
        // list the trash and quiz Info
        let result = requestAdminTrashList(user1token);
        expect(result.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
        // quiz1 should be in the trash now
        expect(result.body).toStrictEqual(
          {
            quizzes: [
              {
                quizId: quiz1Id,
                name: 'quiz1',
              }
            ]
          }
        );
        // restore a quiz from the trash
        const res = quizRestore(quiz1Id, user1token);
        // check status code and return type
        expect(res.statusCode).toStrictEqual(200);
        expect(res.body).toStrictEqual({});
        // list the trash
        result = requestAdminTrashList(user1token);
        // nothing in the trash now
        expect(result.body).toStrictEqual(
          {
            quizzes: []
          }
        );
        // list the quiz list
        result = requestAdminQuizList(user1token);
        // quiz1 should be back in quiz list
        expect(result.body).toStrictEqual(
          {
            quizzes: [
              {
                quizId: quiz1Id,
                name: 'quiz1'
              }
            ]
          }
        );
      });
      
      test('Quiz name of the restored quiz is already used by another active quiz', () => {
        // create quiz2 which name is 'quiz1'
        requestAdminQuizCreate(user1token, 'quiz1', 'this is quiz 2 actually');
        // restore quiz1
        const res = quizRestore(quiz1Id, user1token);
        expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });
      
      test('Quiz ID refers to a quiz that is not currently in the trash', () => {
        // create quiz2
        const quiz2 = requestAdminQuizCreate(user1token, 'quiz 2', 'this is quiz 2');
        const quiz2Id = (quiz2.body as quizCreateResponse).quizId;
        const res = quizRestore(quiz2Id, user1token);
        
        expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });
      
      test('empty token', () => {
        const result = quizRestore(quiz1Id, JSON.stringify(''));
        expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });
      
      test('invalid token(does not refer to a logged in user)', () => {
        // log out user 1
        requestAdminAuthLogout(user1token);
        const result = quizRestore(quiz1Id, user1token);
        expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });
      
      test('invalid quizId (quiz doesnt exist)', () => {
        const result = quizRestore(quiz1Id + 1, user1token);
        expect(result.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });
      
      test('valid token, but user is not the owner', () => {
        const user2 = requestAdminAuthRegister('XiaoyuanMa@unsw.edu.au', 'erciam1234', 'eric', 'ma');
        const user2token = (user2.body as tokenReturn).token;
        
        const result = quizRestore(quiz1Id, user2token);
        expect(result.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });
    });
  })
});
