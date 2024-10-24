import { 
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizDescriptionUpdate,
  requestAdminQuizInfo,
  requestClear,
} from '../src/helperfunctiontests';

import { 
  tokenReturn,
  quizCreateResponse
} from '../src/interface';

import {
  httpStatus
} from '../src/server';

beforeEach(() => {
  requestClear();
});

describe('HTTP tests for quiz description update', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
    const resRegister = requestAdminAuthRegister(
      'test@gmail.com',            
      'validPassword5',             
      'Patrick',                    
      'Chen'                        
    );
    user = resRegister.body as tokenReturn;

    const resCreateQuiz = requestAdminQuizCreate(
      user.token,                 
      'validQuizName',           
      'validQuizDescription'     
    );
    quiz = resCreateQuiz.body as quizCreateResponse;
  });

  test('successfully updates the quiz description', () => {
    // Update the quiz description
    const resUpdateQuizDescription = requestAdminQuizDescriptionUpdate(
      quiz.quizId,
      user.token,
      'Updated description'
    );

    expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resUpdateQuizDescription.body).toStrictEqual({});

    // Get quiz info to confirm that description is updated
    const resQuizInfo = requestAdminQuizInfo(
      quiz.quizId,
      user.token
    );
    expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resQuizInfo.body).toMatchObject({
      description: 'Updated description'
    });
  });

  test('successfully updates quiz description with an empty string', () => {
    // Update the quiz description with an empty string
    const resUpdateQuizDescription = requestAdminQuizDescriptionUpdate(
      quiz.quizId,
      user.token,
      ''
    );
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resUpdateQuizDescription.body).toStrictEqual({});

    // Get quiz info to confirm that description is updated
    const resQuizInfo = requestAdminQuizInfo(
      quiz.quizId,
      user.token
    );
    expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resQuizInfo.body).toMatchObject({
      description: ''
    });
  });

  test('returns error when token is not valid', () => {
    const resUpdateQuizDescription = requestAdminQuizDescriptionUpdate(
      quiz.quizId,
      // Empty token, hence invalid
      '',
      'New description'
    )
    expect(resUpdateQuizDescription.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quizId is not valid', () => {
    // Attempt to update with an invalid quizId
    const resUpdateQuizDescription = requestAdminQuizDescriptionUpdate(
      -1,
      user.token,
      'New description'
    )
    
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resUpdateQuizDescription.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user does not own the quiz', () => {
    // Register a second user
    const resRegisterUser2 = requestAdminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );
    const user2 = resRegisterUser2.body as tokenReturn;

    // User 2 tries to update User 1's quiz description
    const resUpdateQuizDescription = requestAdminQuizDescriptionUpdate(
      quiz.quizId,
      user2.token,
      'New description'
    );
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resUpdateQuizDescription.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when description is longer than 100 characters', () => {
    const longDescription = 'ABC'.repeat(100);
    const resUpdateQuizDescription = requestAdminQuizDescriptionUpdate(
      quiz.quizId,
      user.token,
      longDescription
    );

    expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resUpdateQuizDescription.body).toStrictEqual({ error: expect.any(String) });
  });
});
