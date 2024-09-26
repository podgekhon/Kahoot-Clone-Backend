import { adminQuizCreate } from './quiz.js';
import {clear} from './other.js';

beforeEach(async () => {
    // Reset the state of our data so that each tests can run independently
    // await clear();
  });

describe('tests for adminQuizCreate', () => {
    const tooLongString =   'abcdefghijklmnopqrstuvwxyz' +
                            'abcdefghijklmnopqrstuvwxyz' +
                            'abcdefghijklmnopqrstuvwxyz' +
                            'abcdefghijklmnopqrstuvwxyz';
    
    test.each([
        {authUserId: -100, name: 'pat', description: tooLongString},
    ])('authUserId: $authUserId, name: $name, description: tooLongString', ({authUserId, name, description}) => {
        
    })
})
// describe('testing adminQuizCreate()', () => {
//     test('Check valid AuthUserId', () => {
//         const quizCreate = adminQuizCreate(1, 'pat', 'science');
//         expect(quizCreate).toStrictEqual({quizId: 2});
//     })
// })