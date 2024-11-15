import {
  userAuthRegister,
  tokenReturn,
  quizCreate,
} from '../src/interface';
import {
  httpStatus,
  requestAdminAuthLogout,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizList,
  requestAdminQuizListV2,
  requestClear
} from '../src/requestHelperFunctions';

/// ////////-----adminQuizList-----////////////
describe('adminQuizList', () => {
  let user: userAuthRegister;
  let user2: userAuthRegister;
  let userToken: string;
  let quizCreateResponse1: quizCreate;
  let quizCreateResponse2: quizCreate;

  beforeEach(() => {
    requestClear();
    user = requestAdminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    );
    userToken = (user.body as tokenReturn).token;
    expect(user.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });
  const testCase = [
    {
      version: 'v1',
      listQuiz: requestAdminQuizList
    }, {
      version: 'v2',
      listQuiz: requestAdminQuizListV2
    }
  ];
  testCase.forEach(({ version, listQuiz }) => {
    describe(`Test for ${version}`, () => {
      test('returns an empty list when user has no quizzes', () => {
        const quizList = listQuiz(userToken);
        expect(quizList.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
        expect(quizList.body).toStrictEqual({ quizzes: [] });
      });

      test('returns a list of quizzes owned by the user', () => {
        quizCreateResponse1 = requestAdminQuizCreate(
          userToken,
          'Math Quiz',
          'this is a math quiz'
        );
        expect(quizCreateResponse1.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
        quizCreateResponse2 = requestAdminQuizCreate(
          userToken,
          'English Quiz',
          'this is a math quiz'
        );
        expect(quizCreateResponse2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

        const quizList = listQuiz(userToken);
        expect(quizList.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
        expect(quizList.body).toStrictEqual({
          quizzes: [
            {
              quizId: expect.any(Number),
              name: 'Math Quiz'
            },
            {
              quizId: expect.any(Number),
              name: 'English Quiz'
            },
          ]
        });
      });

      test('returns an error when token is invalid', () => {
        // log out user1
        const authLogoutResponse = requestAdminAuthLogout(userToken);
        expect(authLogoutResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
        expect(authLogoutResponse.body).toStrictEqual({});

        // log in user2
        user2 = requestAdminAuthRegister(
          'user2@gmail.com',
          'validPassword5',
          'Eric',
          'Ma'
        );
        expect(user2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

        // now user 2 is logged in, user 1 logged out
        const quizList = listQuiz(userToken);
        expect(quizList.statusCode).toStrictEqual(401);
        expect(quizList.body).toStrictEqual({ error: expect.any(String) });
      });

      test('empty token', () => {
        const quizList = listQuiz(JSON.stringify(''));
        expect(quizList.statusCode).toStrictEqual(401);
        expect(quizList.body).toStrictEqual({ error: expect.any(String) });
      });
    });
  });
});
