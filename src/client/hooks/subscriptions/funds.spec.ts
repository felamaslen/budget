import { waitFor } from '@testing-library/react';
import { getUnixTime } from 'date-fns';
import numericHash from 'string-hash';
import { makeOperation, OperationContext } from 'urql';
import { fromValue, interval, map, pipe } from 'wonka';

import { useFundsSubscriptions } from './funds';

import { allocationTargetsUpdated, cashTargetUpdated, fundPricesUpdated } from '~client/actions';
import { testState } from '~client/test-data';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import type { HistoryOptions } from '~client/types';
import {
  CashAllocationTargetUpdatedDocument,
  CashAllocationTargetUpdatedSubscription,
  FundAllocationTargetsUpdatedDocument,
  FundAllocationTargetsUpdatedSubscription,
  FundPeriod,
  FundPricesUpdatedDocument,
  FundPricesUpdatedSubscription,
} from '~client/types/gql';

describe(useFundsSubscriptions, () => {
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

  const mockAllocationTargetsUpdates: FundAllocationTargetsUpdatedSubscription = {
    __typename: 'Subscription',
    fundAllocationTargetsUpdated: {
      __typename: 'UpdatedFundAllocationTargets',
      deltas: [
        { __typename: 'TargetDeltaResponse', id: numericHash('my-fund'), allocationTarget: 0.15 },
      ],
    },
  };

  const mockCashTargetUpdate: CashAllocationTargetUpdatedSubscription = {
    __typename: 'Subscription',
    cashAllocationTargetUpdated: 1500000,
  };

  const customHistoryOptions: HistoryOptions = {
    period: FundPeriod.Ytd,
    length: 0,
  };

  const customState: Partial<typeof testState> = {
    api: {
      ...testState.api,
      appConfig: {
        ...testState.api.appConfig,
        historyOptions: customHistoryOptions,
      },
    },
  };

  let subscribeSpy: jest.SpyInstance<
    ReturnType<typeof mockClient['executeSubscription']>,
    Parameters<typeof mockClient['executeSubscription']>
  >;

  beforeEach(() => {
    subscribeSpy = jest.spyOn(mockClient, 'executeSubscription').mockImplementation((request) => {
      if (request.query === FundPricesUpdatedDocument) {
        return pipe(
          interval(50),
          map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data: mockFundPriceUpdates,
          })),
        );
      }
      if (request.query === FundAllocationTargetsUpdatedDocument) {
        return pipe(
          interval(30),
          map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data: mockAllocationTargetsUpdates,
          })),
        );
      }
      if (request.query === CashAllocationTargetUpdatedDocument) {
        return pipe(
          interval(10),
          map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data: mockCashTargetUpdate,
          })),
        );
      }
      return fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });
  });

  it('should subscribe to fund price updates', async () => {
    expect.hasAssertions();

    const { store } = renderHookWithStore(useFundsSubscriptions, {
      customState,
    });

    await waitFor(() => {
      expect(store.getActions()).toStrictEqual(
        expect.arrayContaining([
          fundPricesUpdated(
            mockFundPriceUpdates.fundPricesUpdated as NonNullable<
              FundPricesUpdatedSubscription['fundPricesUpdated']
            >,
          ),
        ]),
      );
    });

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: FundPricesUpdatedDocument,
        variables: customHistoryOptions,
      }),
      undefined,
    );
  });

  it('should subscribe to fund allocation target updates', async () => {
    expect.hasAssertions();

    const { store } = renderHookWithStore(useFundsSubscriptions, {
      customState,
    });

    await waitFor(() => {
      expect(store.getActions()).toStrictEqual(
        expect.arrayContaining([
          allocationTargetsUpdated([{ id: numericHash('my-fund'), allocationTarget: 0.15 }]),
        ]),
      );
    });

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: FundAllocationTargetsUpdatedDocument,
        variables: {},
      }),
      undefined,
    );
  });

  it('should subscribe to fund cash target updates', async () => {
    expect.hasAssertions();

    const { store } = renderHookWithStore(useFundsSubscriptions, {
      customState,
    });

    await waitFor(() => {
      expect(store.getActions()).toStrictEqual(
        expect.arrayContaining([cashTargetUpdated(1500000)]),
      );
    });

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: CashAllocationTargetUpdatedDocument,
        variables: {},
      }),
      undefined,
    );
  });
});
