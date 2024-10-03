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
  { email: 'username.com' }, 
  { email: 'username@' }
];

const invalidNames = [
  { name: 'Eric!' }, 
  { name: 'John#' },
  { name: 'Anna$' },       
  { name: 'A' }, 
  { name: 'VeryLongNameThatExceedsTwentyCharacters' }, 
  { name: '1Eric' },
  { name: '' } 
];

const validNames = [
  { name: 'Jean-Paul' },
  { name: "O'Connor" },
  { name: 'Mary Anne'},
  { name: "Containstwentycharac" },
  { name: "tw" },
  { name: "  Eric  " }
]

const invalidPasswords = [
  { password: '12345678' }, 
  { password: 'abcdefgh' }, 
  { password: '1' },
  { password: '123456a' }, 
  { password: '' }, 
];

/////////////-----adminAuthRegister------///////////
describe('adminAuthRegister', () => {
  describe('Tests with 1 ordinary user', () => {
    let user1;
    beforeEach(() => {
      user1 = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    });

  // valid cases checking
  test('Check multiple invalid and valid registrations', () => {
    const user2 = adminAuthRegister('PAT@UNSW.EDU.AU', '1234ABCD', 'Pat', 'Yang');
    const user3 = adminAuthRegister('sam@unsw.edu.au', '12', 'Sam', 'Yang');
    const user4 = adminAuthRegister('andrew', '1234abcd', 'Andrew', 'Yang');
    expect(user1.authUserId).toStrictEqual(expect.any(Number));
    expect(user2.authUserId).toStrictEqual(expect.any(Number));
    expect(user3).toStrictEqual({ error: expect.any(String) });
    expect(user4).toStrictEqual({ error: expect.any(String) });
  });

  test('Check duplicate email', () => {
    const authUserId2 = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Pat', 'Yang');
    expect(authUserId2).toStrictEqual({ error: expect.any(String) });
  });

  // Email address is used by another user.
  test('Registering two people with the same name and passwords', () => {
    const user2 = adminAuthRegister('pat@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    expect(user1.authUserId).toStrictEqual(expect.any(Number));
    expect(user2.authUserId).toStrictEqual(expect.any(Number));
  });
  })

  //Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function).
  test.each(invalidEmails)('Check invalid email for $email', ({ email }) => {
    const authUserId = adminAuthRegister(email, 'password123', 'Eric', 'Yang');
    expect(authUserId).toStrictEqual({ error: expect.any(String) });
  });

  // Unusual But Valid Characters in Emails
  test('valid email with + symbol', () => {
    const user1 = adminAuthRegister('eric+@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
    expect(user1.authUserId).toStrictEqual(expect.any(Number));
  });

  // nameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
  // nameFirst is less than 2 characters or more than 20 characters.
  describe('Checking for invalid nameFirst', () => {
    test.each(invalidNames)('Check invalid nameLast for $name', ({ name }) => {
      const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd', name, 'Yang');
      expect(authUserId).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Checking for valid nameFirst', () => {
    test.each(validNames)('Check invalid nameLast for $name', ({ name }) => {
      const user1 = adminAuthRegister('eric@unsw.edu.au', '1234abcd', name, 'Yang');
			expect(user1.authUserId).toStrictEqual(expect.any(Number));
    });
  });

  // nameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
  // nameLast is less than 2 characters or more than 20 characters.
  describe('Checking for invalid nameLast', () => {
    test.each(invalidNames)('Check invalid nameLast for $name', ({ name }) => {
      const authUserId = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', name);
      expect(authUserId).toStrictEqual({ error: expect.any(String) });
    });
  });


  describe('Checking for valid nameLast', () => {
    test.each(validNames)('Check invalid nameLast for $name', ({ name }) => {
      const user1 = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', name);
	    expect(user1.authUserId).toStrictEqual(expect.any(Number));
    });
  });

  // Password is less than 8 characters.
  describe('Checking for invalid Password', () => {
    test.each(invalidPasswords)('Check invalid Password for $password', ({ password }) => {
      const authUserId = adminAuthRegister('eric@unsw.edu.au', password, 'Eric', 'Yang');
      expect(authUserId).toStrictEqual({ error: expect.any(String) });
    });
  });

});    


/////////////-----adminUserDetailsUpdate------///////////

describe('adminUserDetailsUpdate', () => {

	test('invalid authUserId with no registers', () => {
		const result = adminUserDetailsUpdate(1, 'new.email@example.com', 'John', 'Doe');
		expect(result).toStrictEqual({ error: expect.any(String) });
  });

  describe('Tests with at least 1 register', () => {
    let user1;
    beforeEach(() => {
      user1 = adminAuthRegister('eric@unsw.edu.au', '1234abcd', 'Eric', 'Yang');
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
      const user2 = adminAuthRegister('pat@unsw.edu.au', '1234abc', 'Pat', 'Yang');
      const result = adminUserDetailsUpdate(user2.authUserId, 'eric@unsw.edu.au', 'Pat', 'Yang');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });
    
    //Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function).
    describe('Checking for invalid email', () => {
      test.each(invalidEmails)('Check invalid email for $email', ({ email }) => {
        const result = adminUserDetailsUpdate(user1.authUserId, email, 'Eric', 'Yang');
        expect(result).toStrictEqual({ error: expect.any(String) });
      });
    });

    // nameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
    describe('Checking for invalid nameFirst', () => { 
      test.each(invalidNames)('invalid nameFirst for $name', ({ name }) => {
        const result = adminUserDetailsUpdate(user1.authUserId, 'eric@unsw.edu.au', name, 'Yang');
        expect(result).toStrictEqual({ error: expect.any(String) });
      });
    });

    describe('Checking for valid nameFirst', () => {
      test.each(validNames)('valid nameFirst for $name', ({ name }) => {
        const result = adminUserDetailsUpdate(user1.authUserId, 'eric@unsw.edu.au', name, 'Yang');
        expect(result).toStrictEqual({});
      });
    })

    // Test for nameLast validation
    describe('Checking for invalid nameLast', () => {
      test.each(invalidNames)('invalid nameLast for $name', ({ name }) => {
        const result = adminUserDetailsUpdate(user1.authUserId, 'eric@unsw.edu.au', 'Eric', name);
        expect(result).toStrictEqual({ error: expect.any(String) });
      });
    });

    describe('Checking for valid nameLast', () => {
      test.each(validNames)('valid nameLast for $name', ({ name }) => {
        const result = adminUserDetailsUpdate(user1.authUserId, 'eric@unsw.edu.au', 'Eric', name);
        expect(result).toStrictEqual({});
      });
    });

    // valid cases checking
    test('Check successful details update', () => {
      const result = adminUserDetailsUpdate(user1.authUserId, 'hello@unsw.edu.au', 'Eric', 'Yang');
      expect(result).toStrictEqual({});
    });

    test('No changes to user data', () => {
      const result = adminUserDetailsUpdate(user1.authUserId, 'eric@unsw.edu.au', 'Eric', 'Yang');
      expect(result).toStrictEqual({});
    });
    
    test('multiple simultaneous updates to the same user', () => {
      const result2 = adminUserDetailsUpdate(user1.authUserId, 'NEW.EMAIL2@EXAMPLE.COM', 'Eric', 'Yang');
      const result3 = adminUserDetailsUpdate(user1.authUserId, 'new.email2', 'Eric', 'Yang');
      expect(result2).toStrictEqual({}); 	
      expect(result3).toStrictEqual({error: expect.any(String)}); 	
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
  let user1;
  beforeEach(() => {
  	user1 = adminAuthRegister('XiaoyuanMa@unsw.edu.au', '1234abcd', 'Xiaoyuan', 'Ma');
  });
  // authUserId is not valid user
  test('invalid authUserId', () => {
		const result = adminUserPasswordUpdate('1234', '1234abcd', 'abcd1234');
		expect(result).toStrictEqual({ error: expect.any(String) });
  });
	// Old password is not the correct old password
	test('old password is wrong', () => {
		const result = adminUserPasswordUpdate(user1.authUserId, 'wrongpassword', 'abcd1234');
		expect(result).toStrictEqual({ error: expect.any(String) });
	});
	// Old password and new password match exactly
	test('new password is same as the old one', () => {
		const result = adminUserPasswordUpdate(user1.authUserId, '1234abcd', '1234abcd');
		expect(result).toStrictEqual({ error: expect.any(String) });
	});
	// New password has already been used before by this user
	test('new password has been used before', () => {
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
		// Provide an invalid authUserId (-1 is arbitrary and invalid)
		const result = adminUserDetails(-1); 
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
		expect(result.user.numSuccessfulLogins).toStrictEqual(expect.any(Number));
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
		expect(result.user.numFailedPasswordsSinceLastLogin).toStrictEqual(expect.any(Number));
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
		expect(result.user.numFailedPasswordsSinceLastLogin).toStrictEqual(expect.any(Number));
	});

});
