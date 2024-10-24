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

  test('empty token', () => {
    const trashList = requestAdminTrashList('12345');
    expect(trashList.statusCode).toStrictEqual(401);
    expect(trashList.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Get trash list with empty token', () => {
    const trashList = requestAdminTrashList(' ');
    expect(trashList.statusCode).toStrictEqual(401);
    expect(trashList.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Get trash list success', () => {
    requestAdminQuizRemove(quizID, user1token);
    const trashList = requestAdminTrashList(user1token);
    expect(trashList.statusCode).toStrictEqual(200);
    expect(trashList.body).toHaveProperty('quizzes');
  });

  test('Get trash list with token from different user', () => {
    const newuser = requestAdminAuthRegister('test1@gmail.com', 'validPassword5', 'Guanlin1', 'Kong1');
    const newtoken = (newuser.body as tokenReturn).token;

    const trashList = requestAdminTrashList(newtoken);
    expect(trashList.statusCode).toStrictEqual(401);
    expect(trashList.body).toStrictEqual({ error: expect.any(String) });
  });
});
