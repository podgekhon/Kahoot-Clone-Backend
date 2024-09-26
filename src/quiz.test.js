import { adminQuizCreate } from './quiz.js';
import {clear} from './other.js';

beforeEach(async () => {
    // Reset the state of our data so that each tests can run independently
    // await clear();
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
                output: {error: 'AuthUserId is not a valid user.'},
                testDescription: 'invalid authUserId',
            },
    
            {
                authUserId: 2, 
                name: 'chemQuiz_!@#', 
                description: 'science', 
                output: {error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'},
                testDescription: 'name contains invalid characters',
            },

            {
                authUserId: 2, 
                name: 'cq', 
                description: 'science', 
                output: {error: 'Name is either less than 3 characters long or more than 30 characters long.'},
                testDescription: 'name less than 3 characters',
            },
            {
                authUserId: 2, 
                name: 'Lorem ipsum dolor sit amet, con', 
                description: 'science', 
                output: {error: 'Name is either less than 3 characters long or more than 30 characters long.'},
                testDescription: 'name more than 30 characters',
    
            },
            {
                authUserId: 2, 
                name: 'pat', 
                description: 'Lorem ipsum dolor sit amet,' +
                'consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean ma', 
                output: {error: 'Description is more than 100 characters in length'},
                testDescription: 'description is more than 100 characters',
    
            },
    
        ])(`$testDescription`, ({authUserId, name, description, output}) => {
            expect(adminQuizCreate(authUserId, name, description)).toStrictEqual(output)
        })

        test('duplicate quiz names owned by same user', () => {
            const newQuiz1 = adminQuizCreate(2, 'chemQuiz', 'quiz about chemistry');
            const errorMsg = {error: 'Name is already used by the current logged in user for another quiz.'};
            expect(adminQuizCreate(2, 'chemQuiz', 'quiz about chemistry')).toStrictEqual(errorMsg);
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