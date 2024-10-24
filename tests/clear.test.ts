import { requestClear } from '../src/helperfunctiontests';

beforeEach(() => {
  requestClear();
});

describe('clear test', () => {
  test('test clear successful', () => {
    const result = requestClear();
    expect(result.body).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(200);
  });
});
