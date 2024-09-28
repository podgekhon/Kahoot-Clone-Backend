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
    adminAuthLogin, } from './auth.js';
import {clear} from './other.js';

beforeEach(() => {
    // Reset the state of our data so that each tests can run independently
    clear();
});

describe('adminQuizCreate', () => {

    //these tests will check for invalid inputs
    describe('invalid inputs', () => {

        test.each([
            {
                //assuming that authUserId cannot be negative??
                authUserId: -100, 
                name: 'chemQuiz', 
                description: 'science', 
                testDescription: 'invalid authUserId',
            },
    
            {
                authUserId: 2, 
                name: 'chemQuiz_!@#', 
                description: 'science', 
                testDescription: 'name contains invalid characters',
            },

            {
                authUserId: 2, 
                name: 'cq', 
                description: 'science', 
                testDescription: 'name less than 3 characters',
            },
            {
                authUserId: 2, 
                name: 'Lorem ipsum dolor sit amet, con', 
                description: 'science', 
                testDescription: 'name more than 30 characters',
    
            },
            {
                authUserId: 2, 
                name: 'pat', 
                description: 'Lorem ipsum dolor sit amet,' +
                'consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean ma', 
                testDescription: 'description is more than 100 characters',
    
            },
    
        ])(`$testDescription`, ({authUserId, name, description, output}) => {
            expect(adminQuizCreate(authUserId, name, description)).toStrictEqual({error: expect.any(String)})
        })

        test('duplicate quiz names owned by same user', () => {
            const newQuiz1 = adminQuizCreate(2, 'chemQuiz', 'quiz about chemistry');
            const errorMsg = {error: 'Name is already used by the current logged in user for another quiz.'};
            expect(adminQuizCreate(2, 'chemQuiz', 'quiz about chemistry')).toStrictEqual({error: expect.any(String)});
        })
    })

    describe('valid inputs', () => {
                //valid input tests
        test('returns quizId', () => {
            const newQuiz = adminQuizCreate(2, 'chemQuiz', 'science');
            expect(newQuiz).toStrictEqual({quizId: expect.any(Number)});
        })
    })
    
})

describe('adminQuizNameUpdate', () => {
    //invalid input tests
    describe('invalid inputs', () => {
            test.each([
                {
                    authUserId: -100, 
                    quizId: 3, 
                    name: 'science', 
                    testDescription: 'authUserId is not valid',
                },
                {
                    authUserId: 2, 
                    quizId: -3000, 
                    name: 'science', 
                    testDescription: 'quizId is not valid',
                },
                {
                    authUserId: 2, 
                    quizId: 3000, 
                    name: 'science', 
                    testDescription: 'quizId valid but user does not own',
                },
                {
                    authUserId: 2, 
                    quizId: 3, 
                    name: 'science_$%^', 
                    testDescription: 'new quiz name contains invalid characters',
        
                },
                {
                    authUserId: 2, 
                    quizId: 3, 
                    name: 'sc', 
                    testDescription: 'new quiz name is less than 3 characters',
        
                },
                {
                    authUserId: 2, 
                    quizId: 3, 
                    name: 'abcdefghijklmnopqrstuvwxyz12345', 
                    testDescription: 'new quiz name is more than 30 characters',
        
                },
            ])(`$testDescription`, ({authUserId, quizId, name}) => {
                expect(adminQuizNameUpdate(authUserId, quizId, name)).toStrictEqual({error: expect.any(String)});
            })

            test('duplciate quiz names with another quiz user owns', () => {
                const quiz1Id = adminQuizCreate(2, 'chemQuiz', 'science'); 
                const quiz2Id = adminQuizCreate(2, 'physicsQuiz', 'science2'); //since quiz2 returns a quizId if successful
                expect(adminQuizNameUpdate(2, quiz2Id, 'chemQuiz')).toStrictEqual({error: expect.any(String)});
            })
        })
    
    //valid input test
    describe('valid inputs', () => {
        test('returns empty object', () => {
            expect(adminQuizNameUpdate(2, 3, 'science')).toStrictEqual(expect.any(Object));
        })
    })
})


describe('adminQuizRemove', () => {
    test('removes a valid quiz owned by the user', () => {
        // Register a user and create a quiz
        const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
        const quiz = adminQuizCreate(user.authUserId, 'validQuizName', 'validQuizDescription');
    
        // Remove the quiz
        const result = adminQuizRemove(user.authUserId, quiz.quizId);
        expect(result).toStrictEqual({}); 
    });

    test('returns error when authUserId is not valid', () => {
        // The first parameter (authUserId) is an arbitrary number, and hence invalid
        const result = adminQuizRemove(99, 1); 
        expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error when quizId is not valid', () => {
        const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
        // The second parameter (quizId) is an arbitrary number, and hence invalid
        const result = adminQuizRemove(user.authUserId, 999); 
        expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error when user does not own the quiz', () => {
        const user1 = adminAuthRegister('user1@gmail.com', 'validPassword1', 'User', 'One');
        const user2 = adminAuthRegister('user2@gmail.com', 'validPassword2', 'User', 'Two');
        const quiz1 = adminQuizCreate(user1.authUserId, 'validQuizName', 'validQuizDescription');
    
        // User 2 tries to remove User 1's quiz
        const result = adminQuizRemove(user2.authUserId, quiz1.quizId);
        expect(result).toStrictEqual({ error: expect.any(String) });
    });
});

describe('adminQuizDescriptionUpdate', () => {
    test('successfully updates the quiz description', () => {
        // Register a user and create a quiz
        const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
        const quiz = adminQuizCreate(user.authUserId, 'validQuizName', 'validQuizDescription');
        
        // Update the quiz description
        const result = adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'Updated description');
        expect(result).toStrictEqual({});
    });

    test('successfully updates quiz description with an empty string', () => {
        // Register a user and create a quiz
        const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
        const quiz = adminQuizCreate(user.authUserId, 'validQuizName', 'validQuizDescription');
        
        // Update the description wtih an empty string
        const result = adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, '');
        expect(result).toStrictEqual({}); 
    });

    test('returns error when authUserId is not valid', () => {
        // Attempt to update with an invalid authUserId
        const result = adminQuizDescriptionUpdate(99, 1, 'New description');
        expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error when quizId is not valid', () => {
        const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
        // Attempt to update with an invalid quizId
        const result = adminQuizDescriptionUpdate(user.authUserId, 999, 'New description');
        expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error when user does not own the quiz', () => {
        const user1 = adminAuthRegister('user1@gmail.com', 'validPassword1', 'User', 'One');
        const user2 = adminAuthRegister('user2@gmail.com', 'validPassword2', 'User', 'Two');
        const quiz1 = adminQuizCreate(user1.authUserId, 'validQuizName', 'validQuizDescription');
        
        // User 2 tries to update User 1's quiz description
        const result = adminQuizDescriptionUpdate(user2.authUserId, quiz1.quizId, 'New description');
        expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error when description is longer than 100 characters', () => {
        const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
        const quiz = adminQuizCreate(user.authUserId, 'validQuizName', 'validQuizDescription');
        
        // Attempt to update with a description longer than 100 characters
        const longDescription = 'ABC'.repeat(101);
        const result = adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, longDescription);
        expect(result).toStrictEqual({ error: expect.any(String) });
    });
});

describe('adminQuizList', () => {
    test('returns an empty list when user has no quizzes', () => {
        // Register and login a user who has no quizzes
        adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
        const loggedInUser = adminAuthLogin('test@gmail.com', 'validPassword5');
        // Get the list of quizzes for this user (should be empty)
        const result = adminQuizList(loggedInUser.authUserId);
        // Expect an empty quizzes array
        expect(result).toStrictEqual({
          quizzes: [],
        });
    });

    test('returns a list of quizzes owned by the user', () => {
        // Register and login a user, then create quizzes
        adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
        const loggedInUser = adminAuthLogin('test@gmail.com', 'validPassword5');
        const quiz1 = adminQuizCreate(loggedInUser.authUserId, 'Math Quiz', '12345');
        const quiz2 = adminQuizCreate(loggedInUser.authUserId, 'English Quiz', 'ABCDEF');
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
        const result = adminAuthRegister("pat@gmail.com", "password123", "Patrick", "Truong");
        authUserId = result.authUserId;

        const quizResult = adminQuizCreate(authUserId, "code", "this very hard code quiz");
        quizId = quizResult.quizId;
    });

    test('Valid user and valid quiz ID - should return quiz info', () => {
        // Tests quiz info for a valid user and quiz ID
        const result = adminQuizInfo(authUserId, quizId);
        expect(result).toEqual({
            quizId: quizId,
            name: "code",
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: "this very hard code quiz",
        });
    });

    test('User queries a quiz they do not own - should return specific error', () => {
        // Tests error when a user tries to access a quiz they don't own
        const newUser = adminAuthRegister("newuser@gmail.com", "password456", "New", "User");
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