import nock from 'nock';

jest.mock('ioredis', () => require('ioredis-mock/jest')); // eslint-disable-line global-require

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(() => {
  nock.enableNetConnect();
});
