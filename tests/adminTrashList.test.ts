import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizRemove,
  requestAdminTrashList,
  requestClear
} from '../src/requestHelperFunctions';
import {
  quizCreateResponse,
  tokenReturn,
  userAuthRegister,
  quizCreate,
  trashList
} from '../src/interface';

beforeEach(() => {
  requestClear();
});

describe('test for adminQuizRemove', () => {
  let user1: userAuthRegister;
  let user2: userAuthRegister;

  let user1token: string;
  let user2token: string;

  let quiz: quizCreate;
  let quizID: number;

  let trashList: trashList;

  beforeEach(() => {
    user1 = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    user1token = (user1.body as tokenReturn).token;
    quiz = requestAdminQuizCreate(user1token, 'Test Quiz', 'This is a test quiz');
    quizID = (quiz.body as quizCreateResponse).quizId;

    user2 = requestAdminAuthRegister(
      'test1@gmail.com',
      'validPassword5',
      'Guanlin1',
      'Kong1'
    );
    user2token = (user2.body as tokenReturn).token;
  });

  test('empty token', () => {
    trashList = requestAdminTrashList('12345');
    expect(trashList.statusCode).toStrictEqual(401);
    expect(trashList.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Get trash list with empty token', () => {
    trashList = requestAdminTrashList(' ');
    expect(trashList.statusCode).toStrictEqual(401);
    expect(trashList.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Get trash list success', () => {
    requestAdminQuizRemove(quizID, user1token);
    trashList = requestAdminTrashList(user1token);
    expect(trashList.statusCode).toStrictEqual(200);
    expect(trashList.body).toHaveProperty('quizzes');
  });

  test('Get trash list with token from different user', () => {
    trashList = requestAdminTrashList(user2token);
    expect(trashList.statusCode).toStrictEqual(401);
    expect(trashList.body).toStrictEqual({ error: expect.any(String) });
  });
});
