import '@testing-library/jest-dom';
import jestFetchMock from 'jest-fetch-mock';
import nock from 'nock';
import React from 'react';

global.React = React;

jest.mock('worker-loader!../../../workers/prices', () => {
  class MyMockWorker {
    onmessage: (_: unknown) => void = () => {
      /* pass */
    };

    postMessage(data: { type: 'start' | 'stop' }): void {
      // eslint-disable-line
      if (data.type === 'start') {
        setTimeout(() => {
          this.onmessage('Fetch!');
        }, 5);
      }
    }
  }
  return MyMockWorker;
});

beforeAll(() => {
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
