import nock from 'nock';

// eslint-disable-next-line global-require
jest.mock('ioredis', () => require('ioredis-mock/jest'));

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(() => {
  nock.enableNetConnect();
});
