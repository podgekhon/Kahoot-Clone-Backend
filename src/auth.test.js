import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';
import { adminAuthLogin } from './auth.js';
import { adminUserDetails } from './auth.js';
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

///////////-----adminUserDetails-----////////////
describe('test for adminUserDetails', () => {
	test('successfully returns details of a valid user', () => {
		// Register a user
		const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
		// Get user details
		const result = adminUserDetails(user.authUserId);
		// Validate that the correct user details are returned
		expect(result).toStrictEqual({
		  user: {
			userId: user.authUserId,  
			// Full name concatenated with single space in between
			name: 'Patrick Chen',     
			email: 'test@gmail.com',
			// Starts at 1 upon registration
			numSuccessfulLogins: 1,   
			numFailedPasswordsSinceLastLogin: 0,  
		  }
		});
	});

	test('returns error when authUserId is not valid', () => {
		// Provide an invalid authUserId (999 is arbitrary and invalid)
		const result = adminUserDetails(999); 
		expect(result).toStrictEqual({ error: expect.any(String) });
	});


	test('numSuccessfulLogins increments after successful logins', () => {
		// Register a user
		const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
		// Simulate multiple successful logins
		adminAuthLogin('test@gmail.com', 'validPassword5');
		adminAuthLogin('test@gmail.com', 'validPassword5');
		// Get user details
		const result = adminUserDetails(user.authUserId);
		// Check if the number of successful logins is correct 
		// (3 logins: 1 registration + 2 logins)
		expect(result.user.numSuccessfulLogins).toBe(3);
	});

	test('numFailedPasswordsSinceLastLogin increments on failed login attempts', () => {
		// Register a user
		const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
		// Simulate failed login attempts
		adminAuthLogin('test@gmail.com', 'wrongPassword');
		adminAuthLogin('test@gmail.com', 'wrongPassword');
		// Get user details
		const result = adminUserDetails(user.authUserId);
		// Check if the number of failed login attempts since last login is correct (2 failed attempts)
		expect(result.user.numFailedPasswordsSinceLastLogin).toBe(2);
	});

	test('numFailedPasswordsSinceLastLogin resets after a successful login', () => {
		// Register a user
		const user = adminAuthRegister('test@gmail.com', 'validPassword5', 'Patrick', 'Chen');
		// Simulate failed login attempts
		adminAuthLogin('test@gmail.com', 'wrongPassword');
		adminAuthLogin('test@gmail.com', 'wrongPassword');
		// Now simulate a successful login
		adminAuthLogin('test@gmail.com', 'validPassword5');
		// Get user details
		const result = adminUserDetails(user.authUserId);
		// Check if the failed attempts reset to 0 after the successful login
		expect(result.user.numFailedPasswordsSinceLastLogin).toBe(0);
	});

});
