import '@testing-library/jest-dom';
import jestFetchMock from 'jest-fetch-mock';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import nock from 'nock';

beforeAll(() => {
  expect.extend({ toMatchImageSnapshot });

  jestFetchMock.enableMocks();
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(() => {
  nock.enableNetConnect();
  jestFetchMock.disableMocks();
});

afterEach(() => {
  jest.useRealTimers();
});
