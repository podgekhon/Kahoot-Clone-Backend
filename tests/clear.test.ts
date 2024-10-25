import { 
  requestClear, 
  requestAdminAuthLogin, 
  requestAdminAuthRegister, 
  requestAdminQuizList, 
  requestAdminUserDetails 
} from '../src/requestHelperFunctions';
import { httpStatus } from './adminAuthRegister.test';
import { tokenReturn } from '../src/interface';
beforeEach(() => {
  requestClear();
});

describe('clear test', () => {
  test('test clear successful', () => {
    // register a user
    const user = requestAdminAuthRegister('ericma@unsw.edu.au', 'eric1234', 'Eric', 'Ma');
    const userId = (user.body as tokenReturn).token;
    // clear
    const result = requestClear();
    expect(result.body).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    // try to login with previous registered email
    const loginRes = requestAdminAuthLogin('ericma@unsw.edu.au', 'eric1234');
    expect(loginRes.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);

    // try to get quiz list
    const quizListRes = requestAdminQuizList(userId);
    expect(quizListRes.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);

    // try to get user detail list
    const userDetailRes = requestAdminUserDetails(userId);
    expect(userDetailRes.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
  });
  
});
