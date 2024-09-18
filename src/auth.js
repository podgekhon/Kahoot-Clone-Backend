//Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
const adminUserDetailsUpdate = (authUserId) => {
    return { user:
        {
          userId: 1,
          name: 'Hayden Smith',
          email: 'hayden.smith@unsw.edu.au',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 1,
        }
    }
}

// Register a user with an email, password, and names, then returns their authUserId value.
const adminAuthRegister = ( email, password, nameFirst, nameLast ) => {
    return {
        authUserId: 1
    }
}
