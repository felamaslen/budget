import { act } from '@testing-library/react';
import numericHash from 'string-hash';
import { makeOperation, OperationContext } from 'urql';
import { fromValue, interval, map, pipe } from 'wonka';

import * as stubs from './__tests__/stubs';
import { useNetWorthSubscriptions } from './net-worth';

import {
  netWorthCategoryCreated,
  netWorthCategoryDeleted,
  netWorthCategoryUpdated,
  netWorthEntryCreated,
  netWorthEntryDeleted,
  netWorthEntryUpdated,
  netWorthSubcategoryCreated,
  netWorthSubcategoryDeleted,
  netWorthSubcategoryUpdated,
} from '~client/actions';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import * as types from '~client/types/gql';

describe(useNetWorthSubscriptions.name, () => {
  let subscribeSpy: jest.SpyInstance;

  beforeEach(() => {
    subscribeSpy = jest.spyOn(mockClient, 'executeSubscription').mockImplementation((request) => {
      switch (request.query) {
        case types.NetWorthCategoryCreatedDocument: {
          return pipe(
            interval(2),
            map(() => ({
              operation: makeOperation('subscription', request, {} as OperationContext),
              data: stubs.mockNetWorthCategoryCreated,
            })),
          );
        }
        case types.NetWorthCategoryUpdatedDocument: {
          return pipe(
            interval(2),
            map(() => ({
              operation: makeOperation('subscription', request, {} as OperationContext),
              data: stubs.mockNetWorthCategoryUpdated,
            })),
          );
        }
        case types.NetWorthCategoryDeletedDocument: {
          return pipe(
            interval(2),
            map(() => ({
              operation: makeOperation('subscription', request, {} as OperationContext),
              data: stubs.mockNetWorthCategoryDeleted,
            })),
          );
        }
        case types.NetWorthSubcategoryCreatedDocument: {
          return pipe(
            interval(2),
            map(() => ({
              operation: makeOperation('subscription', request, {} as OperationContext),
              data: stubs.mockNetWorthSubcategoryCreated,
            })),
          );
        }
        case types.NetWorthSubcategoryUpdatedDocument: {
          return pipe(
            interval(2),
            map(() => ({
              operation: makeOperation('subscription', request, {} as OperationContext),
              data: stubs.mockNetWorthSubcategoryUpdated,
            })),
          );
        }
        case types.NetWorthSubcategoryDeletedDocument: {
          return pipe(
            interval(2),
            map(() => ({
              operation: makeOperation('subscription', request, {} as OperationContext),
              data: stubs.mockNetWorthSubcategoryDeleted,
            })),
          );
        }
        case types.NetWorthEntryCreatedDocument: {
          return pipe(
            interval(2),
            map(() => ({
              operation: makeOperation('subscription', request, {} as OperationContext),
              data: stubs.mockNetWorthEntryCreated,
            })),
          );
        }
        case types.NetWorthEntryUpdatedDocument: {
          return pipe(
            interval(2),
            map(() => ({
              operation: makeOperation('subscription', request, {} as OperationContext),
              data: stubs.mockNetWorthEntryUpdated,
            })),
          );
        }
        case types.NetWorthEntryDeletedDocument: {
          return pipe(
            interval(2),
            map(() => ({
              operation: makeOperation('subscription', request, {} as OperationContext),
              data: stubs.mockNetWorthEntryDeleted,
            })),
          );
        }
        default: {
          return fromValue({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data: null,
          });
        }
      }
    });

    jest.useFakeTimers();
  });

  it('should subscribe to category creates', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useNetWorthSubscriptions);
    act(() => {
      jest.advanceTimersByTime(3);
    });
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        netWorthCategoryCreated({
          id: numericHash('cash-category'),
          category: 'Cash',
          type: types.NetWorthCategoryType.Asset,
          isOption: false,
          color: 'darkgreen',
        }),
      ]),
    );

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: types.NetWorthCategoryCreatedDocument,
        variables: {},
      }),
      undefined,
    );
  });

  it('should subscribe to category updates', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useNetWorthSubscriptions);
    act(() => {
      jest.advanceTimersByTime(3);
    });
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        netWorthCategoryUpdated({
          id: numericHash('cash-category'),
          category: 'Cash (updated)',
          type: types.NetWorthCategoryType.Asset,
          isOption: false,
          color: 'turquoise',
        }),
      ]),
    );

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: types.NetWorthCategoryUpdatedDocument,
        variables: {},
      }),
      undefined,
    );
  });

  it('should subscribe to category deletes', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useNetWorthSubscriptions);
    act(() => {
      jest.advanceTimersByTime(3);
    });
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([netWorthCategoryDeleted(numericHash('cash-category'))]),
    );

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: types.NetWorthCategoryDeletedDocument,
        variables: {},
      }),
      undefined,
    );
  });

  it('should subscribe to subcategory creates', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useNetWorthSubscriptions);
    act(() => {
      jest.advanceTimersByTime(3);
    });
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        netWorthSubcategoryCreated({
          id: numericHash('bank-subcategory'),
          categoryId: numericHash('cash-category'),
          subcategory: 'My bank',
          opacity: 0.38,
        }),
      ]),
    );

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: types.NetWorthCategoryCreatedDocument,
        variables: {},
      }),
      undefined,
    );
  });

  it('should subscribe to subcategory updates', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useNetWorthSubscriptions);
    act(() => {
      jest.advanceTimersByTime(3);
    });
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        netWorthSubcategoryUpdated({
          id: numericHash('bank-subcategory'),
          categoryId: numericHash('cash-category'),
          subcategory: 'Other bank',
          opacity: 0.92,
        }),
      ]),
    );

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: types.NetWorthSubcategoryUpdatedDocument,
        variables: {},
      }),
      undefined,
    );
  });

  it('should subscribe to subcategory deletes', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useNetWorthSubscriptions);
    act(() => {
      jest.advanceTimersByTime(3);
    });
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([netWorthSubcategoryDeleted(numericHash('bank-subcategory'))]),
    );

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: types.NetWorthSubcategoryDeletedDocument,
        variables: {},
      }),
      undefined,
    );
  });

  it('should subscribe to entry creates', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useNetWorthSubscriptions);
    act(() => {
      jest.advanceTimersByTime(3);
    });
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        netWorthEntryCreated({
          id: numericHash('my-entry'),
          date: '2020-04-20',
          values: [],
          creditLimit: [],
          currencies: [],
        }),
      ]),
    );

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: types.NetWorthEntryCreatedDocument,
        variables: {},
      }),
      undefined,
    );
  });

  it('should subscribe to entry updates', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useNetWorthSubscriptions);
    act(() => {
      jest.advanceTimersByTime(3);
    });
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        netWorthEntryUpdated({
          id: numericHash('my-entry'),
          date: '2020-04-21',
          values: [],
          creditLimit: [],
          currencies: [],
        }),
      ]),
    );

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: types.NetWorthSubcategoryUpdatedDocument,
        variables: {},
      }),
      undefined,
    );
  });

  it('should subscribe to entry deletes', async () => {
    expect.hasAssertions();
    const { store } = renderHookWithStore(useNetWorthSubscriptions);
    act(() => {
      jest.advanceTimersByTime(3);
    });
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([netWorthEntryDeleted(numericHash('my-entry'))]),
    );

    expect(subscribeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: types.NetWorthEntryDeletedDocument,
        variables: {},
      }),
      undefined,
    );
  });
});
