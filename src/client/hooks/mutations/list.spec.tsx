import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';
import { fromValue } from 'wonka';

import { useListCrudStandard, useListCrudFunds } from './list';
import {
  errorOpened,
  listItemCreated,
  listItemUpdated,
  listItemDeleted,
  apiLoaded,
  apiLoading,
} from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import * as dataModule from '~client/modules/data';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import { GQLProviderMock, mockClient } from '~client/test-utils/gql-provider-mock';
import type { FundInputNative as FundInput, StandardInput, WithIds } from '~client/types';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

jest.mock('shortid', () => ({
  generate: (): string => 'my-short-id',
}));

describe('List mutations', () => {
  beforeEach(() => {
    jest.spyOn(dataModule, 'generateFakeId').mockReturnValue(numericHash('some-fake-id'));
  });

  const getStore = createMockStore<State>();

  const page = PageListStandard.Income;

  const testId = numericHash('some-real-id');

  const testItem: WithIds<StandardInput> = {
    id: 129,
    date: new Date('2020-04-20'),
    item: 'Some item',
    cost: 341,
    category: 'Some category',
    shop: 'Some shop',
  };

  const testDelta: Partial<StandardInput> = {
    item: 'Other item',
  };

  const TestComponent: React.FC = () => {
    const { onCreate, onUpdate, onDelete } = useListCrudStandard(page);

    return (
      <>
        <button data-testid="btn-create" onClick={(): void => onCreate(testItem)}>
          Create!
        </button>
        <button
          data-testid="btn-update"
          onClick={(): void => onUpdate(testId, testDelta, testItem)}
        >
          Update!
        </button>
        <button data-testid="btn-delete" onClick={(): void => onDelete(testId, testItem)}>
          Delete!
        </button>
      </>
    );
  };

  const setup = (Component: React.FC = TestComponent): RenderResult & { store: MockStore } => {
    const store = getStore(testState);
    const utils = render(
      <Provider store={store}>
        <GQLProviderMock>
          <Component />
        </GQLProviderMock>
      </Provider>,
    );
    return { ...utils, store };
  };

  describe(useListCrudStandard.name, () => {
    describe('onCreate', () => {
      it('should dispatch an optimistic create action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              createListItem: {
                error: null,
              },
            },
          }),
        );

        const { store, getByText } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          fireEvent.click(getByText('Create!'));
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemCreated(page, testItem, false, numericHash('some-fake-id')),
            apiLoading,
            apiLoaded,
          ]);
        });
      });

      describe('when an error occurs', () => {
        it('should dispatch an error action', async () => {
          expect.hasAssertions();

          (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
            fromValue({
              data: {
                createListItem: {
                  error: 'Something bad happened',
                },
              },
            }),
          );

          const { store, getByText } = setup();
          expect(store.getActions()).toHaveLength(0);

          act(() => {
            fireEvent.click(getByText('Create!'));
          });

          await waitFor(() => {
            expect(store.getActions()).toStrictEqual(
              expect.arrayContaining([
                errorOpened(`Error creating list item: Something bad happened`, ErrorLevel.Warn),
              ]),
            );
          });
        });
      });
    });

    describe('onUpdate', () => {
      it('should dispatch an optimistic update action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              updateListItem: {
                error: null,
              },
            },
          }),
        );

        const { store, getByText } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          fireEvent.click(getByText('Update!'));
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemUpdated(page, numericHash('some-real-id'), testDelta, testItem, false),
            apiLoading,
            apiLoaded,
          ]);
        });
      });

      describe('when an error occurs', () => {
        it('should dispatch an error action', async () => {
          expect.assertions(2);

          (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
            fromValue({
              data: {
                updateListItem: {
                  error: 'Something bad happened',
                },
              },
            }),
          );

          const { store, getByText } = setup();
          expect(store.getActions()).toHaveLength(0);
          await act(async () => {
            fireEvent.click(getByText('Update!'));

            await new Promise<void>((resolve) => {
              setImmediate(() => {
                expect(store.getActions()).toStrictEqual(
                  expect.arrayContaining([
                    errorOpened(
                      `Error updating list item: Something bad happened`,
                      ErrorLevel.Warn,
                    ),
                  ]),
                );

                resolve();
              });
            });
          });
        });
      });
    });

    describe('onDelete', () => {
      it('should dispatch an optimistic delete action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              updateListItem: {
                error: null,
              },
            },
          }),
        );

        const { store, getByText } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          fireEvent.click(getByText('Delete!'));
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemDeleted(page, numericHash('some-real-id'), testItem, false),
            apiLoading,
            apiLoaded,
          ]);
        });
      });

      describe('when an error occurs', () => {
        it('should dispatch an error action', async () => {
          expect.assertions(2);

          (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
            fromValue({
              data: {
                deleteListItem: {
                  error: 'Something bad happened',
                },
              },
            }),
          );

          const { store, getByText } = setup();
          expect(store.getActions()).toHaveLength(0);
          await act(async () => {
            fireEvent.click(getByText('Delete!'));

            await new Promise<void>((resolve) => {
              setImmediate(() => {
                expect(store.getActions()).toStrictEqual(
                  expect.arrayContaining([
                    errorOpened(
                      `Error deleting list item: Something bad happened`,
                      ErrorLevel.Warn,
                    ),
                  ]),
                );

                resolve();
              });
            });
          });
        });
      });
    });
  });

  describe(useListCrudFunds.name, () => {
    const testFund: WithIds<FundInput> = {
      id: 123,
      item: 'Some fund',
      allocationTarget: 40,
      transactions: [],
      stockSplits: [],
    };

    const testFundDelta: Partial<FundInput> = {
      transactions: [
        {
          date: new Date('2020-04-03'),
          units: 154.28,
          price: 99.13,
          fees: 132,
          taxes: 19,
          drip: false,
        },
      ],
      stockSplits: [{ date: new Date('2021-03-01'), ratio: 10 }],
    };

    const TestComponentFunds: React.FC = () => {
      const { onCreate, onUpdate, onDelete } = useListCrudFunds();

      return (
        <>
          <button data-testid="btn-create" onClick={(): void => onCreate(testFund)}>
            Create!
          </button>
          <button
            data-testid="btn-update"
            onClick={(): void => onUpdate(testId, testFundDelta, testFund)}
          >
            Update!
          </button>
          <button data-testid="btn-delete" onClick={(): void => onDelete(testId, testFund)}>
            Delete!
          </button>
        </>
      );
    };

    describe('onCreate', () => {
      beforeEach(() => {
        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              createFund: {
                error: null,
              },
            },
          }),
        );
      });

      it('should dispatch an optimistic create action', async () => {
        expect.hasAssertions();

        const { store, getByText } = setup(TestComponentFunds);
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          fireEvent.click(getByText('Create!'));
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemCreated(PageNonStandard.Funds, testFund, false, numericHash('some-fake-id')),
            apiLoading,
            apiLoaded,
          ]);
        });
      });

      it('should pass the right variables into the mutation', async () => {
        expect.hasAssertions();

        const { store, getByText } = setup(TestComponentFunds);
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          fireEvent.click(getByText('Create!'));
        });

        await waitFor(() => {
          expect(mockClient.executeMutation).toHaveBeenCalledTimes(1);
        });

        expect(mockClient.executeMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: expect.objectContaining({
              fakeId: expect.any(Number),
              input: testFund,
            }),
          }),
          expect.anything(),
        );
      });
    });

    describe('onUpdate', () => {
      it('should dispatch an optimistic update action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              updateFund: {
                error: null,
              },
            },
          }),
        );

        const { store, getByText } = setup(TestComponentFunds);
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          fireEvent.click(getByText('Update!'));
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemUpdated(PageNonStandard.Funds, testId, testFundDelta, testFund, false),
            apiLoading,
            apiLoaded,
          ]);
        });
      });
    });

    describe('onDelete', () => {
      it('should dispatch an optimistic delete action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              deleteFund: {
                error: null,
              },
            },
          }),
        );

        const { store, getByText } = setup(TestComponentFunds);
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          fireEvent.click(getByText('Delete!'));
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemDeleted(PageNonStandard.Funds, testId, testFund, false),
            apiLoading,
            apiLoaded,
          ]);
        });
      });
    });
  });
});
