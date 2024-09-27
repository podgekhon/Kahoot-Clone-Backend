import { adminQuizCreate, adminQuizNameUpdate } from './quiz.js';
import {clear} from './other.js';

beforeEach(async () => {
    // Reset the state of our data so that each tests can run independently
    await clear();
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
                {
                    authUserId: 2, 
                    quizId: 3, 
                    name: 'maths', 
                    testDescription: 'duplciate quiz names with another quiz user owns',
        
                },
            ])(`$testDescription`, ({authUserId, quizId, name}) => {
                expect(adminQuizNameUpdate(authUserId, quizId, name)).toStrictEqual({error: expect.any(String)});
            })
        })

    //valid input test
    describe('valid inputs', () => {
        test('returns empty object', () => {
            expect(adminQuizNameUpdate(2, 3, 'science')).toStrictEqual(expect.any(Object));
        })
    })
})
