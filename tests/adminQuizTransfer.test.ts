import {
  requestAdminAuthRegister,
  requestAdminQuizList,
  requestAdminQuizCreate,
  requestAdminQuizTransfer,
  requestAdminQuizTransferV2,
  requestAdminQuizCreateV2,
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

  const routeVersions = [
    {
      version: 'v1',
      quizTransferFunction: requestAdminQuizTransfer,
      createFunction: requestAdminQuizCreate,
    },
    {
      version: 'v2',
      quizTransferFunction: requestAdminQuizTransferV2,
      createFunction: requestAdminQuizCreateV2,
    }
  ];

  describe.each(routeVersions)('Tests for $version route', (
    {
      version,
      quizTransferFunction,
      createFunction,
    }
  ) => {
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

      quizCreateResponse = createFunction(
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
      quizTransferResponse = quizTransferFunction(
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
      quizTransferResponse = quizTransferFunction(
        quizId,
        user1Token,
        'notRealUser2@gmail.com'
      );
      expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error if user sends to themself', () => {
      const quizTransferResponse = quizTransferFunction(
        quizId,
        user1Token,
        'user1@gmail.com'
      );
      expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error if receiver has a quiz with same name', () => {
      quizCreateResponse = createFunction(
        user2Token,
        'Math Quiz',
        'this is a math quiz'
      );
      expect(quizCreateResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

      quizTransferResponse = quizTransferFunction(
        quizId,
        user1Token,
        'user2@gmail.com'
      );
      expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);

      expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error if receiver has a quiz with same name', () => {
      quizCreateResponse = createFunction(
        user2Token,
        'Math Quiz',
        'this is a math quiz'
      );
      expect(quizCreateResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

      quizTransferResponse = quizTransferFunction(
        quizId,
        user1Token,
        'user2@gmail.com'
      );
      expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);

      expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('invalid token: empty token', () => {
      quizTransferResponse = quizTransferFunction(quizId, '', 'user2@gmail.com');
      expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);

      expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('invalid token: invalid token', () => {
      quizTransferResponse = quizTransferFunction(
        quizId,
        '9999999',
        'user2@gmail.com'
      );
      expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);

      expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('return error if user is not an owner of this quiz', () => {
      quizTransferResponse = quizTransferFunction(
        quizId,
        user3Token,
        'user2@gmail.com'
      );
      expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.FORBIDDEN);

      expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error for invalid quizId', () => {
      const invalidQuizId = quizId + 1;
      quizCreateResponse = createFunction(
        user2Token,
        'Math Quiz',
        'this is a math quiz'
      );
      expect(quizCreateResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

      quizTransferResponse = quizTransferFunction(
        invalidQuizId,
        user1Token,
        'user2@gmail.com'
      );
      expect(quizTransferResponse.statusCode).toStrictEqual(httpStatus.FORBIDDEN);

      expect(quizTransferResponse.body).toStrictEqual({ error: expect.any(String) });
    });
  });
});
