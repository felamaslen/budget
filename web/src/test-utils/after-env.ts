import '@testing-library/jest-dom';
import nock from 'nock';
import 'jest-styled-components';

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');

  window.birthDate = new Date('1990-01-01');
});

afterAll(() => {
  nock.enableNetConnect();
});
