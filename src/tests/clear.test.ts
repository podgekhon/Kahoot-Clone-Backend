import { clearHttp } from '../helperfunctiontests';

beforeEach(() => {
  clearHttp();
});

describe('clear test', () => {
  test('test clear successful', () => {
    const result = clearHttp();
    expect(result.body).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(200);
  });
});
