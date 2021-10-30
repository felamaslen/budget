import { waitFor } from '@testing-library/react';
import { makeOperation, OperationContext } from 'urql';
import { delay, fromValue, pipe } from 'wonka';

import { useAppConfig } from './config';
import { configUpdatedFromApi } from '~client/actions';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import { ConfigUpdatedDocument, ConfigUpdatedSubscription, FundPeriod } from '~client/types/gql';

describe(useAppConfig.name, () => {
  const mockConfigUpdatedSubscription: ConfigUpdatedSubscription = {
    __typename: 'Subscription',
    configUpdated: {
      birthDate: '1990-10-18',
      futureMonths: 10,
      fundPeriod: FundPeriod.Year,
      fundLength: 5,
      realTimePrices: true,
    },
  };

  let subscribeSpy: jest.SpyInstance<
    ReturnType<typeof mockClient['executeSubscription']>,
    Parameters<typeof mockClient['executeSubscription']>
  >;
  beforeEach(() => {
    subscribeSpy = jest.spyOn(mockClient, 'executeSubscription').mockImplementation((request) => {
      if (request.query === ConfigUpdatedDocument) {
        return pipe(
          fromValue({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data: mockConfigUpdatedSubscription,
          }),
          delay(10),
        );
      }
      return fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });
  });

  it('should subscribe to config updates', async () => {
    expect.assertions(1);
    renderHookWithStore(useAppConfig);
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
  });

  it('should dispatch an action when the subscription receives data', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useAppConfig);

    expect(store.getActions()).toHaveLength(0);

    await waitFor(() => {
      expect(store.getActions()).toHaveLength(1);
    });

    expect(store.getActions()).toStrictEqual([
      configUpdatedFromApi(mockConfigUpdatedSubscription.configUpdated),
    ]);
  });
});
