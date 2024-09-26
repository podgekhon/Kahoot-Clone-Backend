import { adminQuizCreate } from './quiz.js';
import {clear} from './other.js';

beforeEach(async () => {
    // Reset the state of our data so that each tests can run independently
    // await clear();
  });

describe('adminQuizCreate', () => {
    const tooLongString =   'abcdefghijklmnopqrstuvwxyz' +
                            'abcdefghijklmnopqrstuvwxyz' +
                            'abcdefghijklmnopqrstuvwxyz' +
                            'abcdefghijklmnopqrstuvwxyz';
    
    test.each([
        //these tests will check for invalid inputs
        {
            //assuming that authUserId cannot be negative??
            authUserId: -100, name: 'pat1', 
            description: 'science', 
            output: {error: 'AuthUserId is not a valid user.'},
            testDescription: 'invalid authUserId',
        },

        {
            authUserId: 2, 
            name: 'pat_!@#', 
            description: 'science', 
            output: {error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'},
            testDescription: 'name contains invalid characters',
        },
        {
            authUserId: 2, 
            name: 'pat1', 
            description: 'science', 
            output: {error: 'Name is already used by the current logged in user for another quiz.'},
            testDescription: 'name already used for another quiz owned by same user',
        },
        {
            authUserId: 2, 
            name: 'pa', 
            description: 'science', 
            output: {error: 'Name is either less than 3 characters long or more than 30 characters long.'},
            testDescription: 'name less than 3 characters',
        },
        {
            authUserId: 2, 
            name: 'abcdefghijklmnopqrstuvwxyz12345', 
            description: 'science', 
            output: {error: 'Name is either less than 3 characters long or more than 30 characters long.'},
            testDescription: 'name more than 30 characters',

        },
        {
            authUserId: 2, 
            name: 'pat', 
            description: tooLongString, 
            output: {error: 'Description is more than 100 characters in length'},
            testDescription: 'description is more than 100 characters',

        },

        //valid input tests
        {
            authUserId: 2, 
            name: 'pat', 
            description: 'science', 
            output: {quizId: 2},
            testDescription: 'valid inputs',

        },



    ])(`$testDescription`, ({authUserId, name, description, output}) => {
        expect(adminQuizCreate(authUserId, name, description)).toStrictEqual(output)
    })
})