import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import {
  requestAdminAuthRegister,
} from '../src/requestHelperFunctions';
import {
  userAuthRegister,
  tokenReturn,
} from '../src/interface';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Test for adminQuizSessionUpdate', () => {
  let user1Response: userAuthRegister;
  let user1Token: string;

  beforeEach(() => {
    user1Response = requestAdminAuthRegister(
      'user1@gmail.com',
      'validPassword1',
      'User',
      'One'
    );

    user1Token = (user1Response.body as tokenReturn).token;
    expect(user1Response.statusCode).toStrictEqual(200);
  });
});
