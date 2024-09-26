import { adminQuizCreate, adminQuizNameUpdate } from './quiz.js';
import {clear} from './other.js';

beforeEach(async () => {
    // Reset the state of our data so that each tests can run independently
    await clear();
  });

describe('test for adminQuizCreate', () => {
    const tooLongString =   'abcdefghijklmnopqrstuvwxyz' +
                            'abcdefghijklmnopqrstuvwxyz' +
                            'abcdefghijklmnopqrstuvwxyz' +
                            'abcdefghijklmnopqrstuvwxyz';
    
    test.each([
        //these tests will check for invalid inputs
        {authUserId: -100, name: 'pat1', description: 'science', output: {error: 'AuthUserId is not a valid user.'}},
        {authUserId: 2, name: 'pat_12', description: 'science', output: {error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'}},
        {authUserId: 2, name: 'pat1', description: 'science', output: {error: 'Name is already used by the current logged in user for another quiz.'}},
        {authUserId: 2, name: 'pa', description: 'science', output: {error: 'Name is either less than 3 characters long or more than 30 characters long.'}},
        {authUserId: 2, name: 'abcdefghijklmnopqrstuvwxyz12345', description: 'science', output: {error: 'Name is either less than 3 characters long or more than 30 characters long.'}},
        {authUserId: 2, name: 'pat', description: tooLongString, output: {error: 'Description is more than 100 characters in length'}},

        //idk about testing for valid inputs, i think we should tho
        {authUserId: 2, name: 'pat1', description: 'science', output: {quizId: 2}},



    ])(`($authUserId, $name, $description) : $output`, ({authUserId, name, description, output}) => {
        expect(adminQuizCreate(authUserId, name, description)).toStrictEqual(output);
    })
})

describe('adminQuizNameUpdate', () => {
    test.each([
        //test cases for invalid inputs
        {
            authUserId: -100, 
            quizId: 3, 
            name: 'science', 
            output: {error: 'AuthUserId is not a valid user.'},
            testDescription: 'authUserId is not valid',
        },
        {
            authUserId: 2, 
            quizId: -3000, 
            name: 'science', 
            output: {error: 'Quiz ID does not refer to a valid quiz.'},
            testDescription: 'quizId is not valid',
        },
        {
            authUserId: 2, 
            quizId: 3000, 
            name: 'science', 
            output: {error: 'Quiz ID does not refer to a quiz that this user owns'},
            testDescription: 'quizId valid but user does not own',
        },
        {
            authUserId: 2, 
            quizId: 3, 
            name: 'science_$%^', 
            output: {error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'},
            testDescription: 'new quiz name contains invalid characters',

        },
        {
            authUserId: 2, 
            quizId: 3, 
            name: 'sc', 
            output: {error: 'Name is either less than 3 characters long or more than 30 characters long.'},
            testDescription: 'new quiz name is less than 3 characters',

        },
        {
            authUserId: 2, 
            quizId: 3, 
            name: 'abcdefghijklmnopqrstuvwxyz12345', 
            output: {error: 'Name is either less than 3 characters long or more than 30 characters long.'},
            testDescription: 'new quiz name is more than 30 characters',

        },
        {
            authUserId: 2, 
            quizId: 3, 
            name: 'maths', 
            output: {error: 'Name is already used by the current logged in user for another quiz.'},
            testDescription: 'duplciate quiz names with another quiz user owns',

        },

        //test cases for valid inputs
        {
            authUserId: 2, 
            quizId: 3, 
            name: 'science',
            output: {},
            testDescription: 'valid inputs',
        },

    ])(`$testDescription`, ({authUserId, quizId, name, output}) => {
        expect(adminQuizNameUpdate(authUserId, quizId, name)).toStrictEqual(output);
    })
})