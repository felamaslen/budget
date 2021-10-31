import { waitFor } from '@testing-library/react';
import { getUnixTime } from 'date-fns';
import numericHash from 'string-hash';
import { makeOperation, OperationContext } from 'urql';
import { fromValue, interval, map, pipe } from 'wonka';

import { useFundsSubscriptions } from './funds';

import { fundPricesUpdated } from '~client/actions';
import { testState } from '~client/test-data';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import {
  FundPeriod,
  FundPricesUpdatedDocument,
  FundPricesUpdatedSubscription,
} from '~client/types/gql';

describe(useFundsSubscriptions, () => {
  let subscribeSpy: jest.SpyInstance<
    ReturnType<typeof mockClient['executeSubscription']>,
    Parameters<typeof mockClient['executeSubscription']>
  >;
  beforeEach(() => {
    subscribeSpy = jest.spyOn(mockClient, 'executeSubscription');
  });

  const mockFundPriceUpdates: FundPricesUpdatedSubscription = {
    __typename: 'Subscription',
    fundPricesUpdated: {
      __typename: 'FundHistory',
      annualisedFundReturns: 0.2413,
      startTime: getUnixTime(new Date('2020-04-20')),
      cacheTimes: [86400 * 1, 86400 * 3, 86400 * 4],
      overviewCost: [155692, 3419923, 3592351],
      prices: [
        {
          __typename: 'FundPrices',
          fundId: numericHash('my-fund'),
          groups: [{ __typename: 'FundPriceGroup', startIndex: 1, values: [464.39, 475.22] }],
        },
      ],
    },
  };

  it('should subscribe to fund price updates', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === FundPricesUpdatedDocument) {
        return pipe(
          interval(50),
          map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data: mockFundPriceUpdates,
          })),
        );
      }
      return fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useFundsSubscriptions, {
      customState: {
        api: {
          ...testState.api,
          appConfig: {
            ...testState.api.appConfig,
            historyOptions: {
              period: FundPeriod.Ytd,
              length: 0,
            },
          },
        },
      },
    });

    await waitFor(() => {
      expect(store.getActions()).not.toHaveLength(0);
    });

    expect(store.getActions()).toStrictEqual([
      fundPricesUpdated(
        mockFundPriceUpdates.fundPricesUpdated as NonNullable<
          FundPricesUpdatedSubscription['fundPricesUpdated']
        >,
      ),
    ]);
  });
});
