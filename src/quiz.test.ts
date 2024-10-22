import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

export enum httpStatus {
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  SUCCESSFUL_REQUEST = 200,
}

import {
  quizQuestionCreateResponse,
  question
} from './interface';

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
    // has one quiz in quiz list
    const quizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(JSON.parse(quizList.body.toString())).toStrictEqual({
      quizzes: [
        {
          quizId: JSON.parse(result.body.toString()).quizId,
          name: 'quiz1'
        }
      ]
    });
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

  test('updated successfully', () => {
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
    // has correct status code and return type
    expect(result.statusCode).toStrictEqual(200);
    expect(JSON.parse(result.body.toString())).toStrictEqual({});
  });
});

/// ////////-----adminQuizList-----////////////
describe('adminQuizList', () => {
  let user: { token: string};
  let quizList: string;
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
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`,
      {
        qs: {
          token: adminToken
        },
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(200);
    // has correct return type
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({});
    // has empty quiz list
    const quizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: adminToken
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(JSON.parse(quizList.body.toString())).toStrictEqual({
      quizzes: []
    });
    // one quiz in the trash list
    const trashList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        qs: {
          token: adminToken
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(JSON.parse(trashList.body.toString())).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Test Quiz'
        }
      ]
    });
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
    const response = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
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
  let quiz: { quizId: number };

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
  let quiz: { quizId: number };

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

describe('HTTP tests for quiz question update', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  let questionId: number;

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

    // Create a question to update
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
    const questionResponse = JSON.parse(resCreateQuestion.body as string);
    questionId = questionResponse.questionId;
  });

  test('successfully updates a quiz question', () => {
    const updatedQuestionBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the current Monarch of the UK?',
        timeLimit: 5,
        points: 6,
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

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: updatedQuestionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({});
  });

  test('returns error when question length is invalid', () => {
    const invalidQuestionBody = {
      token: user.token,
      questionBody: {
        // Invalid since question string is is less than 5 characters in length
        // or greater than 50 characters in length
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

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: invalidQuestionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when points are out of range', () => {
    const invalidPointsBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        // Invalid since points awarded for the question are less than 1 or
        // greater than 10
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

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: invalidPointsBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
          { answer: 'Prince Charles', correct: true },
          // Duplicate answer
          { answer: 'Prince Charles', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
        points: 3,
        answerOptions: [
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince William', correct: false },
        ],
      },
    };

    // User2 tries to update the question from the quiz created by original user
    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
          // Extra answer since max is 6
          { answer: 'Hobart', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
          // Invalid since only one answer
          { answer: 'Canberra', correct: true },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question timeLimit is not a positive number', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        // Invalid timeLimit since it is negative
        timeLimit: -1,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
          // Answer length is too short
          { answer: '', correct: true },
          { answer: 'Canberra', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz does not exist', () => {
    const invalidQuizId = 'invalid-quiz-id';

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

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${invalidQuizId}/question/${questionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when Question ID does not refer to a valid question within this quiz', () => {
    const invalidQuestionId = 'invalid-question-id';

    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 30,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${invalidQuestionId}`,
      {
        json: questionBody,
        timeout: 100,
      }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
});

describe('HTTP tests for getting quiz info', () => {
  let user: { token: string };
  let quiz: { quizId: number };

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

  test('successfully fetches quiz info with created questions', () => {
    // Create two questions to add to the quiz
    const question1 = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 10,
        points: 5,
        answerOptions: [
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince William', correct: false },
        ],
      },
    };

    const question2 = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 5,
        points: 3,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion1 = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      { json: question1, timeout: 100 }
    );
    expect(resCreateQuestion1.statusCode).toStrictEqual(200);
    const createdQuestion1 = JSON.parse(resCreateQuestion1.body as string);

    const resCreateQuestion2 = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      { json: question2, timeout: 100 }
    );
    expect(resCreateQuestion2.statusCode).toStrictEqual(200);
    const createdQuestion2 = JSON.parse(resCreateQuestion2.body as string);

    const resQuizInfo = request(
      'GET',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
      {
        qs: { token: user.token },
        timeout: 100,
      }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(200);
    const quizInfo = JSON.parse(resQuizInfo.body as string);

    expect(quizInfo).toMatchObject({
      quizId: quiz.quizId,
      name: 'validQuizName',
      description: 'validQuizDescription',
      numQuestions: 2,
      questions: expect.any(Array),
      timeLimit: expect.any(Number),
    });

    // Verify that the questions exist in the `questions` array, without assuming order
    const questionIds = quizInfo.questions.map(
      (q: quizQuestionCreateResponse) => q.questionId
    );

    expect(questionIds).toEqual(
      expect.arrayContaining([createdQuestion1.questionId, createdQuestion2.questionId])
    );

    // Check details for each question by finding them in the questions array
    const fetchedQuestion1 = quizInfo.questions.find(
      (q: quizQuestionCreateResponse) => q.questionId === createdQuestion1.questionId
    );

    const fetchedQuestion2 = quizInfo.questions.find(
      (q: quizQuestionCreateResponse) => q.questionId === createdQuestion2.questionId
    );

    expect(fetchedQuestion1).toMatchObject({
      questionId: createdQuestion1.questionId,
      question: 'Who is the Monarch of England?',
      timeLimit: 10,
      points: 5,
      answerOptions: expect.arrayContaining([
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: 'Prince Charles',
          colour: expect.any(String),
          correct: true,
        }),
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: 'Prince William',
          colour: expect.any(String),
          correct: false,
        }),
      ]),
    });

    expect(fetchedQuestion2).toMatchObject({
      questionId: createdQuestion2.questionId,
      question: 'What is the capital of Australia?',
      timeLimit: 5,
      points: 3,
      answerOptions: expect.arrayContaining([
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: 'Canberra',
          colour: expect.any(String),
          correct: true,
        }),
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: 'Sydney',
          colour: expect.any(String),
          correct: false,
        }),
      ]),
    });
  });

  test('returns error when token is empty', () => {
    const resQuizInfo = request(
      'GET',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
      {
        qs: {
          token: '',
        },
        timeout: 100,
      }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resQuizInfo.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is invalid', () => {
    const resQuizInfo = request(
      'GET',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
      {
        qs: {
          token: 'invalidToken',
        },
        timeout: 100,
      }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resQuizInfo.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user is not the quiz owner', () => {
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

    // User2 tries to access the quiz of original user
    const resQuizInfo = request(
      'GET',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
      {
        qs: {
          token: user2.token,
        },
        timeout: 100,
      }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resQuizInfo.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz does not exist', () => {
    const invalidQuizId = quiz.quizId + 1;

    const resQuizInfo = request(
      'GET',
      `${url}:${port}/v1/admin/quiz/${invalidQuizId}`,
      {
        qs: {
          token: user.token,
        },
        timeout: 100,
      }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resQuizInfo.body as string);
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

describe('HTTP tests for quiz question move', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  let question1: { questionId: number };
  let question2: { questionId: number };
  let question3: { questionId: number };

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

    // Create three questions for the quiz
    const createQuestion = (questionBody: any) => request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
      { json: { token: user.token, questionBody }, timeout: 100 }
    );

    const resCreateQuestion1 = createQuestion({
      question: 'What is the capital of France?',
      timeLimit: 10,
      points: 5,
      answerOptions: [
        { answer: 'Paris', correct: true },
        { answer: 'Sydney', correct: false },
      ],
    });
    question1 = JSON.parse(resCreateQuestion1.body as string);

    const resCreateQuestion2 = createQuestion({
      question: 'What is the day today?',
      timeLimit: 10,
      points: 5,
      answerOptions: [
        { answer: 'Tuesday', correct: true },
        { answer: 'Friday', correct: false },
      ],
    });
    question2 = JSON.parse(resCreateQuestion2.body as string);

    const resCreateQuestion3 = createQuestion({
      question: 'What is the largest planet in our solar system?',
      timeLimit: 10,
      points: 5,
      answerOptions: [
        { answer: 'Jupiter', correct: true },
        { answer: 'Mars', correct: false },
      ],
    });
    question3 = JSON.parse(resCreateQuestion3.body as string);
  });

  test('successfully moves a quiz question and verifies its new position', () => {
    // Move the second question (question2) to position 0
    const resMoveQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question2.questionId}/move`,
      {
        json: {
          token: user.token,
          newPosition: 0,
        },
        timeout: 100,
      }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(200);

    // Get quiz info to check if the question has been moved
    const resQuizInfo = request(
      'GET',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
      {
        qs: { token: user.token },
        timeout: 100,
      }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(200);
    const quizInfo = JSON.parse(resQuizInfo.body as string);

    // Check if the first question in the array is now question2
    expect(quizInfo.questions[0].questionId).toStrictEqual(question2.questionId);
    expect(quizInfo.questions[1].questionId).toStrictEqual(question1.questionId);
    expect(quizInfo.questions[2].questionId).toStrictEqual(question3.questionId);
  });

  test('returns error when newPosition is out of bounds', () => {
    const resMoveQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question1.questionId}/move`,
      {
        json: {
          token: user.token,
          newPosition: -1,
        },
        timeout: 100,
      }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when questionId is invalid', () => {
    const resMoveQuestion = request(
      'PUT',
      // 99999 is an arbitrary questionId, hence invalid
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/99999/move`,
      {
        json: {
          token: user.token,
          newPosition: 1,
        },
        timeout: 100,
      }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
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

    // User 2 tries to move the question in User 1's quiz
    const resMoveQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question1.questionId}/move`,
      {
        json: {
          token: user2.token,
          newPosition: 1,
        },
        timeout: 100,
      }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is invalid', () => {
    const resMoveQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question1.questionId}/move`,
      {
        json: {
          token: 'invalidToken',
          newPosition: 1,
        },
        timeout: 100,
      }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when newPosition is the same as current position', () => {
    const resMoveQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question1.questionId}/move`,
      {
        json: {
          token: user.token,
          // The original position of question1 is zero
          newPosition: 0,
        },
        timeout: 100,
      }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz does not exist', () => {
    const invalidQuizId = quiz.quizId + 1;

    const resMoveQuestion = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${invalidQuizId}/question/${question1.questionId}/move`,
      {
        json: {
          token: user.token,
          newPosition: 1,
        },
        timeout: 100,
      }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
});

describe('test for quiz restore', () => {
  let user1;
  let quiz1;
  let user1token: string;
  let quiz1Id: number;
  beforeEach(() => {
    // register a user
    user1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'ericMa@unsw.edu.au',
          password: 'EricMa1234',
          nameFirst: 'Eric',
          nameLast: 'Ma'
        },
        timeout: TIMEOUT_MS
      }
    );
    user1token = JSON.parse(user1.body.toString()).token;
    // create a quiz
    quiz1 = request(
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
    quiz1Id = JSON.parse(quiz1.body.toString()).quizId;
    // remove a quiz
    request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}`,
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
  });

  test('restore successful', () => {
    // list the trash and quiz Info
    let result = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    // quiz1 should be in the trash now
    expect(JSON.parse(result.body.toString())).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz1Id,
            name: 'quiz1',
          }
        ]
      }
    );
    // restore a quiz from the trash
    result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    const objBody = JSON.parse(result.body.toString());
    // check status code and return type
    expect(result.statusCode).toStrictEqual(200);
    expect(objBody).toStrictEqual({});
    // list the trash
    result = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    // nothing in the trash now
    expect(JSON.parse(result.body.toString())).toStrictEqual(
      {
        quizzes: []
      }
    );
    // list the quiz list
    result = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    // quiz1 should be back in quiz list
    expect(JSON.parse(result.body.toString())).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz1Id,
            name: 'quiz1'
          }
        ]
      }
    );
  });

  test('Quiz name of the restored quiz is already used by another active quiz', () => {
    // create quiz2 which name is 'quiz1'
    request(
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
    // restore quiz1
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    // create quiz2
    const quiz2 = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1token,
          name: 'quiz2',
          description: 'this is quiz 2'
        },
        timeout: TIMEOUT_MS
      }
    );
    const quiz2Id = JSON.parse(quiz2.body.toString()).quizId;
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz2Id}/restore`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: JSON.stringify('')
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid token', () => {
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: JSON.stringify('abcd')
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid quizId (quiz doesnt exist)', () => {
    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id + 1}/restore`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(403);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('valid token, but user is not the owner', () => {
    const user2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'XiaoyuanMa@unsw.edu.au',
          password: 'EricMa1234',
          nameFirst: 'Xiaoyuan',
          nameLast: 'Ma'
        },
        timeout: TIMEOUT_MS
      }
    );
    const user2token = JSON.parse(user2.body.toString()).token;

    const result = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/restore`,
      {
        json: {
          token: user2token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(403);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});

describe('test for quiz duplicate', () => {
  let user1token: string;
  let quiz1Id: number;
  let question1Id: number;
  // register a user, create a quiz, create a question
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
    user1token = JSON.parse(registerResponse.body.toString()).token;
    // create a quiz
    const createQuizResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'quiz1',
        description: 'quiz1'
      },
      timeout: TIMEOUT_MS
    });
    quiz1Id = JSON.parse(createQuizResponse.body.toString()).quizId;

    const questionBody = {
      token: user1token,
      questionBody: {
        question: 'question1',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'answer1',
            correct: true,
          },
          {
            answer: 'answer2',
            correct: false,
          },
        ],
      },
    };
    const createQuestionRes = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question`,
      {
        json: questionBody,
        timeout: TIMEOUT_MS
      }
    );
    question1Id = JSON.parse(createQuestionRes.body.toString()).questionId;
  });

  test('invalid token', () => {
    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
      {
        json: {
          token: JSON.stringify('fdsafdsa')
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(401);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
      {
        json: {
          token: JSON.stringify('')
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(401);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('user is not an owner of this quiz', () => {
    // register user2
    const registerResponse = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'EricMa@unsw.edu.au',
        password: 'AdminPass1234',
        nameFirst: 'Eric',
        nameLast: 'Ma'
      },
      timeout: TIMEOUT_MS
    });
    const user2token = JSON.parse(registerResponse.body.toString()).token;

    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
      {
        json: {
          token: user2token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(403);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('quiz doesnt exists', () => {
    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id + 1}/question/${question1Id}/duplicate`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(403);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('question id doesnt refer to a valid question within the quiz', () => {
    // create quiz 2
    const createQuizResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'Test Quiz',
        description: 'This is a test quiz'
      },
      timeout: TIMEOUT_MS
    });
    const quiz2Id = JSON.parse(createQuizResponse.body.toString()).quizId;
    // create question under quiz2
    const questionBody = {
      token: user1token,
      questionBody: {
        question: 'question2',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'answer1',
            correct: true,
          },
          {
            answer: 'answer2',
            correct: false,
          },
        ],
      },
    };
    const createQuestionRes = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz2Id}`,
      {
        json: questionBody,
        timeout: TIMEOUT_MS
      }
    );
    const question2Id = JSON.parse(createQuestionRes.body.toString()).questionId;
    // duplicate
    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question2Id}/duplicate`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(400);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  describe('successfully duplicate a question', () => {
    test('success when only one question is in question list', () => {
      // duplicate
      const res = request(
        'POST',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
        {
          json: {
            token: user1token
          },
          timeout: TIMEOUT_MS
        }
      );
      expect(res.statusCode).toStrictEqual(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual(
        { duplicatedquestionId: expect.any(Number) }
      );
      const question2Id = JSON.parse(res.body.toString()).duplicatedquestionId;

      // list the info in the quiz, should be two exactly same question in the list
      const quizInfoRes = request(
        'GET',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}`,
        {
          qs: {
            token: user1token
          },
          timeout: TIMEOUT_MS
        }
      );
      const quizInfo = JSON.parse(quizInfoRes.body.toString());
      expect(quizInfo).toStrictEqual({
        quizId: quiz1Id,
        name: 'quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'quiz1',
        numQuestions: 2,
        questions: [
          {
            questionId: question1Id,
            question: 'question1',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
          {
            questionId: question2Id,
            question: 'question1',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          }
        ],
        timeLimit: expect.any(Number)
      });
    });

    test('success when multiple question exist', () => {
      // create question 2
      const questionBody = {
        token: user1token,
        questionBody: {
          question: 'question2',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'answer1',
              correct: true,
            },
            {
              answer: 'answer2',
              correct: false,
            },
          ],
        },
      };
      const createQuestionRes = request(
        'POST',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question`,
        {
          json: questionBody,
          timeout: TIMEOUT_MS
        }
      );
      const question2Id = JSON.parse(createQuestionRes.body.toString()).questionId;
      // duplicate question1
      const res = request(
        'POST',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
        {
          json: {
            token: user1token
          },
          timeout: TIMEOUT_MS
        }
      );
      const duplicateId = JSON.parse(res.body.toString()).duplicatedquestionId;
      expect(res.statusCode).toStrictEqual(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual(
        { duplicatedquestionId: expect.any(Number) }
      );

      // list the info in the quiz, should be 3 questions in the list
      const quizInfoRes = request(
        'GET',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}`,
        {
          qs: {
            token: user1token
          },
          timeout: TIMEOUT_MS
        }
      );

      const quizInfo = JSON.parse(quizInfoRes.body.toString());
      expect(quizInfo).toStrictEqual({
        quizId: quiz1Id,
        name: 'quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'quiz1',
        numQuestions: 3,
        questions: [
          {
            questionId: question1Id,
            question: 'question1',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
          {
            questionId: duplicateId,
            question: 'question1',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
          {
            questionId: question2Id,
            question: 'question2',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          }
        ],
        timeLimit: expect.any(Number)
      });
    });
  });
});

describe('Tests for adminQuizQuestionRemove', () => {
  let user: { token: string };
  let quiz: { quizId: string };
  let questionId: string;
  beforeEach(() => {
    const resRegister = request(
      'POST',
      `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'test@gmail.com',
          password: 'validPassword5',
          nameFirst: 'Eric',
          nameLast: 'Yang',
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

    // Create a question to delete
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
    const questionResponse = JSON.parse(resCreateQuestion.body as string);
    questionId = questionResponse.questionId;
  });

  test('successfully removes a quiz question', () => {
    const resRemoveQuestion = request(
      'DELETE',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: { token: user.token },
        timeout: 100,
      }
    );

    expect(resRemoveQuestion.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(resRemoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({});
  });

  test('returns error when question does not exist', () => {
    const invalidQuestionId = 'invalidQuestionId';

    const resRemoveQuestion = request(
      'DELETE',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${invalidQuestionId}`,
      {
        json: { token: user.token },
        timeout: 100,
      }
    );

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    const bodyObj = JSON.parse(resRemoveQuestion.body as string);
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

    const resRemoveQuestion = request(
      'DELETE',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: { token: user2.token },
        timeout: 100,
      }
    );

    expect(resRemoveQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resRemoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is missing', () => {
    const resRemoveQuestion = request(
      'DELETE',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: {},
        timeout: 100,
      }
    );

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    const bodyObj = JSON.parse(resRemoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz ID is invalid', () => {
    const invalidQuizId = 'invalidQuizId';

    const resRemoveQuestion = request(
      'DELETE',
      `${url}:${port}/v1/admin/quiz/${invalidQuizId}/question/${questionId}`,
      {
        json: { token: user.token },
        timeout: 100,
      }
    );

    expect(resRemoveQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    const bodyObj = JSON.parse(resRemoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
  test('Remove question when question ID is invalid', () => {
    const result = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question/${questionId + 1}`,
      {
        json: { token: user.token },
        timeout: TIMEOUT_MS,
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove question when user is not the owner of the quiz', () => {
    const user2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'XiaoyuanMa@unsw.edu.au',
          password: 'EricMa1234',
          nameFirst: 'Xiaoyuan',
          nameLast: 'Ma',
        },
        timeout: TIMEOUT_MS,
      }
    );
    const user2token = JSON.parse(user2.body as string);

    const result = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: { token: user2token.token },
        timeout: TIMEOUT_MS,
      }
    );
    expect(result.statusCode).toStrictEqual(403);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove question when token is empty', () => {
    const result = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: { token: '' },
        timeout: TIMEOUT_MS,
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove question when token is invalid', () => {
    const result = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: { token: 'invalidToken' },
        timeout: TIMEOUT_MS,
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove question when quiz ID is invalid (quiz doesn’t exist)', () => {
    const result = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId + 100}/question/${questionId}`,
      {
        json: { token: user.token },
        timeout: TIMEOUT_MS,
      }
    );
    expect(result.statusCode).toStrictEqual(403);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove question when quiz ID refers to a quiz not owned by the user', () => {
    const user2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'otherUser@unsw.edu.au',
          password: 'OtherUser123',
          nameFirst: 'Other',
          nameLast: 'User',
        },
        timeout: TIMEOUT_MS,
      }
    );
    const user2Token = JSON.parse(user2.body as string);

    const result = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: { token: user2Token.token },
        timeout: TIMEOUT_MS,
      }
    );
    expect(result.statusCode).toStrictEqual(403);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Try removing a question that is already deleted', () => {
    // Remove question first
    request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: { token: user.token },
        timeout: TIMEOUT_MS,
      }
    );
    // Try removing again
    const result = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: { token: user.token },
        timeout: TIMEOUT_MS,
      }
    );
    expect(result.statusCode).toStrictEqual(400);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('remove question after quiz is deleted', () => {
    const deleteResponse = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`,
      {
        qs: { token: user.token },
        timeout: TIMEOUT_MS,
      }
    );
    expect(deleteResponse.statusCode).toEqual(200);
    // has correct return type
    expect(JSON.parse(deleteResponse.body.toString())).toEqual({});
    // has empty quiz list
    const quizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: { token: user.token },
        timeout: TIMEOUT_MS
      }
    );
    expect(JSON.parse(quizList.body.toString())).toStrictEqual({
      quizzes: []
    });
    // one quiz in the trash list
    const trashList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        qs: { token: user.token },
        timeout: TIMEOUT_MS
      }
    );
    expect(JSON.parse(trashList.body.toString())).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'validQuizName'
        }
      ]
    });

    const resRemoveQuestion = request(
      'DELETE',
      `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
      {
        json: { token: user.token },
        timeout: 100,
      }
    );
    expect(resRemoveQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resRemoveQuestion.body as string);
    expect(bodyObj.error).toStrictEqual('quiz or question doesn\'t exist');
  });
});

describe('Test for adminQuizTransfer', () => {
  let user1: { token: string};
  let user2: { token: string};

  let User1QuizList: string;
  let User2QuizList: string;

  let user1Token: string;

  beforeEach(() => {
    const resRegisterUser1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'user1@gmail.com',
          password: 'validPassword1',
          nameFirst: 'User',
          nameLast: 'One'
        },
        timeout: TIMEOUT_MS
      }
    );
    user1 = JSON.parse(resRegisterUser1.body.toString());
    expect(resRegisterUser1.statusCode).toStrictEqual(200);
    user1Token = user1.token;

    const resUser1QuizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user1Token,
        },
        timeout: TIMEOUT_MS,
      }
    );

    User1QuizList = JSON.parse(resUser1QuizList.body.toString());
    expect(resUser1QuizList.statusCode).toStrictEqual(200);
    expect(User1QuizList).toStrictEqual({
      quizzes: []
    });
  });

  test('Valid adminQuizTransfer', () => {
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

    user2 = JSON.parse(resRegisterUser2.body.toString());
    expect(resRegisterUser2.statusCode).toStrictEqual(200);
    const user2Token = user2.token;

    const resCreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user2Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resCreateQuiz.statusCode).toStrictEqual(200);
    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    const resUser2QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user2Token,
          userEmail: 'user1@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(200);
    const quizTransfer = JSON.parse(resUser2QuizTransfer.body.toString());

    const resUser2QuizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user2Token,
        },
        timeout: TIMEOUT_MS,
      }
    );

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(200);
    User2QuizList = JSON.parse(resUser2QuizList.body.toString());

    expect(User2QuizList).toStrictEqual({
      quizzes: []
    });

    const resAfterTransferUser1QuizList = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: {
          token: user1Token,
        },
        timeout: TIMEOUT_MS,
      }
    );

    const afterTransferUser1Quizlist = JSON.parse(
      resAfterTransferUser1QuizList.body.toString()
    );

    expect(afterTransferUser1Quizlist).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Math Quiz',
        }
      ]
    });

    expect(quizTransfer).toStrictEqual({});
  });

  test('returns error receiver is not a real user', () => {
    const resCreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    expect(resCreateQuiz.statusCode).toStrictEqual(200);

    const resUser1QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user1Token,
          userEmail: 'NotRealUser@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    const quizTransfer = JSON.parse(resUser1QuizTransfer.body.toString());

    expect(resUser1QuizTransfer.statusCode).toStrictEqual(400);
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error if user sends to themself', () => {
    const resCreateQuiz = request(
      'POST',
      `${url}:${port}/v1/admin/quiz`,
      {
        json: {
          token: user1Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    expect(resCreateQuiz.statusCode).toStrictEqual(200);

    const resUser1QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user1Token,
          userEmail: 'user1@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    const quizTransfer = JSON.parse(resUser1QuizTransfer.body.toString());

    expect(resUser1QuizTransfer.statusCode).toStrictEqual(400);
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error if receiver has a quiz with same name', () => {
    const resCreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resCreateQuiz.statusCode).toStrictEqual(200);

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
    user2 = JSON.parse(resRegisterUser2.body.toString());
    expect(resRegisterUser2.statusCode).toStrictEqual(200);
    const user2Token = user2.token;

    const resUser2CreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user2Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resUser2CreateQuiz.statusCode).toStrictEqual(200);
    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    const resUser2QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user2Token,
          userEmail: 'user1@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    const quizTransfer = JSON.parse(resUser2QuizTransfer.body.toString());

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(400);
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });

  test('return error if token is invalid', () => {
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

    user2 = JSON.parse(resRegisterUser2.body.toString());
    expect(resRegisterUser2.statusCode).toStrictEqual(200);
    const user2Token = user2.token;

    const resCreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user2Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resCreateQuiz.statusCode).toStrictEqual(200);
    const quiz = JSON.parse(resCreateQuiz.body.toString());
    const quizId = quiz.quizId;

    const resUser2QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: '',
          userEmail: 'user1@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(401);
    const quizTransfer = JSON.parse(resUser2QuizTransfer.body.toString());
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });

  test('return error if user is not an owner of this quiz', () => {
    const resUser1CreateQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: user1Token,
          name: 'Math Quiz',
          description: 'this is a math quiz'
        }
      }
    );

    expect(resUser1CreateQuiz.statusCode).toStrictEqual(200);
    const quiz = JSON.parse(resUser1CreateQuiz.body.toString());
    const quizId = quiz.quizId;

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

    request(
      'POST',
      `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'user3@gmail.com',
          password: 'validPassword3',
          nameFirst: 'User',
          nameLast: 'Three',
        },
        timeout: 100,
      }
    );

    user2 = JSON.parse(resRegisterUser2.body.toString());
    expect(resRegisterUser2.statusCode).toStrictEqual(200);
    const user2Token = user2.token;

    const resUser2QuizTransfer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
      {
        json: {
          token: user2Token,
          userEmail: 'user3@gmail.com',
        },
        timeout: TIMEOUT_MS
      }
    );

    expect(resUser2QuizTransfer.statusCode).toStrictEqual(403);
    const quizTransfer = JSON.parse(resUser2QuizTransfer.body.toString());
    expect(quizTransfer).toStrictEqual({ error: expect.any(String) });
  });
});

// tests for adminTrashEmpty
describe('Tests for adminTrashEmpty', () => {
  let admin: { token: string };
  let quizId: number;

  beforeEach(() => {
    // Register an admin user
    const resRegister = request(
      'POST',
      `${SERVER_URL}/v1/admin/auth/register`,
      {
        json: {
          email: 'admin@unsw.edu.au',
          password: 'AdminPass1234',
          nameFirst: 'Admin',
          nameLast: 'User',
        },
        timeout: TIMEOUT_MS,
      }
    );
    admin = JSON.parse(resRegister.body as string);

    // Create a quiz and get its ID
    const resCreateQuiz = request(
      'POST',
      `${SERVER_URL}/v1/admin/quiz`,
      {
        json: {
          token: admin.token,
          name: 'Sample Quiz',
          description: 'This is a sample quiz.',
        },
        timeout: TIMEOUT_MS,
      }
    );
    const quizResponse = JSON.parse(resCreateQuiz.body as string);
    quizId = quizResponse.quizId;

    // Simulate moving the quiz to trash
    request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
      qs: {
        token: admin.token
      },
      timeout: TIMEOUT_MS,
    });
  });

  test('successfully empties trash with valid token and valid quiz IDs', () => {
    const Response = request(
      'DELETE',
      `${SERVER_URL}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: admin.token,
          quizIds: JSON.stringify(quizId),
        }
      }
    );
    const parsedBody = JSON.parse(Response.body.toString());
    expect(Response.statusCode).toStrictEqual(200);
    expect(parsedBody).toStrictEqual({});
  });

  test('returns 401 error for invalid token', () => {
    const emptyResponse = request(
      'DELETE',
      `${SERVER_URL}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: 'invalid_token',
          quizIds: quizId,
        }
      }
    );

    expect(emptyResponse.statusCode).toStrictEqual(401);
    expect(JSON.parse(emptyResponse.body as string)).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('returns 401 error for empty token', () => {
    const emptyResponse = request(
      'DELETE',
      `${SERVER_URL}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: '',
          quizIds: quizId,
        }
      }
    );

    expect(emptyResponse.statusCode).toStrictEqual(401);
    expect(JSON.parse(emptyResponse.body as string)).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('returns 400 error for quiz ID not in trash', () => {
    const emptyResponse = request(
      'DELETE',
      `${SERVER_URL}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: admin.token,
          quizIds: 9999, // An ID that doesn't exist
        }
      }
    );

    expect(emptyResponse.statusCode).toStrictEqual(400);
    expect(JSON.parse(emptyResponse.body as string)).toStrictEqual(
      { error: 'Quiz ID is not in the trash.' }
    );
  });

  test('returns 403 error for quiz ID that does not belong to the current user', () => {
    // Create a new admin user
    const resRegisterNewAdmin = request(
      'POST',
      `${SERVER_URL}/v1/admin/auth/register`,
      {
        json: {
          email: 'newadmin@unsw.edu.au',
          password: 'NewAdminPass1234',
          nameFirst: 'New',
          nameLast: 'Admin',
        },
        timeout: TIMEOUT_MS,
      }
    );
    const newAdmin = JSON.parse(resRegisterNewAdmin.body as string);

    // Attempt to empty the trash using the new admin's token
    const emptyResponse = request(
      'DELETE',
      `${SERVER_URL}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: newAdmin.token,
          quizIds: quizId, // The quiz ID that belongs to the original admin
        },
        timeout: TIMEOUT_MS,
      }
    );

    expect(emptyResponse.statusCode).toStrictEqual(403);
    expect(JSON.parse(emptyResponse.body as string)).toStrictEqual(
      { error: 'Quiz ID does not belong to the current user.' }
    );
  });
});

describe('Tests for adminTrashEmpty with Multiple Quiz IDs', () => {
  let admin: { token: string };
  const quizIds: number[] = [];

  beforeEach(() => {
  // Register an admin user
    const resRegister = request(
      'POST',
    `${SERVER_URL}/v1/admin/auth/register`,
    {
      json: {
        email: 'admin@unsw.edu.au',
        password: 'AdminPass1234',
        nameFirst: 'Admin',
        nameLast: 'User',
      },
      timeout: TIMEOUT_MS,
    }
    );
    admin = JSON.parse(resRegister.body as string);

    for (let i = 0; i < 5; i++) {
      const resCreateQuiz = request(
        'POST',
      `${SERVER_URL}/v1/admin/quiz`,
      {
        json: {
          token: admin.token,
          name: `Sample Quiz ${i + 1}`,
          description: `This is sample quiz number ${i + 1}.`,
        },
        timeout: TIMEOUT_MS,
      }
      );

      const quizResponse = JSON.parse(resCreateQuiz.body as string);
      quizIds.push(quizResponse.quizId);
      // Simulate moving the quiz to trash

      request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizResponse.quizId}`, {
        qs: { token: admin.token },
        timeout: TIMEOUT_MS,
      });
    }
  });

  test('successfully empties trash with multiple valid quiz IDs', () => {
    const emptyResponse = request(
      'DELETE',
      `${SERVER_URL}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: admin.token,
          quizIds: JSON.stringify(quizIds),
        }
      }
    );
    const parsedBody = JSON.parse(emptyResponse.body.toString());
    expect(emptyResponse.statusCode).toStrictEqual(200);
    expect(parsedBody).toStrictEqual({});
  });

  test('Emptying trash with mixed valid and invalid quiz IDs', () => {
    for (let i = 0; i < 5; i++) {
      const resCreateQuiz = request(
        'POST',
        `${SERVER_URL}/v1/admin/quiz`,
        {
          json: {
            token: admin.token,
            name: `Sample Quiz ${i + 1}`,
            description: `This is sample quiz number ${i + 1}.`,
          },
          timeout: TIMEOUT_MS,
        }
      );

      const quizResponse = JSON.parse(resCreateQuiz.body as string);
      quizIds.push(quizResponse.quizId);
      // Simulate moving the quiz to trash

      request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizResponse.quizId}`, {
        qs: { token: admin.token },
        timeout: TIMEOUT_MS,
      });
    }
    const emptyResponse = request(
      'DELETE',
      `${SERVER_URL}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: admin.token,
          // quizIds: [quizIds[1], 9999, quizIds[3]], // Passing valid IDs and a non-existent ID
          quizIds: JSON.stringify([quizIds[1], 9999, quizIds[3]]),
        },
        timeout: TIMEOUT_MS,
      }
    );

    expect(emptyResponse.statusCode).toStrictEqual(400);
    const responseBody = JSON.parse(emptyResponse.body as string).error;
    expect(responseBody).toBe('Quiz ID is not in the trash.');
  });
});

