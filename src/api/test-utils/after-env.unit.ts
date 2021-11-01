import nock from 'nock';

const Redis = require('ioredis-mock/jest'); // eslint-disable-line

jest.mock('ioredis', () => Redis);

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(() => {
  nock.enableNetConnect();
});
