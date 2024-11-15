
import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizUpdateThumbnail,
  requestAdminQuizInfoV2,
  requestClear,
  httpStatus
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse
} from '../src/interface';

describe('HTTP tests for quiz thumbnail update', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
    requestClear();
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

  test('successfully updates the quiz thumbnail', () => {
    const newThumbnailUrl = 'http://google.com/some/image/path.jpg';

    const resUpdateThumbnail = requestAdminQuizUpdateThumbnail(
      quiz.quizId,
      user.token,
      newThumbnailUrl
    );

    expect(resUpdateThumbnail.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resUpdateThumbnail.body).toStrictEqual({});

    // Get quiz info to confirm that the thumbnail is updated
    const resQuizInfo = requestAdminQuizInfoV2(
      quiz.quizId,
      user.token
    );
    expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(resQuizInfo.body).toMatchObject({
      thumbnailUrl: newThumbnailUrl
    });
  });

  test('returns error when token is not valid', () => {
    const resUpdateThumbnail = requestAdminQuizUpdateThumbnail(
      quiz.quizId,
      '', // Invalid token
      'http://google.com/some/image/path.jpg'
    );
    expect(resUpdateThumbnail.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quizId is not valid', () => {
    const resUpdateThumbnail = requestAdminQuizUpdateThumbnail(
      -1, // Invalid quizId
      user.token,
      'http://google.com/some/image/path.jpg'
    );
    expect(resUpdateThumbnail.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resUpdateThumbnail.body).toStrictEqual({ error: expect.any(String) });
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

    // User 2 tries to update User 1's quiz thumbnail
    const resUpdateThumbnail = requestAdminQuizUpdateThumbnail(
      quiz.quizId,
      user2.token,
      'http://google.com/some/image/path.jpg'
    );
    expect(resUpdateThumbnail.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resUpdateThumbnail.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when thumbnail URL is invalid', () => {
    const resUpdateThumbnail = requestAdminQuizUpdateThumbnail(
      quiz.quizId,
      user.token,
      'invalidThumbnailUrl'
    );
    expect(resUpdateThumbnail.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resUpdateThumbnail.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when thumbnail URL does not have a valid file extension', () => {
    // Thumbnail URL does not end with jpg, jpeg, or png
    const resUpdateThumbnail = requestAdminQuizUpdateThumbnail(
      quiz.quizId,
      user.token,
      'http://google.com/some/image/path.gif'
    );
    expect(resUpdateThumbnail.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resUpdateThumbnail.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when thumbnail URL does not have valid prefix', () => {
    // Thumbnail URL does not start with http or http:// or https://
    const resUpdateThumbnail = requestAdminQuizUpdateThumbnail(
      quiz.quizId,
      user.token,
      'compsci://google.com/some/image/path.jpg'
    );
    expect(resUpdateThumbnail.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resUpdateThumbnail.body).toStrictEqual({ error: expect.any(String) });
  });
});
