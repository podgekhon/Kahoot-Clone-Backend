import {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizDescriptionUpdate,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizInfo,
} from './quiz.js';

import {
  adminAuthRegister,
  adminAuthLogin,
} from './auth.ts';

import { clear } from './other.js';

beforeEach(() => {
  // Reset the state of our data so that each tests can run independently
  clear();
});

describe('adminQuizCreate', () => {
  // invalid input tests
  describe('invalid inputs', () => {
    test('invalid authUserId', () => {
      expect(
        adminQuizCreate(3, 'chemQuiz', 'quiz about chemistry')
      ).toStrictEqual({ error: expect.any(String) });
    });

    test('name less than 3 characters', () => {
      const user1Id = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const quiz1 = adminQuizCreate(
        user1Id.authUserId,
        'cq',
        'science'
      );

      expect(quiz1).toStrictEqual({ error: expect.any(String) });
    });

    test('name more than 30 characters', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const quiz1 = adminQuizCreate(
        user1.authUserId,
        'Lorem ipsum dolor sit amet, con',
        'science'
      );

      expect(quiz1).toStrictEqual({ error: expect.any(String) });
    });

    test('name contains invalid characters', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const quiz1 = adminQuizCreate(
        user1.authUserId,
        'chemQuiz_!@#',
        'science'
      );

      expect(quiz1).toStrictEqual({ error: expect.any(String) });
    });

    test('description is more than 100 characters', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const quiz1 = adminQuizCreate(
        user1.authUserId,
        'chemQuiz',
        'Lorem ipsum dolor sit amet,' +
        'consectetuer adipiscing elit.' +
        'Aenean commodo ligula eget dolor. Aenean mass'
      );

      expect(quiz1).toStrictEqual({ error: expect.any(String) });
    });

    test('duplicate quiz names owned by same user', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      adminQuizCreate(
        user1.authUserId,
        'chemQuiz',
        'science'
      );
      const quiz2 = adminQuizCreate(
        user1.authUserId,
        'chemQuiz',
        'science'
      );

      expect(quiz2).toStrictEqual({ error: expect.any(String) });
    });
  });

  // valid input tests
  describe('valid inputs', () => {
    test('returns quizId', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const newQuiz = adminQuizCreate(
        user1.authUserId,
        'mathsQuiz',
        'maths'
      );

      expect(newQuiz.quizId).toStrictEqual(expect.any(Number));
    });
  });
});

describe('adminQuizNameUpdate', () => {
  // invalid input tests
  describe('invalid inputs', () => {
    test('invalid authUserId', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const quiz1 = adminQuizCreate(
        user1.authUserId,
        'chemQuiz',
        'science'
      );

      expect(adminQuizNameUpdate(
        3,
        quiz1.quizId,
        'maths'
      )).toStrictEqual({ error: expect.any(String) });
    });

    test('invalid quizId', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      adminQuizCreate(
        user1.authUserId,
        'chemQuiz',
        'science'
      );

      expect(adminQuizNameUpdate(
        user1.authUserId,
        2,
        'maths'
      )).toStrictEqual({ error: expect.any(String) });
    });

    test('user does not own quizId', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const user2 = adminAuthRegister(
        'andy123@gmail.com',
        'wordpass123',
        'andy',
        'smart'
      );
      const quiz1 = adminQuizCreate(
        user2.authUserId,
        'chemQuiz',
        'science'
      );

      expect(adminQuizNameUpdate(
        user1.authUserId,
        quiz1.quizId,
        'maths'
      )).toStrictEqual({ error: expect.any(String) });
    });

    test('name contains invalid characters', () => {
      const user1Id = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const quiz1Id = adminQuizCreate(
        user1Id.authUserId,
        'chemQuiz',
        'science'
      );

      expect(adminQuizNameUpdate(
        user1Id.authUserId,
        quiz1Id,
        'maths_!@#$'
      )).toStrictEqual({ error: expect.any(String) });
    });

    test('name less than 3 characters', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const quiz1 = adminQuizCreate(
        user1.authUserId,
        'chemQuiz',
        'science'
      );

      expect(adminQuizNameUpdate(
        user1.authUserId,
        quiz1.quizId,
        'cq'
      )).toStrictEqual({ error: expect.any(String) });
    });

    test('name more than 30 characters', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const quiz1 = adminQuizCreate(
        user1.authUserId,
        'chemQuiz',
        'science'
      );
      const newName = 'Lorem ipsum dolor sit amet, con';

      expect(adminQuizNameUpdate(
        user1.authUserId,
        quiz1.quizId,
        newName
      )).toStrictEqual({ error: expect.any(String) });
    });

    test('duplicate quiz names owned by same user', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      adminQuizCreate(
        user1.authUserId,
        'chemQuiz',
        'science'
      );
      const quiz2 = adminQuizCreate(
        user1.authUserId,
        'mathQuiz',
        'science'
      );

      expect(adminQuizNameUpdate(
        user1.authUserId,
        quiz2.quizId,
        'chemQuiz'
      )).toStrictEqual({ error: expect.any(String) });
    });
  });

  // valid input test
  describe('valid inputs', () => {
    test('returns empty object', () => {
      const user1 = adminAuthRegister(
        'john123@gmail.com',
        'wordpass123',
        'john',
        'smith'
      );
      const quiz1 = adminQuizCreate(
        user1.authUserId,
        'chemQuiz',
        'science'
      );

      expect(adminQuizNameUpdate(
        user1.authUserId,
        quiz1.quizId,
        'mathsQuiz'
      )).toStrictEqual({ });
    });
  });
});

describe('adminQuizRemove', () => {
  test('removes a valid quiz owned by the user', () => {
    // Register a user and create a quiz
    const user = adminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    );
    const quiz = adminQuizCreate(
      user.authUserId,
      'validQuizName',
      'validQuizDescription'
    );

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
    );
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
    );
    const user2 = adminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );
    const quiz1 = adminQuizCreate(
      user1.authUserId,
      'validQuizName',
      'validQuizDescription'
    );

    // User 2 tries to remove User 1's quiz
    const result = adminQuizRemove(user2.authUserId, quiz1.quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});

describe('adminQuizDescriptionUpdate', () => {
  test('successfully updates the quiz description', () => {
    // Register a user and create a quiz
    const user = adminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    );
    const quiz = adminQuizCreate(
      user.authUserId,
      'validQuizName',
      'validQuizDescription'
    );

    // Update the quiz description
    const result = adminQuizDescriptionUpdate(
      user.authUserId,
      quiz.quizId,
      'Updated description'
    );
    expect(result).toStrictEqual({});
  });

  test('successfully updates quiz description with an empty string', () => {
    // Register a user and create a quiz
    const user = adminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    );
    const quiz = adminQuizCreate(
      user.authUserId,
      'validQuizName',
      'validQuizDescription'
    );

    // Update the description wtih an empty string
    const result = adminQuizDescriptionUpdate(
      user.authUserId,
      quiz.quizId,
      ''
    );
    expect(result).toStrictEqual({});
  });

  test('returns error when authUserId is not valid', () => {
    // Attempt to update with an invalid authUserId
    const result = adminQuizDescriptionUpdate(99, 1, 'New description');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quizId is not valid', () => {
    const user = adminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    );
    // Attempt to update with an invalid quizId
    const result = adminQuizDescriptionUpdate(
      user.authUserId,
      999,
      'New description'
    );
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user does not own the quiz', () => {
    const user1 = adminAuthRegister(
      'user1@gmail.com',
      'validPassword1',
      'User',
      'One'
    );
    const user2 = adminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );
    const quiz1 = adminQuizCreate(
      user1.authUserId,
      'validQuizName',
      'validQuizDescription'
    );

    // User 2 tries to update User 1's quiz description
    const result = adminQuizDescriptionUpdate(
      user2.authUserId,
      quiz1.quizId,
      'New description'
    );
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when description is longer than 100 characters', () => {
    const user = adminAuthRegister(
      'test@gmail.com',
      'validPassword5',
      'Patrick',
      'Chen'
    );
    const quiz = adminQuizCreate(
      user.authUserId,
      'validQuizName',
      'validQuizDescription'
    );

    // Attempt to update with a description longer than 100 characters
    const longDescription = 'ABC'.repeat(101);
    const result = adminQuizDescriptionUpdate(
      user.authUserId,
      quiz.quizId,
      longDescription
    );
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});

describe('adminQuizList', () => {
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
    );
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
    );
    const quiz1 = adminQuizCreate(
      loggedInUser.authUserId,
      'Math Quiz',
      '12345'
    );
    const quiz2 = adminQuizCreate(
      loggedInUser.authUserId,
      'English Quiz',
      'ABCDEF'
    );
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

describe('adminQuizInfo Function Tests', () => {
  let authUserId;
  let quizId;

  beforeEach(() => {
    // Register a user and create a quiz before each test
    const result = adminAuthRegister(
      'pat@gmail.com',
      'password123',
      'Patrick',
      'Truong'
    );
    authUserId = result.authUserId;

    const quizResult = adminQuizCreate(
      authUserId,
      'code',
      'this very hard code quiz'
    );
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
    );
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

describe('clear function test', () => {
  // This test verifies the functionality of the clear function.
  test('should reset the state and return an empty object', () => {
    const result = clear();
    expect(result).toEqual({});
  });
});
