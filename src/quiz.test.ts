import request from 'sync-request-curl'
import { port, url } from './config.json'
// import { httpStatus } from './server'

const SERVER_URL = `${url}:${port}`
const TIMEOUT_MS = 100 * 1000

export enum httpStatus {
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  SUCCESSFUL_REQUEST = 200,
}
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS })
})

// describe('adminQuizCreate', () => {
//   let user1;
//   let user1Return;
//   let user1token: string;
//   // register a user
// beforeEach(() => {
//   user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
//     json: {
//       email: 'ericMa@unsw.edu.au',
//       password: 'EricMa1234',
//       nameFirst: 'Eric',
//       nameLast: 'Ma'
//     },
//     timeout: TIMEOUT_MS
//   });
//   user1Return = JSON.parse(user1.body.toString());
//   user1token = user1Return.token;
// });
// test('invalid token', () => {
//   const result = request(
//     'POST',
//     SERVER_URL + '/v1/admin/quiz',
//     {
//       json: {
//         token: JSON.stringify('hahainvalid'),
//         name: 'Quiz1',
//         description: 'lol invalid token'
//       },
//       timeout: TIMEOUT_MS
//     }
//   );
//   expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
//   expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
// });
// test('empty token', () => {
//   const result = request(
//       'POST',
//       SERVER_URL + '/v1/admin/quiz',
//       {
//         json: {
//           token: JSON.stringify(''),
//           name: 'Quiz1',
//           description: 'lol invalid token'
//         },
//         timeout: TIMEOUT_MS
//       }
//     );
//     expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
//     expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
//   });

//   test('name less than 3 characters', () => {
//     const result = request(
//       'POST',
//       SERVER_URL + '/v1/admin/quiz',
//       {
//         json: {
//           token: user1token,
//           name: '1',
//           description: 'lol too short'
//         },
//         timeout: TIMEOUT_MS
//       }
//     );
//     expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
//     expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
//   });

//   test('name more than 30 characters', () => {
//     const result = request(
//       'POST',
//       SERVER_URL + '/v1/admin/quiz',
//       {
//         json: {
//           token: user1token,
//           name: 'fdjskalgeiowagheowagnwageowhgiowegwaogdlsagdslagiowaghowhagowaofdsgd',
//           description: 'toooooo long'
//         },
//         timeout: TIMEOUT_MS
//       }
//     );
//     expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
//     expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
//   });

//   test('name contains invalid characters', () => {
//     const result = request(
//       'POST',
//       SERVER_URL + '/v1/admin/quiz',
//       {
//         json: {
//           token: user1token,
//           name: '~hahha',
//           description: 'lol invalid quiz name'
//         },
//         timeout: TIMEOUT_MS
//       }
//     );
//     expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
//     expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
//   });

//   test('description is more than 100 characters', () => {
//     const result = request(
//       'POST',
//       SERVER_URL + '/v1/admin/quiz',
//       {
//         json: {
//           token: user1token,
//           name: 'quiz1',
//           description:
//           'fdsajfoejgiowajiogiowagjoawoeoiwafoiwoshi' +
//           'shabifoewajiojgeoiwagiowhauhueiwaiuguirdfsafdsa' +
//           'fdsafoeahgioewghioagoieajgioewoaigjoiwegjioewagjoiweajgo'
//         },
//         timeout: TIMEOUT_MS
//       }
//     );
//     expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
//     expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
//   });

//   test('duplicate quiz names owned by same user', () => {
//     request(
//       'POST',
//       SERVER_URL + '/v1/admin/quiz',
//       {
//         json: {
//           token: user1token,
//           name: 'quiz1',
//           description: 'this is the first quiz'
//         },
//         timeout: TIMEOUT_MS
//       }
//     );
//     const result = request(
//       'POST',
//       SERVER_URL + '/v1/admin/quiz',
//       {
//         json: {
//           token: user1token,
//           name: 'quiz1',
//           description: 'this is the second quiz with name of quiz1'
//         },
//         timeout: TIMEOUT_MS
//       }
//     );
//     expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
//     expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
//   });

//   // valid input tests
//   test('valid inputs', () => {
//     const result = request(
//       'POST',
//       SERVER_URL + '/v1/admin/quiz',
//       {
//         json: {
//           token: user1token,
//           name: 'quiz1',
//           description: 'this is quiz 1'
//         },
//         timeout: TIMEOUT_MS
//       }
//     );
//     expect(result.statusCode).toStrictEqual(200);
//     expect(JSON.parse(result.body.toString())).toStrictEqual({ quizId: expect.any(Number) });
//   });
// });








describe('adminQuizNameUpdate', () => {
  // invalid input tests
  let user1
  let quiz1
  let user1token: string
  let quiz1Id: number
  beforeEach(() => {
    user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ericMa@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma',
      },
      timeout: TIMEOUT_MS,
    })
    user1token = JSON.parse(user1.body.toString()).token

    quiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'quiz1',
        description: 'this is quiz 1',
      },
      timeout: TIMEOUT_MS,
    })
    quiz1Id = JSON.parse(quiz1.body.toString()).quizId
  })

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
    )
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED)
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    })
  })

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
    )
    expect(result.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED)
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    })
  })

  test('invalid quizId', () => {
    const result = request('PUT', SERVER_URL + `/v1/admin/quiz/${10}/name`, {
      json: {
        token: user1token,
        name: 'newQuizName',
      },
    })
    expect(result.statusCode).toStrictEqual(httpStatus.FORBIDDEN)
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    })
  })

  test('user does not own quizId', () => {
    const user2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ee@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma',
      },
      timeout: TIMEOUT_MS,
    })
    const user2token = JSON.parse(user2.body.toString()).token

    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/name`,
      {
        json: {
          token: user2token,
          name: 'newQuizName',
        },
      }
    )
    expect(result.statusCode).toStrictEqual(httpStatus.FORBIDDEN)
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    })
  })

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
    )
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST)
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    })
  })

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
    )
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST)
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    })
  })

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
    )
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST)
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    })
  })

  test('duplicate quiz names owned by same user', () => {
    const quiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'quiz2',
        description: 'this is quiz 2',
      },
      timeout: TIMEOUT_MS,
    })
    const quiz2Id = JSON.parse(quiz2.body.toString()).quizId

    const result = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quiz2Id}/name`,
      {
        json: {
          token: user1token,
          name: 'quiz1',
        },
      }
    )
    expect(result.statusCode).toStrictEqual(httpStatus.BAD_REQUEST)
    expect(JSON.parse(result.body.toString())).toStrictEqual({
      error: expect.any(String),
    })
  })

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
    )
    expect(result.statusCode).toStrictEqual(200)
    expect(JSON.parse(result.body.toString())).toStrictEqual({})
  })
})













/*

describe.skip('adminQuizRemove', () => {
  test('removes a valid quiz owned by the user', () => {
    // Register a user and create a quiz
    const user = adminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    ) as authResponse;
    const quiz = adminQuizCreate(
      user.authUserId,
      'validQuizName',
      'validQuizDescription'
    ) as quizCreateResponse;

    // Remove the quiz
    const result = adminQuizRemove(user.authUserId, quiz.quizId);
    expect(result).toStrictEqual({});
  });

  test('returns error when authUserId is not valid', () => {
    // The first parameter (authUserId) is an arbitrary number,
    // and hence invalid
    const result = adminQuizRemove(99, 1);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quizId is not valid', () => {
    const user = adminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    ) as authResponse;
    // The second parameter (quizId) is an arbitrary number,
    // and hence invalid
    const result = adminQuizRemove(user.authUserId, 999);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user does not own the quiz', () => {
    const user1 = adminAuthRegister(
      'user1@gmail.com',
      'validPassword1',
      'User',
      'One'
    ) as authResponse;
    const user2 = adminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    ) as authResponse;
    const quiz1 = adminQuizCreate(
      user1.authUserId,
      'validQuizName',
      'validQuizDescription'
    ) as quizCreateResponse;

    // User 2 tries to remove User 1's quiz
    const result = adminQuizRemove(user2.authUserId, quiz1.quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});


describe.skip('adminQuizList', () => {
  test('returns an empty list when user has no quizzes', () => {
    // Register and login a user who has no quizzes
    adminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    );
    const loggedInUser = adminAuthLogin(
      'test@gmail.com',
      'validPassword5'
    ) as authResponse;
    // Get the list of quizzes for this user (should be empty)
    const result = adminQuizList(loggedInUser.authUserId);
    // Expect an empty quizzes array
    expect(result).toStrictEqual({
      quizzes: [],
    });
  });

  test('returns a list of quizzes owned by the user', () => {
    // Register and login a user, then create quizzes
    adminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    );
    const loggedInUser = adminAuthLogin(
      'test@gmail.com',
      'validPassword5'
    ) as authResponse;
    const quiz1 = adminQuizCreate(
      loggedInUser.authUserId,
      'Math Quiz',
      '12345'
    ) as quizCreateResponse;
    const quiz2 = adminQuizCreate(
      loggedInUser.authUserId,
      'English Quiz',
      'ABCDEF'
    ) as quizCreateResponse;
    // Get the list of quizzes for this user
    const result = adminQuizList(loggedInUser.authUserId);
    // Expect an array of quizzes owned by the user
    expect(result).toStrictEqual({
      quizzes: [
        { quizId: quiz1.quizId, name: 'Math Quiz' },
        { quizId: quiz2.quizId, name: 'English Quiz' },
      ],
    });
  });

  test('returns an error when authUserId is not valid', () => {
    // Pass an arbitrary and invalid authUserId
    const result = adminQuizList(999);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});

describe.skip('adminQuizInfo Function Tests', () => {
  let authUserId: number;
  let quizId: number;

  beforeEach(() => {
    // Register a user and create a quiz before each test
    const result = adminAuthRegister(
      'pat@gmail.com',
      'password123',
      'Patrick',
      'Truong'
    ) as authResponse;
    authUserId = result.authUserId;

    const quizResult = adminQuizCreate(
      authUserId,
      'code',
      'this very hard code quiz'
    ) as quizCreateResponse;
    quizId = quizResult.quizId;
  });

  test('Valid user and valid quiz ID - should return quiz info', () => {
    // Tests quiz info for a valid user and quiz ID
    const result = adminQuizInfo(authUserId, quizId);
    expect(result).toEqual({
      quizId: quizId,
      name: 'code',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this very hard code quiz',
    });
  });

  test('User queries a quiz they do not own' +
       ' - should return specific error', () => {
    // Tests error when a user tries to access a quiz they don't own
    const newUser = adminAuthRegister(
      'newuser@gmail.com',
      'password456',
      'New',
      'User'
    ) as authResponse;
    const newUserId = newUser.authUserId;

    const result = adminQuizInfo(newUserId, quizId);
    expect(result).toEqual({ error: expect.any(String) });
  });

  test('Invalid User ID - should return specific error', () => {
    // Tests error when querying an invalid user ID
    const result = adminQuizInfo(authUserId + 1, quizId);
    expect(result).toEqual({ error: expect.any(String) });
  });

  test('Invalid Quiz ID - should return specific error', () => {
    // Tests error when querying an invalid quiz ID
    const result = adminQuizInfo(authUserId, 999);
    expect(result).toEqual({ error: expect.any(String) });
    });
    });
    */

test('test clear successful', () => {
  const result = request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: 100,
  })
  // has correct return type
  expect(JSON.parse(result.body.toString())).toStrictEqual({})
  expect(result.statusCode).toStrictEqual(200)

  // let user : { token: string };
  // let quiz: { quizId: string };

  // register a user
  /*
  const usersession = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'EricMa@ad.unsw.edu.au',
      password: 'EricMa1234',
      nameFirst: 'Eric',
      nameLast: 'Ma'
    },
    timeout: 100,
  });
  const user = JSON.parse(usersession.body as string);

  // create a quiz
  const quizsession = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      token: user.token,
      name: 'My Quiz Name',
      description: 'A description of my quiz'
    },
    timeout: 100,
  });
  const quiz = JSON.parse(quizsession.body as string);

  // clear up everything so will return error if a get request is called
  const userListRes = request('GET', SERVER_URL + '/v1/admin/user/details', {
    qs: {
      token: user.token,
    }
  });
  expect(JSON.parse(userListRes.body.toString())).toStrictEqual({ error: expect.any(String) });

  const quizListRes = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
    qs: {
      token: user.token,
    }
  });
  expect(JSON.parse(quizListRes.body.toString())).toStrictEqual({ error: expect.any(String) });

  const quizRes = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, {
    qs: {
      token: user.token,
    }
  });
  expect(JSON.parse(quizRes.body.toString())).toStrictEqual({ error: expect.any(String) });
  */
})
