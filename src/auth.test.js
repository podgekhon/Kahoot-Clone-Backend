import { 
    adminAuthRegister, 
    adminAuthLogin, 
    adminUserDetails, 
    adminUserDetailsUpdate,
    adminUserPasswordUpdate 
} from './auth.js';

import { clear } from './other.js';

beforeEach(() => {
  // Reset the state of our data so that each tests can run independently
  clear();
});

const invalidEmails = [
  'username@', 
  'username.com', 
  'user@domain..com', 
  'user$name@domain.com', 
  'user~domain@domain.com', 
];

const invalidNames = [
  'Eric!', 
  'John#',
  'Anna$',       
  'A', 
  'VeryLongNameThatExceedsTwentyCharacters', 
  '1Eric',
  '' 
];

const validNames = [
  'Jean-Paul',
  "O'Connor",
  'Mary Anne',
  "Containstwentycharac",
  "tw",
  "  Eric  "
]

const invalidPasswords = [
  'abcdefgh', 
  '12345678', 
  '1',
  '123456a', 
  '', 
];

/////////////-----adminAuthRegister------///////////
describe('adminAuthRegister', () => {
  describe('Tests with 1 ordinary user', () => {
    beforeEach(() => {
      const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    });
    // Email address is used by another user.
    test('Check duplicate email', () => {
      const authUserId2 = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Pat', 'Yang');
      expect(authUserId2).toStrictEqual({ error: expect.any(String) });
    });
    // valid cases checking
  test('Check multiple invalid and valid registrations', () => {
    const user1 = adminAuthRegister('eric@unsw.edu.au', '1234abc', 'Eric', 'Yang');
    const user2 = adminAuthRegister('ERIC@UNSW.EDU.AU', '1234ABCD', 'Pat', 'T');
    const user3 = adminAuthRegister('sam@unsw.edu.au', '12', 'Sam', 'T');
    const user4 = adminAuthRegister('andrew', '1234abcd', 'Andrew', 'T');
    expect(user1).toStrictEqual(expect.any(Integer));
    expect(user2).toStrictEqual(expect.any(Integer));
    expect(user3).toStrictEqual({ error: expect.any(String) });
    expect(user4).toStrictEqual({ error: expect.any(String) });
  });
  test('Registering two people with the same name and passwords', () => {
    const user1 = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    const user2 = adminAuthRegister('pat@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    expect(user1).toStrictEqual(expect.any(Integer));
    expect(user2).toStrictEqual(expect.any(Integer));
  });
  })

  //Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function).
  test('Check invalid email', () => {
    invalidEmails.forEach((email) => {
      const authUserId = adminAuthRegister(email, 'password123', 'Eric', 'Yang');
      expect(authUserId).toStrictEqual({ error: expect.any(String) });
    });
  });

  // Unusual But Valid Characters in Emails
  test('valid email with + symbol', () => {
    const authUserId = adminAuthRegister('eric+@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    expect(authUserId).toStrictEqual(expect.any(Integer));
  });

  // NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
  // NameFirst is less than 2 characters or more than 20 characters.
  test('invalid NameFirst with special characters', () => {
    invalidNames.forEach((name) => {
      const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd', name, 'Yang');
      expect(authUserId).toStrictEqual({ error: expect.any(String) });
    });
  });

  test('valid NameFirst', () => {
		validNames.forEach((name) => {
			const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd', name, 'Yang');
			expect(authUserId).toStrictEqual(expect.any(Integer));
		})
  });

  // NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
  // NameLast is less than 2 characters or more than 20 characters.
  test('invalid NameLast', () => {
    invalidNames.forEach((name) => {
      const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', name);
      expect(authUserId).toStrictEqual({ error: expect.any(String) });
    });
  });

  test('valid NameLast', () => {
		validNames.forEach((name) => {
			const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', name);
			expect(authUserId).toStrictEqual(expect.any(Integer));
		})
  });

  // Password is less than 8 characters.
  // Password does not contain at least one number and at least one letter.
  test('invalid Password', () => {
    invalidPasswords.forEach((password) => {
      const authUserId = adminAuthRegister('eric@unsw.edu.au', password, 'Eric', 'Yang');
      expect(authUserId).toStrictEqual({ error: expect.any(String) });
    });
  });
});    



/////////////-----adminUserDetailsUpdate------///////////

describe('adminUserDetailsUpdate', () => {
	// Test for invalid authUserId
	test('invalid authUserId with no registers', () => {
		const result = adminUserDetailsUpdate(1, 'new.email@example.com', 'John', 'Doe');
		expect(result).toStrictEqual({ error: expect.any(String) });
  });

  describe('Tests with at least 1 register', () => {
    beforeEach(() => {
      const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    });

    test('authUserId does not exist', () => {
      const result = adminUserDetailsUpdate(2, 'new.email@example.com', 'John', 'Doe');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('authUserId is negative', () => {
      const result = adminUserDetailsUpdate(-1, 'eric@unsw.edu.au', 'Eric', 'Yang');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    // Email address is used by another user.
    test('Check duplicate email', () => {
      const authUserId2 = adminAuthRegister('pat@unsw.edu.au', '1234abc', 'Pat', 'Yang');
      const result = adminUserDetailsUpdate(authUserId2, 'eric@unsw.edu.au', 'Pat', 'Yang');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });
    
    //Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function).
    test('Check invalid email', () => {
      invalidEmails.forEach((email) => {
        const result = adminUserDetailsUpdate(authUserId, email, 'Eric', 'Yang');
        expect(result).toStrictEqual({ error: expect.any(String) });
      });
    });

    // NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
    test('invalid NameFirst with special characters', () => {
      // Test cases with invalid characters in NameFirst
      invalidNames.forEach((name) => {
        const result = adminUserDetailsUpdate(authUserId, 'eric@unsw.edu.au', name, 'Yang');
        expect(result).toStrictEqual({ error: expect.any(String) });
      });
    });
    test('valid NameFirst', () => {
      validNames.forEach((name) => {
        const result = adminUserDetailsUpdate(authUserId, 'eric@unsw.edu.au', name, 'Yang');
        expect(result).toStrictEqual({});
      })
    });
    // Test for NameLast validation
    test('invalid NameLast', () => {
      invalidNames.forEach((name) => {
        const result = adminUserDetailsUpdate(authUserId, 'eric@unsw.edu.au', 'Eric', name);
        expect(result).toStrictEqual({ error: expect.any(String) });
      });
    });
  
    test('valid NameLast', () => {
      validNames.forEach((name) => {
        const result = adminUserDetailsUpdate(authUserId, 'eric@unsw.edu.au', 'Eric', name);
        expect(result).toStrictEqual({});
      })
    });

    // valid cases checking
    test('Check successful details update', () => {
      const result = adminUserDetailsUpdate(authUserId, 'hello@unsw.edu.au', 'Eric', 'Yang');
      expect(result).toStrictEqual({});
    });

    test('No changes to user data', () => {
      const result = adminUserDetailsUpdate(authUserId, 'eric@unsw.edu.au', 'Eric', 'Yang');
      expect(result).toStrictEqual({});
    });
    
    test('multiple simultaneous updates to the same user', () => {
      const result2 = adminUserDetailsUpdate(authUserId, 'NEW.EMAIL2@EXAMPLE.COM', 'Eric', 'Yang');
      const result3 = adminUserDetailsUpdate(authUserId, 'new.email2', 'Eric', 'Yang');
      expect(result2).toStrictEqual({}); 	
      expect(result2).toStrictEqual({error: expect.any(String)}); 	
    });
  });
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
	// test for invalid passwords(too short, no characters/numbers)
	test('invalid new passwords', () => {
		invalidPasswords.forEach((password) => {
			const result = adminUserPasswordUpdate(user1.authUserId, '1234abcd', password);
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
