import { adminAuthRegister } from './auth.js';
import {clear} from './other.js';

beforeEach(async () => {
    // Reset the state of our data so that each tests can run independently
    await clear();
  });

describe('tests for adminAuthRegister', () => {
    test('Check successful registration', () => {
        const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    });
    
    test('Check duplicate email', () => {
        const authUserId2 = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
        expect(authUserId2).toStrictEqual({ error: expect.any(String) });
    });
    
    test('Check fail on short passwords', () => {
        const authUserId = adminAuthRegister('eric@unsw.edu.au', '', 'Eric', 'Yang');
        expect(authUserId1).toStrictEqual({error: expect.any(String)});
        const authUserId2 = adminAuthRegister('eric@unsw.edu.au', '1', 'Eric', 'Yang');
        expect(authUserId2).toStrictEqual({error: expect.any(String)});
    });
    
    test('Login was successful', () => {
        const user1 = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
        const unser2 = adminAuthRegister('eric@unsw.edu.au', '1234abcd');
        expect(user1.authUserId).toBe(user2.authUserId);
    });
    
    test('Log in with an email that doesn\'t exist', () => {
        const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd');
        expect(authUserId).toStrictEqual({error: expect.any(String)});
    })

});    