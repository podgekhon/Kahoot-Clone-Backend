import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

// adminUserLogout
describe('POST /v1/admin/auth/logout', () => {
  let user1;
  let user1token: string;

  beforeEach(() => {
    // register a user
    user1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ericMa@unsw.edu.au',
        password: 'EricMa1234',
        nameFirst: 'Eric',
        nameLast: 'Ma'
      },
      timeout: TIMEOUT_MS
    });
    user1token = JSON.parse(user1.body.toString()).token;
  });

  test('invalid token', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: JSON.stringify('invalidToken'),
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: JSON.stringify(''),
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(401);
    expect(JSON.parse(result.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('logout and reuse token', () => {
    const result1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: user1token,
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result1.statusCode).toStrictEqual(200);

    const result2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: user1token,
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result2.statusCode).toStrictEqual(401);
    expect(JSON.parse(result2.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('valid token and success to logout', () => {
    const result = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      {
        json: {
          token: user1token,
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(result.statusCode).toStrictEqual(200);
    expect(JSON.parse(result.body.toString())).toStrictEqual({});

    // try to get details after logout
    // should fail
    const resDetails = request(
      'GET',
`${url}:${port}/v1/admin/user/details`,
{
  qs: {
    token: user1token,
  },
  timeout: 100,
}
    );
    const res = JSON.parse(resDetails.body as string);
    expect(resDetails.statusCode).toStrictEqual(401);
    expect(res).toStrictEqual({ error: expect.any(String) });
  });
});
