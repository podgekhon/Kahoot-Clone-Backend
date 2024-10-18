import request from 'sync-request-curl';
import { port, url } from './config.json';
// import { httpStatus } from './server'

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

export enum httpStatus {
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  SUCCESSFUL_REQUEST = 200,
}
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizCreate', () => {
  let user1;
  let user1Return;
  let user1token: string;
  // register a user
  beforeEach(() => {
    user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ericMa@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma'
      },
      timeout: TIMEOUT_MS
    });
    user1Return = JSON.parse(user1.body.toString());
    user1token = user1Return.token;
  });
  test('invalid token', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: JSON.stringify('hahainvalid'),
          name: 'Quiz1',
          description: 'lol invalid token'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
  test('empty token', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: JSON.stringify(''),
          name: 'Quiz1',
          description: 'lol invalid token'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('name less than 3 characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: '1',
          description: 'lol too short'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('name more than 30 characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'fdjskalgeiowagheowagnwageowhgiowegwaogdlsagdslagiowaghowhagowaofdsgd',
          description: 'toooooo long'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('name contains invalid characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: '~hahha',
          description: 'lol invalid quiz name'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('description is more than 100 characters', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description:
          'fdsajfoejgiowajiogiowagjoawoeoiwafoiwoshi' +
          'shabifoewajiojgeoiwagiowhauhueiwaiuguirdfsafdsa' +
          'fdsafoeahgioewghioagoieajgioewoaigjoiwegjioewagjoiweajgo'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('duplicate quiz names owned by same user', () => {
    request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description: 'this is the first quiz'
        },
        timeout: TIMEOUT_MS
      }
    );
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description: 'this is the second quiz with name of quiz1'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  // valid input tests
  test('valid inputs', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz1',
          description: 'this is quiz 1'
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(200);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ quizId: expect.any(Number) });
  });
});

describe('adminQuizNameUpdate', () => {
  // invalid input tests
  let user1;
  let quiz1;
  let user1token: string;
  let quiz1Id: number;
  beforeEach(() => {
    user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ericMa@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma',
      },
      timeout: TIMEOUT_MS,
    });
    user1token = JSON.parse(user1.body.toString()).token;

    quiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'quiz1',
        description: 'this is quiz 1',
      },
      timeout: TIMEOUT_MS,
    });
    quiz1Id = JSON.parse(quiz1.body.toString()).quizId;
  });

  test('invalid token', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: 'abcd',
          name: 'newQuizName',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('empty token', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: JSON.stringify(''),
          name: 'newQuizName',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('invalid quizId', () => {
    const result = request('PUT', SERVER_URL + `/v1/admin/quiz/${10}/name`, {
      json: {
        token: user1token,
        name: 'newQuizName',
      },
    });
    expect(result.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('user does not own quizId', () => {
    const user2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ee@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma',
      },
      timeout: TIMEOUT_MS,
    });
    const user2token = JSON.parse(user2.body.toString()).token;

    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user2token,
          name: 'newQuizName',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('name contains invalid characters', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user1token,
          name: 'newQuizName~!',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('name less than 3 characters', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user1token,
          name: '1',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('name more than 30 characters', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user1token,
          name:
            'fdsafdsgesagewagawggdsa' +
            'fdsafdsagsagewagafdsafdsafdsafdsafdsafsafdgregrehes',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('duplicate quiz names owned by same user', () => {
    const quiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'quiz2',
        description: 'this is quiz 2',
      },
      timeout: TIMEOUT_MS,
    });
    const quiz2Id = JSON.parse(quiz2.body.toString()).quizId;

    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz2Id}/name`,
      {
        json: {
          token: user1token,
          name: 'quiz1',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('has correct return type', () => {
    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user1token,
          name: 'newquizName',
        },
      }
    );
    expect(result.statusCode).toStrictEqual(200);
    expect(JSON.parse(result.body.toString())).toStrictEqual({});
  });
});

/// ////////-----adminQuizList-----////////////
describe('adminQuizList', () => {
  let user: { token: string};
  let quizList: string; // this might change
  let userToken: string;

  beforeEach(() => {
    const resRegister = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'test@gmail.com',
          password: 'validPassword5',
          nameFirst: 'Patrick',
          nameLast: 'Chen'
        },
        timeout: TIMEOUT_MS
      }
    );
    user = JSON.parse(resRegister.body.toString());
    expect(resRegister.statusCode).toStrictEqual(200);
    userToken = user.token;
  });

  test('returns an empty list when user has no quizzes', () => {
    const resAdminQuizlist = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list', {
        qs: {
          token: userToken,
        },
        timeout: TIMEOUT_MS,
      }
    );

    quizList = JSON.parse(resAdminQuizlist.body.toString());
    expect(resAdminQuizlist.statusCode).toStrictEqual(200);
    expect(quizList).toStrictEqual({ quizzes: [] });
  });

  test('returns a list of quizzes owned by the user', () => {
    request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: userToken,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: userToken,
          name: 'English Quiz',
          description: 'this is an English quiz'
        }
      }
    );

    const resAdminQuizlist = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list', {
        qs: {
          token: userToken,
        },
        timeout: TIMEOUT_MS,
      }
    );

    quizList = JSON.parse(resAdminQuizlist.body.toString());
    expect(resAdminQuizlist.statusCode).toStrictEqual(200);
    expect(quizList).toStrictEqual({
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
    const invalidTokenId = 3564743;
    const resAdminQuizlist = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list', {
        qs: {
          token: invalidTokenId,
        },
        timeout: TIMEOUT_MS,
      }
    );
    expect(resAdminQuizlist.statusCode).toStrictEqual(401);
    const quizList = JSON.parse(resAdminQuizlist.body.toString());
    expect(quizList).toStrictEqual({ error: expect.any(String) });
  });
});

describe('adminQuizRemove', () => {
  let quiz: any;
  let adminToken: string;

  beforeEach(() => {
    const registerResponse = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'admin@unsw.edu.au',
        password: 'AdminPass1234',
        nameFirst: 'Admin',
        nameLast: 'User'
      },
      timeout: TIMEOUT_MS
    });
    adminToken = JSON.parse(registerResponse.body.toString()).token;

    const createQuizResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: adminToken,
        name: 'Test Quiz',
        description: 'This is a test quiz'
      },
      timeout: TIMEOUT_MS
    });
    quiz = JSON.parse(createQuizResponse.body.toString());
  });

  test('Successfully delete quiz', () => {
    const deleteResponse = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}?token=${adminToken}`,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(200);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({});
  });

  test('Attempt to delete non-existent quiz', () => {
    const deleteResponse = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/9999?token=' + adminToken,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(403);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });
  });

  test('Attempt to delete quiz with invalid quiz ID format', () => {
    const deleteResponse = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/invalidID?token=' + adminToken,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(403);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });
  });

  test('Attempt to delete already deleted quiz', () => {
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}?token=${adminToken}`, {
      timeout: TIMEOUT_MS
    });

    const deleteResponse = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}?token=${adminToken}`,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(403);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });
  });

  test('Attempt to delete quiz by non-admin user', () => {
    const registerOtherResponse = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'otheruser@unsw.edu.au',
        password: 'OtherPass1234',
        nameFirst: 'Other',
        nameLast: 'User'
      },
      timeout: TIMEOUT_MS
    });
    const otherToken = JSON.parse(registerOtherResponse.body.toString()).token;

    const deleteResponse = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}?token=${otherToken}`,
      {
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(403);
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({ error: expect.any(String) });
  });
});

// tests for trash list
describe('adminTrashList', () => {
  let admin: any;
  let adminToken: string;
  let quizId: number;

  beforeEach(() => {
    const response = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'admin@unsw.edu.au',
        password: 'AdminPass1234',
        nameFirst: 'Admin',
        nameLast: 'User'
      },
      timeout: TIMEOUT_MS
    });
    admin = JSON.parse(response.body as string);
    adminToken = admin.token;

    const quizResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Sample Quiz',
        description: 'This is a sample quiz.'
      },
      timeout: TIMEOUT_MS
    });
    const quiz = JSON.parse(quizResponse.body as string);
    quizId = quiz.quizId;
  });

  test('Get trash list with invalid format token', () => {
    const trashListResponse = request('GET', `${SERVER_URL}/v1/admin/quiz/trash?token=12345`, {
      json: { token: 12345 },
      timeout: TIMEOUT_MS
    });
    expect(trashListResponse.statusCode).toStrictEqual(401);
  });

  test('Get trash list with valid token but missing fields in response', () => {
    request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
      json: { token: adminToken },
      timeout: TIMEOUT_MS
    });

    const trashListResponse = request(
      'GET',
      `${SERVER_URL}/v1/admin/quiz/trash?token=${adminToken}`,
      {
        json: { token: adminToken },
        timeout: TIMEOUT_MS,
      }
    );
    const trashList = JSON.parse(trashListResponse.body.toString());
    expect(trashListResponse.statusCode).toStrictEqual(200);
    expect(trashList).toHaveProperty('quizzes');
  });

  test('Get trash list with token from different user', () => {
    const newAdminResponse = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'newadmin@unsw.edu.au',
        password: 'NewAdminPass1234',
        nameFirst: 'New',
        nameLast: 'Admin'
      },
      timeout: TIMEOUT_MS
    });
    const newAdmin = JSON.parse(newAdminResponse.body.toString());
    const newAdminToken = newAdmin.token;

    const trashListResponse = request(
      'GET',
      `${SERVER_URL}/v1/admin/quiz/trash?token=${newAdminToken}`,
      {
        json: { token: newAdminToken },
        timeout: TIMEOUT_MS,
      }
    );
    const trashList = JSON.parse(trashListResponse.body.toString());
    expect(trashListResponse.statusCode).toStrictEqual(200);
    expect(trashList).toHaveProperty('quizzes');
  });

  test('Get trash list with token that was generated from an earlier session', () => {
    const earlierToken = adminToken;
    const trashListResponse = request(
      'GET',
      `${SERVER_URL}/v1/admin/quiz/trash?token=${earlierToken}`,
      {
        json: { token: earlierToken },
        timeout: TIMEOUT_MS,
      }
    );
    expect(trashListResponse.statusCode).toStrictEqual(200);
  });
});

describe('HTTP tests for quiz description update', () => {
  let user: { token: string };
  let quiz: { quizId: string };

  beforeEach(() => {
    // Register a user
    const resRegister = request(
      'POST',
      `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'test@gmail.com',
          password: 'validPassword5',
          nameFirst: 'Patrick',
          nameLast: 'Chen',
        },
        timeout: 100,
      }
    );
    user = JSON.parse(resRegister.body as string);

    // Create a quiz
    const resCreateQuiz = request(
      'POST',
      `${url}:${port}/v1/admin/quiz`,
      {
        json: {
          token: user.token,
          name: 'validQuizName',
          description: 'validQuizDescription',
        },
        timeout: 100,
      }
    );
    quiz = JSON.parse(resCreateQuiz.body as string);
  });

  test('successfully updates the quiz description', () => {
    // Update the quiz description
    const resUpdateQuizDescription = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
      {
        json: {
          token: user.token,
          description: 'Updated description',
        },
        timeout: 100,
      }
    );

    // Check the status code and response (200 OK)
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({});
  });

  test('successfully updates quiz description with an empty string', () => {
    // Update the quiz description with an empty string
    const resUpdateQuizDescription = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
      {
        json: {
          token: user.token,
          description: '',
        },
        timeout: 100,
      }
    );

    expect(resUpdateQuizDescription.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({});
  });

  test('returns error when token is not valid', () => {
    // Attempt to update with an invalid token
    const resUpdateQuizDescription = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
      {
        json: {
          token: -1,
          description: 'New description',
        },
        timeout: 100,
      }
    );

    // Check for 401 error (invalid token)
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quizId is not valid', () => {
    // Attempt to update with an invalid quizId
    const resUpdateQuizDescription = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/999/description`,
      {
        json: {
          token: user.token,
          description: 'New description',
        },
        timeout: 100,
      }
    );

    // Check for 403 error (invalid quizId)
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user does not own the quiz', () => {
    // Register a second user
    const resRegisterUser2 = request(
      'POST',
      `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'user2@gmail.com',
          password: 'validPassword2',
          nameFirst: 'User',
          nameLast: 'Two',
        },
        timeout: 100,
      }
    );
    const user2 = JSON.parse(resRegisterUser2.body as string);

    // User 2 tries to update User 1's quiz description
    const resUpdateQuizDescription = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
      {
        json: {
          token: user2.token,
          description: 'New description',
        },
        timeout: 100,
      }
    );

    // Check for 403 error (user not an owner of quiz)
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when description is longer than 100 characters', () => {
    // Attempt to update with a description longer than 100 characters
    const longDescription = 'ABC'.repeat(100);
    const resUpdateQuizDescription = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/description`,
      {
        json: {
          token: user.token,
          description: longDescription,
        },
        timeout: 100,
      }
    );

    // Check for httpStatus.BAD_REQUEST error (description too long)
    expect(resUpdateQuizDescription.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuizDescription.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
});

describe('HTTP tests for quiz question create', () => {
  let user: { token: string };
  let quiz: { quizId: string };

  beforeEach(() => {
    const resRegister = request(
      'POST',
      `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'test@gmail.com',
          password: 'validPassword5',
          nameFirst: 'Patrick',
          nameLast: 'Chen',
        },
        timeout: 100,
      }
    );
    user = JSON.parse(resRegister.body as string);

    const resCreateQuiz = request(
      'POST',
      `${url}:${port}/v1/admin/quiz`,
      {
        json: {
          token: user.token,
          name: 'validQuizName',
          description: 'validQuizDescription',
        },
        timeout: 100,
      }
    );
    quiz = JSON.parse(resCreateQuiz.body as string);
  });

  test('successfully creates a quiz question', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince William',
            correct: false,
          },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toHaveProperty('questionId');

    // Commented out because quizInfo route has not been implemented yet
    /*
    const createdQuestionId = bodyObj.questionId;

    // Get quizInfo to verify that the question was added
    const resQuizInfo = request(
      'GET',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
      {
        qs: {
          token: user.token,
        },
        timeout: 100,
      }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(200);
    const quizInfo = JSON.parse(resQuizInfo.body as string);

    // Verify the quiz contains the newly added question
    expect(quizInfo).toHaveProperty('questions');
    const addedQuestion = quizInfo.questions.find(
      (q: question) => q.questionId === createdQuestionId
    );

    // Check that the question matches the one created
    expect(addedQuestion).toMatchObject({
      questionId: createdQuestionId,
      question: 'Who is the Monarch of England?',
      timeLimit: 4,
      points: 5,
      answerOptions: expect.arrayContaining([
        expect.objectContaining({
          answer: 'Prince Charles',
          correct: true,
        }),
        expect.objectContaining({
          answer: 'Prince William',
          correct: false,
        }),
      ]),
    });
    */
  });

  test('returns error when question length is invalid', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        // Invalid question string since it is less that 5 characters or more
        // than 50 characters in length
        question: 'Who?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince William',
            correct: false,
          },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when points are out of range', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        // Invalid points since points are less than 1 or greater than 10
        points: 20,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince William',
            correct: false,
          },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when there are duplicate answers', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            // Duplicate answer
            answer: 'Prince Charles',
            correct: false,
          },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user is not the quiz owner', () => {
    // Register a second user
    const resRegisterUser2 = request(
      'POST',
      `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'user2@gmail.com',
          password: 'validPassword2',
          nameFirst: 'User',
          nameLast: 'Two',
        },
        timeout: 100,
      }
    );
    const user2 = JSON.parse(resRegisterUser2.body as string);

    const questionBody = {
      token: user2.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince William',
            correct: false,
          },
        ],
      },
    };

    // User2 tries to access quiz created by original user
    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question has more than 6 answers', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          { answer: 'Sydney', correct: false },
          { answer: 'Melbourne', correct: false },
          { answer: 'Canberra', correct: true },
          { answer: 'Brisbane', correct: false },
          { answer: 'Perth', correct: false },
          { answer: 'Adelaide', correct: false },
          // Extra answer
          { answer: 'Hobart', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question has fewer than 2 answers', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          // Only one answer, hence invalid
          { answer: 'Canberra', correct: true },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question timeLimit is not a positive number', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        // Invalid time limit since it is negative
        timeLimit: -1,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when total question timeLimits in quiz exceed 3 minutes', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        // 225 seconds exceeds 3 minutes (180s)
        timeLimit: 225,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when answer length is shorter than 1 or longer than 30 characters', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          // Answer legnth is too short
          { answer: '', correct: true },
          { answer: 'Canberra', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when there are no correct answers', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          // None of the answers are true
          { answer: 'Sydney', correct: false },
          { answer: 'Melbourne', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is empty or invalid', () => {
    const questionBody = {
      // Empty token, hence invalid
      token: '',
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz does not exist', () => {
    const invalidQuizId = quiz.quizId + 1;

    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${invalidQuizId}/question`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
});

describe('clear test', () => {
  test('test clear successful', () => {
    const result = request('DELETE', SERVER_URL + '/v1/clear', {
      timeout: 100,
    });
    expect(JSON.parse(result.body.toString())).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(200);
  });
});
