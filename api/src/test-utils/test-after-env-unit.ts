import nock from 'nock';

beforeAll(async () => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(async () => {
  nock.enableNetConnect();
});
