import { act, fireEvent, render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';
import { fromValue } from 'wonka';

import { useListCrudStandard, useListCrudFunds } from './list';
import { errorOpened, listItemCreated, listItemUpdated, listItemDeleted } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import * as dataModule from '~client/modules/data';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import { GQLProviderMock, mockClient } from '~client/test-utils/gql-provider-mock';
import {
  FundInputNative as FundInput,
  PageListStandard,
  PageNonStandard,
  StandardInput,
  WithIds,
} from '~client/types';

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
        expect.assertions(2);

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
        await act(async () => {
          fireEvent.click(getByText('Create!'));

          await new Promise<void>((resolve) => {
            setImmediate(() => {
              expect(store.getActions()).toStrictEqual([
                listItemCreated(page, testItem, false, numericHash('some-fake-id')),
              ]);

              resolve();
            });
          });
        });
      });

      describe('when an error occurs', () => {
        it('should dispatch an error action', async () => {
          expect.assertions(2);

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
          await act(async () => {
            fireEvent.click(getByText('Create!'));

            await new Promise<void>((resolve) => {
              setImmediate(() => {
                expect(store.getActions()).toStrictEqual(
                  expect.arrayContaining([
                    errorOpened(
                      `Error creating list item: Something bad happened`,
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

    describe('onUpdate', () => {
      it('should dispatch an optimistic update action', async () => {
        expect.assertions(2);

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
        await act(async () => {
          fireEvent.click(getByText('Update!'));

          await new Promise<void>((resolve) => {
            setImmediate(() => {
              expect(store.getActions()).toStrictEqual([
                listItemUpdated(page, numericHash('some-real-id'), testDelta, testItem, false),
              ]);

              resolve();
            });
          });
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
        expect.assertions(2);

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
        await act(async () => {
          fireEvent.click(getByText('Delete!'));

          await new Promise<void>((resolve) => {
            setImmediate(() => {
              expect(store.getActions()).toStrictEqual([
                listItemDeleted(page, numericHash('some-real-id'), testItem, false),
              ]);

              resolve();
            });
          });
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
    };

    const testFundDelta: Partial<FundInput> = {
      transactions: [
        { date: new Date('2020-04-03'), units: 154.28, price: 99.13, fees: 132, taxes: 19 },
      ],
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
      it('should dispatch an optimistic create action', async () => {
        expect.assertions(2);

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              createFund: {
                error: null,
              },
            },
          }),
        );

        const { store, getByText } = setup(TestComponentFunds);
        expect(store.getActions()).toHaveLength(0);
        await act(async () => {
          fireEvent.click(getByText('Create!'));

          await new Promise<void>((resolve) => {
            setImmediate(() => {
              expect(store.getActions()).toStrictEqual([
                listItemCreated(
                  PageNonStandard.Funds,
                  testFund,
                  false,
                  numericHash('some-fake-id'),
                ),
              ]);

              resolve();
            });
          });
        });
      });
    });

    describe('onUpdate', () => {
      it('should dispatch an optimistic update action', async () => {
        expect.assertions(2);

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
        await act(async () => {
          fireEvent.click(getByText('Update!'));

          await new Promise<void>((resolve) => {
            setImmediate(() => {
              expect(store.getActions()).toStrictEqual([
                listItemUpdated(PageNonStandard.Funds, testId, testFundDelta, testFund, false),
              ]);

              resolve();
            });
          });
        });
      });
    });

    describe('onDelete', () => {
      it('should dispatch an optimistic delete action', async () => {
        expect.assertions(2);

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
        await act(async () => {
          fireEvent.click(getByText('Delete!'));

          await new Promise<void>((resolve) => {
            setImmediate(() => {
              expect(store.getActions()).toStrictEqual([
                listItemDeleted(PageNonStandard.Funds, testId, testFund, false),
              ]);

              resolve();
            });
          });
        });
      });
    });
  });
});
