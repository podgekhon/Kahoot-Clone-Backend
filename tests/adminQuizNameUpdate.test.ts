import { 
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminAuthLogout,
  requestAdminQuizNameUpdate,
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

    const resCreateQuiz = requestAdminQuizCreate(
      user.token,                 
      'validQuizName',           
      'validQuizDescription'     
    );
    quiz = resCreateQuiz.body as quizCreateResponse;
  });

  test('invalid token', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, 'abcdefg', 'newquizname');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, ' ', 'newquizname');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid quizId', () => {
    const result = requestAdminQuizNameUpdate(-1, user.token, 'newquizname');
    expect(result.statusCode).toStrictEqual(403);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('user does not own quizId', () => {
    const resRegister2 = requestAdminAuthRegister(
      'test2@gmail.com',            
      'validPassword5',             
      'Guanlin2',                    
      'Kong2'                        
    );
    user2 = resRegister2.body as tokenReturn;
    const result = requestAdminQuizNameUpdate(quiz.quizId, user2.token, 'newquizname');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('name contains invalid characters', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user2.token, 'newquizname~!');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('name less than 3 characters', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user2.token, '1');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('name more than 30 characters', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user2.token, 
      '12345678901234567890123456789012345');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('duplicate quiz names owned by same user', () => {
    const resCreateQuiz2 = requestAdminQuizCreate( user.token, 'quiz2', 'this is quiz 2' );
    const quiz2 = resCreateQuiz2.body as quizCreateResponse;
    const result = requestAdminQuizNameUpdate(quiz.quizId, user2.token, 'validQuizName');
    expect(result.statusCode).toStrictEqual(401);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
  });

  test('updated successfully', () => {
    const result = requestAdminQuizNameUpdate(quiz.quizId, user.token, 'newquizname');
    // has correct status code and return type
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual({ });

    // get info about current quiz
    // name should be updated
    const resQuizInfo = requestAdminQuizInfo(quiz.quizId, user.token);
    expect(resQuizInfo.statusCode).toStrictEqual(200);
    expect(resQuizInfo.body).toMatchObject({ name: 'newquizname'});
  });
});
