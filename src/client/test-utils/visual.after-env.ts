import jestFetchMock from 'jest-fetch-mock';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { setDefaultOptions } from 'jsdom-screenshot';
import nock from 'nock';

beforeAll(() => {
  expect.extend({ toMatchImageSnapshot });

  setDefaultOptions({
    launch: {
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
  });

  jestFetchMock.enableMocks();
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(() => {
  nock.enableNetConnect();
  jestFetchMock.disableMocks();
});
