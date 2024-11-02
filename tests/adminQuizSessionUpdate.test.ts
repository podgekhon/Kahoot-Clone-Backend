import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import {
} from '../src/requestHelperFunctions';
import {
} from '../src/interface';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});
