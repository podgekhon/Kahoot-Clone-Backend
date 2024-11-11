import {
  requestAdminAuthRegister,
  requestAdminQuizList,
  requestAdminQuizCreate,
  requestAdminQuizTransfer,
  requestAdminQuizTransferV2,
  httpStatus,
  requestClear
} from '../src/requestHelperFunctions';
import {
  quizCreateResponse,
  tokenReturn,
  userAuthRegister,
  quizTransfer,
  quizCreate,
  quizListResponse,
} from '../src/interface';

describe('Test for adminQuizTransfer', () => {
  let user1Response: userAuthRegister;
  let user2Response: userAuthRegister;
  let user3Response: userAuthRegister;

  let User1QuizListResponse: quizListResponse;
  let User2QuizListResponse: quizListResponse;

  let user1Token: string;
  let user2Token: string;
  let user3Token: string;

  let quizCreateResponse: quizCreate;
  let quizId: number;
  let quizTransferResponse: quizTransfer;

  beforeEach(() => {
    requestClear();
    user1Response = requestAdminAuthRegister(
      'user1@gmail.com',
      'validPassword1',
      'User',
      'One'
    );
    user1Token = (user1Response.body as tokenReturn).token;
    expect(user1Response.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    user2Response = requestAdminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );
    expect(user2Response.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    user2Token = (user2Response.body as tokenReturn).token;

    user3Response = requestAdminAuthRegister(
      'user3@gmail.com',
      'validPassword3',
      'User',
      'Three'
    );
    expect(user3Response.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    user3Token = (user3Response.body as tokenReturn).token;

    User1QuizListResponse = requestAdminQuizList(user2Token);
    expect(User1QuizListResponse.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
    expect(User1QuizListResponse.body).toStrictEqual({
      quizzes: []
    });

    quizCreateResponse = requestAdminQuizCreate(
      user1Token,
      'Math Quiz',
      'this is a math quiz'
    );
    expect(quizCreateResponse.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
    quizId = (quizCreateResponse.body as quizCreateResponse).quizId;
  });

  test('Valid adminQuizTransfer', () => {
    quizTransferResponse = requestAdminQuizTransfer(
      quizId,
      user1Token,
      'user2@gmail.com'
    );
    expect(quizTransferResponse.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    User2QuizListResponse = requestAdminQuizList(user2Token);
    expect(User2QuizListResponse.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Math Quiz',
        }
      ]
    });

    User2QuizListResponse = requestAdminQuizList(user1Token);
    expect(User2QuizListResponse.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
    expect(User2QuizListResponse.body).toStrictEqual({
      quizzes: []
    });
  });

  // MODALISE THIS ---------------------------------------------------------------
  test('Valid adminQuizTransfer V2 ROUTE', () => {
    quizTransferResponse = requestAdminQuizTransferV2(
      quizId,
      user1Token,
      'user2@gmail.com'
    );
    expect(quizTransferResponse.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    User2QuizListResponse = requestAdminQuizList(user2Token);
    expect(User2QuizListResponse.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Math Quiz',
        }
      ]
    });

    User2QuizListResponse = requestAdminQuizList(user1Token);
    expect(User2QuizListResponse.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
    expect(User2QuizListResponse.body).toStrictEqual({
      quizzes: []
    });
  });

  test('returns error receiver is not a real user', () => {
    quizTransferResponse = requestAdminQuizTransfer(
      quizId,
      user1Token,
      'notRealUser2@gmail.com'
    );
    expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error if user sends to themself', () => {
    const quizTransferResponse = requestAdminQuizTransfer(
      quizId,
      user1Token,
      'user1@gmail.com'
    );
    expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error if receiver has a quiz with same name', () => {
    quizCreateResponse = requestAdminQuizCreate(
      user2Token,
      'Math Quiz',
      'this is a math quiz'
    );
    expect(quizCreateResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    quizTransferResponse = requestAdminQuizTransfer(
      quizId,
      user1Token,
      'user2@gmail.com'
    );
    expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);

    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid token: empty token', () => {
    quizTransferResponse = requestAdminQuizTransfer(quizId, '', 'user2@gmail.com');
    expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);

    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid token: invalid token', () => {
    quizTransferResponse = requestAdminQuizTransfer(
      quizId,
      '9999999',
      'user2@gmail.com'
    );
    expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);

    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('return error if user is not an owner of this quiz', () => {
    quizTransferResponse = requestAdminQuizTransfer(
      quizId,
      user3Token,
      'user2@gmail.com'
    );
    expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.FORBIDDEN);

    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error for invalid quizId', () => {
    const invalidQuizId = quizId + 1;
    quizCreateResponse = requestAdminQuizCreate(
      user2Token,
      'Math Quiz',
      'this is a math quiz'
    );
    expect(quizCreateResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    quizTransferResponse = requestAdminQuizTransfer(
      invalidQuizId,
      user1Token,
      'user2@gmail.com'
    );
    expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.FORBIDDEN);

    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });
});
