import { RenderHookResult } from '@testing-library/react-hooks';
import { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';
import { makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import * as prices from './prices';

import { todayPricesFetched } from '~client/actions';
import { StockPrices } from '~client/gql/queries/funds';
import { ApiContext } from '~client/hooks';
import { testState } from '~client/test-data';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import { StockPricesQuery } from '~client/types/gql';
import { PageNonStandard } from '~shared/constants';

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

describe(prices.useTodayPrices.name, () => {
  const mockStockPrices: StockPricesQuery = {
    __typename: 'Query',
    stockPrices: {
      __typename: 'StockPricesResponse',
      prices: [
        {
          __typename: 'StockPrice',
          code: 'SMT.L',
          price: 1491.24,
        },
        {
          __typename: 'StockPrice',
          code: 'CTY.L',
          price: 390.89,
        },
      ],
      refreshTime: '2018-03-23T19:11:10Z',
    },
  };

  let postMessageSpy: jest.SpyInstance;
  let querySpy: jest.SpyInstance;

  beforeEach(() => {
    postMessageSpy = jest.spyOn(prices.worker, 'postMessage');

    querySpy = jest.spyOn(mockClient, 'executeQuery').mockImplementation((request) => {
      if (request.query === StockPrices) {
        return fromValue({
          operation: makeOperation('query', request, {} as OperationContext),
          data: mockStockPrices,
        });
      }
      return fromValue({
        operation: makeOperation('query', request, {} as OperationContext),
        data: null,
      });
    });
  });

  const Wrapper: React.FC = ({ children }) => (
    <ApiContext.Provider value="my-api-key">{children}</ApiContext.Provider>
  );

  const renderHookTest = (): RenderHookResult<Record<string, unknown>, void> & {
    store: MockStore<typeof testState>;
  } =>
    renderHookWithStore(prices.useTodayPrices, {
      renderHookOptions: { wrapper: Wrapper },
      customState: {
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('fund-smt'),
              item: 'Scottish Mortgage Investment Trust (SMT.L) (stock)',
              transactions: [],
              stockSplits: [],
            },
            {
              id: numericHash('fund-cty'),
              item: 'City of London Investment Trust (CTY.L) (stock)',
              transactions: [],
              stockSplits: [],
            },
            {
              id: numericHash('fund-irrelevant'),
              item: 'Irrelevant fund (accum.)',
              transactions: [],
              stockSplits: [],
            },
          ],
          todayPriceFetchTime: new Date('2018-03-23T16:39:11Z'),
        },
      },
    });

  it('should tell the worker to start and stop', () => {
    expect.assertions(4);
    const { unmount } = renderHookTest();
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    expect(postMessageSpy).toHaveBeenCalledWith({
      type: 'start',
      payload: { apiKey: 'my-api-key', codes: expect.arrayContaining(['SMT.L', 'CTY.L']) },
    });

    unmount();

    expect(postMessageSpy).toHaveBeenCalledTimes(2);
    expect(postMessageSpy).toHaveBeenNthCalledWith(2, { type: 'stop' });
  });

  it('should fetch prices and dispatch an action when they arrive', () => {
    expect.assertions(2);
    jest.useFakeTimers();
    const { store } = renderHookTest();

    jest.runAllTimers();
    expect(querySpy).toHaveBeenCalledWith(
      {
        key: expect.any(Number),
        query: StockPrices,
        variables: {
          codes: expect.arrayContaining(['SMT.L', 'CTY.L']),
        },
      },
      { requestPolicy: 'network-only' },
    );

    expect(store.getActions()).toStrictEqual([
      todayPricesFetched(
        { [numericHash('fund-smt')]: 1491.24, [numericHash('fund-cty')]: 390.89 },
        '2018-03-23T19:11:10Z',
      ),
    ]);

    jest.useRealTimers();
  });
});
