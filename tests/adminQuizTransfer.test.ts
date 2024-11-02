import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import {
  requestAdminAuthRegister,
  requestAdminQuizList,
  requestAdminQuizCreate,
  requestAdminQuizTransfer,
} from '../src/requestHelperFunctions';
import {
  quizCreateResponse,
  tokenReturn,
  userAuthRegister,
  quizTransfer,
  quizCreate,
  quizListResponse,
} from '../src/interface';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

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
    user1Response = requestAdminAuthRegister(
      'user1@gmail.com',
      'validPassword1',
      'User',
      'One'
    );
    user1Token = (user1Response.body as tokenReturn).token;
    expect(user1Response.statusCode).toStrictEqual(200);

    user2Response = requestAdminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );
    expect(user2Response.statusCode).toStrictEqual(200);
    user2Token = (user2Response.body as tokenReturn).token;

    user3Response = requestAdminAuthRegister(
      'user3@gmail.com',
      'validPassword3',
      'User',
      'Three'
    );
    expect(user3Response.statusCode).toStrictEqual(200);
    user3Token = (user3Response.body as tokenReturn).token;

    User1QuizListResponse = requestAdminQuizList(user2Token);
    expect(User1QuizListResponse.statusCode).toStrictEqual(200);
    expect(User1QuizListResponse.body).toStrictEqual({
      quizzes: []
    });

    quizCreateResponse = requestAdminQuizCreate(
      user1Token,
      'Math Quiz',
      'this is a math quiz'
    );
    expect(quizCreateResponse.statusCode).toStrictEqual(200);
    quizId = (quizCreateResponse.body as quizCreateResponse).quizId;
  });

  test('Valid adminQuizTransfer', () => {
    quizTransferResponse = requestAdminQuizTransfer(quizId, user1Token, 'user2@gmail.com');
    expect(quizTransferResponse.statusCode).toStrictEqual(200);

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
    expect(User2QuizListResponse.statusCode).toStrictEqual(200);
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
    expect(quizTransferResponse.statusCode).toStrictEqual(400);
    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error if user sends to themself', () => {
    const quizTransferResponse = requestAdminQuizTransfer(
      quizId,
      user1Token,
      'user1@gmail.com'
    );
    expect(quizTransferResponse.statusCode).toStrictEqual(400);
    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error if receiver has a quiz with same name', () => {
    quizCreateResponse = requestAdminQuizCreate(user2Token, 'Math Quiz', 'this is a math quiz');
    expect(quizCreateResponse.statusCode).toStrictEqual(200);

    quizTransferResponse = requestAdminQuizTransfer(quizId, user1Token, 'user2@gmail.com');
    expect(quizTransferResponse.statusCode).toStrictEqual(400);

    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid token: empty token', () => {
    quizTransferResponse = requestAdminQuizTransfer(quizId, '', 'user2@gmail.com');
    expect(quizTransferResponse.statusCode).toStrictEqual(401);

    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid token: invalid token', () => {
    quizTransferResponse = requestAdminQuizTransfer(quizId, '9999999', 'user2@gmail.com');
    expect(quizTransferResponse.statusCode).toStrictEqual(401);

    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('return error if user is not an owner of this quiz', () => {
    quizTransferResponse = requestAdminQuizTransfer(quizId, user3Token, 'user2@gmail.com');
    expect(quizTransferResponse.statusCode).toStrictEqual(403);

    expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
  });
});
