import { waitFor } from '@testing-library/react';
import { makeOperation, OperationContext } from 'urql';
import { delay, fromValue, pipe } from 'wonka';

import { useAppConfig } from './config';
import { configUpdatedFromApi } from '~client/actions';
import { testState } from '~client/test-data';
import { hookRendererWithStore, mockClient, renderHookWithStore } from '~client/test-utils';
import {
  ConfigUpdatedDocument,
  ConfigUpdatedSubscription,
  FundMode,
  FundPeriod,
  SetConfigDocument,
  SetConfigMutation,
} from '~client/types/gql';

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

  const mockSetConfigMutation: SetConfigMutation = {
    __typename: 'Mutation',
    setConfig: {},
  };

  let subscribeSpy: jest.SpyInstance<
    ReturnType<typeof mockClient['executeSubscription']>,
    Parameters<typeof mockClient['executeSubscription']>
  >;

  let mutateSpy: jest.SpyInstance<
    ReturnType<typeof mockClient['executeMutation']>,
    Parameters<typeof mockClient['executeMutation']>
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

    mutateSpy = jest.spyOn(mockClient, 'executeMutation').mockImplementation((request) => {
      if (request.query === SetConfigDocument) {
        return fromValue({
          operation: makeOperation('mutation', request, {} as OperationContext),
          data: mockSetConfigMutation,
        });
      }
      return fromValue({
        operation: makeOperation('mutation', request, {} as OperationContext),
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

  it('should call a mutation to update the config when it changes locally', async () => {
    expect.hasAssertions();
    const { render } = hookRendererWithStore(useAppConfig);

    render();
    render({
      api: {
        ...testState.api,
        appConfig: {
          ...testState.api.appConfig,
          birthDate: '1992-02-10',
          fundMode: FundMode.Value,
        },
        appConfigSerial: 20,
      },
    });

    expect(mutateSpy).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalledTimes(1);
    });

    expect(mutateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: SetConfigDocument,
        variables: {
          config: expect.objectContaining({
            birthDate: '1992-02-10',
            fundMode: FundMode.Value,
          }),
        },
      }),
      {},
    );
  });
});
