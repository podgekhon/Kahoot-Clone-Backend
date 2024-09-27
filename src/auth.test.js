import { adminAuthRegister } from './auth.js';
import {clear} from './other.js';
import {adminAuthLogin} from './auth.js';
import { adminUserPasswordUpdate } from './auth.js';

beforeEach(() => {
  // Reset the state of our data so that each tests can run independently
  clear();
});

///////////-----adminAuthLogin-----////////////
describe('test for adminAuthLogin', () => {
  // test for email address doesn't exists when login
  test('Check email address exists', () => {
    const result = adminAuthLogin('XiaoyuanMa@unsw.edu.au', '1234abcd');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
  // password is not correct for the given email
  test('password not correct', () => {
    const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
    const result = adminAuthLogin('XiaoyuanMa@unsw.edu.au', 'abcd1234');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
  // test for correct retrun type
  test('successful login', () => {
    const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
    const result = adminAuthLogin('XiaoyuanMa@unsw.edu.au', '1234abcd');
    expect(result).toStrictEqual(user1);
  });
});

/////////-----adminUserPasswordUpdate-----//////////
describe('test for adminUserPasswordUpdate', () => {
  // authUserId is not valid user
  test('invalid authUserId', () => {
  	const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
		const result = adminUserPasswordUpdate('1234', '1234abcd', 'abcd1234');
		expect(result).toStrictEqual({ error: expect.any(String) });
  });
	// Old password is not the correct old password
	test('old password is wrong', () => {
		const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
		const result = adminUserPasswordUpdate(user1.authUserId, 'wrongpassword', 'abcd1234');
		expect(result).toStrictEqual({ error: expect.any(String) });
	});
	// Old password and new password match exactly
	test('new password is same as the old one', () => {
		const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
		const result = adminUserPasswordUpdate(user1.authUserId, '1234abcd', '1234abcd');
		expect(result).toStrictEqual({ error: expect.any(String) });
	});
	// New password has already been used before by this user
	test('new password has been used before', () => {
		const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
		const result1 = adminUserPasswordUpdate(user1.authUserId, '1234abcd', 'newpassword1');
		const result2 = adminUserPasswordUpdate(user1.authUserId, 'newpassword1', '1234abcd');
		expect(result2).toStrictEqual({ error: expect.any(String) });
	});
	// New password is less then 8 characters
	test('new password too short', () => {
		const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
		const result = adminUserPasswordUpdate(user1.authUserId, '1234abcd', '1a');
		expect(result).toStrictEqual({ error: expect.any(String) });
	});
	// New password does not contain at least one number and at least one letter
	describe('New password does not meet the requirement', () => {
		test('new password is empty', () => {
			const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
			const result = adminUserPasswordUpdate(user1.authUserId, '1234abcd', '');
			expect(result).toStrictEqual({ error: expect.any(String) });
		});
		test('new password contain no number', () => {
			const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
			const result = adminUserPasswordUpdate(user1.authUserId, '1234abcd', 'abcdefghi');
			expect(result).toStrictEqual({ error: expect.any(String) });
		});
		test('new password contain no letters', () => {
			const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
			const result = adminUserPasswordUpdate(user1.authUserId, '1234abcd', '1234567890');
			expect(result).toStrictEqual({ error: expect.any(String) });
		});
	});
	// correct return type
	test('Correct return type', () => {
		const user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
		const result = adminUserPasswordUpdate(user1.authUserId, '1234abcd', 'abcd1234');
		expect(result).toStrictEqual({});
	});
});