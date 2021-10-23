import { waitFor } from '@testing-library/react';
import { makeOperation, OperationContext } from 'urql';
import * as w from 'wonka';

import { useListSubscriptions } from './list';

import {
  listItemCreated,
  listItemDeleted,
  listItemUpdated,
  listOverviewUpdated,
  receiptCreated,
} from '~client/actions';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import { FundNative, Id, StandardInput } from '~client/types';

import { PageListStandard, PageNonStandard } from '~client/types/enum';
import {
  FundsChangedDocument,
  FundsChangedSubscription,
  Income,
  IncomeChangedDocument,
  IncomeChangedSubscription,
  IncomeInput,
  ListChangedDocument,
  ListChangedSubscription,
  ListItemInput,
  ReceiptCreatedDocument,
  ReceiptCreatedSubscription,
  ReceiptPage,
} from '~client/types/gql';
import { NativeDate } from '~shared/types';

describe(useListSubscriptions.name, () => {
  let subscribeSpy: jest.SpyInstance<
    ReturnType<typeof mockClient['executeMutation']>,
    Parameters<typeof mockClient['executeMutation']>
  >;
  beforeEach(() => {
    subscribeSpy = jest.spyOn(mockClient, 'executeSubscription');
  });

  it('should subscribe to standard list item creates', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === ListChangedDocument) {
        const data: ListChangedSubscription = {
          listChanged: {
            page: PageListStandard.Food,
            created: {
              fakeId: -7712,
              item: {
                id: 8912,
                date: '2020-04-03',
                item: 'my item',
                category: 'my category',
                cost: 1866,
                shop: 'my shop',
              },
            },
            overviewCost: [1, 2, 3],
            total: 1005,
            weekly: 86,
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual(
        expect.arrayContaining([
          listItemCreated(
            PageListStandard.Food,
            {
              id: 8912,
              date: new Date('2020-04-03'),
              item: 'my item',
              category: 'my category',
              cost: 1866,
              shop: 'my shop',
            },
            true,
            8912,
            -7712,
          ),
          listOverviewUpdated(PageListStandard.Food, [1, 2, 3], 1005, 86),
        ]),
      );
      expect(actions).toHaveLength(2);
    });
  });

  it('should subscribe to standard list item updates', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === ListChangedDocument) {
        const data: ListChangedSubscription = {
          listChanged: {
            page: PageListStandard.Food,
            updated: {
              id: 8912,
              date: '2020-04-03',
              item: 'my item',
              category: 'my category',
              cost: 1866,
              shop: 'my shop',
            },
            overviewCost: [1, 2, 3],
            total: 1005,
            weekly: 86,
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual(
        expect.arrayContaining([
          listItemUpdated<StandardInput & { id: Id }>(
            PageListStandard.Food,
            8912,
            {
              id: 8912,
              date: new Date('2020-04-03'),
              item: 'my item',
              category: 'my category',
              cost: 1866,
              shop: 'my shop',
            },
            null,
            true,
          ),
          listOverviewUpdated(PageListStandard.Food, [1, 2, 3], 1005, 86),
        ]),
      );
      expect(actions).toHaveLength(2);
    });
  });

  it('should subscribe to standard list item deletes', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === ListChangedDocument) {
        const data: ListChangedSubscription = {
          listChanged: {
            page: PageListStandard.Food,
            deleted: 8912,
            overviewCost: [1, 2, 3],
            total: 1005,
            weekly: 86,
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual(
        expect.arrayContaining([
          listItemDeleted(PageListStandard.Food, 8912, {} as ListItemInput, true),
          listOverviewUpdated(PageListStandard.Food, [1, 2, 3], 1005, 86),
        ]),
      );
      expect(actions).toHaveLength(2);
    });
  });

  it('should subscribe to income creates', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === IncomeChangedDocument) {
        const data: IncomeChangedSubscription = {
          incomeChanged: {
            created: {
              fakeId: -7712,
              item: {
                id: 8912,
                date: '2020-04-03',
                item: 'my item',
                category: 'my category',
                cost: 1866,
                shop: 'my shop',
                deductions: [{ name: 'Income tax', value: -190539 }],
              },
            },
            overviewCost: [1, 2, 3],
            total: 1005,
            weekly: 86,
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual(
        expect.arrayContaining([
          listItemCreated<NativeDate<Income, 'date'>, PageListStandard.Income>(
            PageListStandard.Income,
            {
              id: 8912,
              date: new Date('2020-04-03'),
              item: 'my item',
              category: 'my category',
              cost: 1866,
              shop: 'my shop',
              deductions: [{ name: 'Income tax', value: -190539 }],
            },
            true,
            8912,
            -7712,
          ),
          listOverviewUpdated(PageListStandard.Income, [1, 2, 3], 1005, 86),
        ]),
      );
      expect(actions).toHaveLength(2);
    });
  });

  it('should subscribe to income updates', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === IncomeChangedDocument) {
        const data: IncomeChangedSubscription = {
          incomeChanged: {
            updated: {
              id: 8912,
              date: '2020-04-03',
              item: 'my item',
              category: 'my category',
              cost: 1866,
              shop: 'my shop',
              deductions: [{ name: 'Income tax', value: -190539 }],
            },
            overviewCost: [1, 2, 3],
            total: 1005,
            weekly: 86,
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual(
        expect.arrayContaining([
          listItemUpdated<NativeDate<IncomeInput, 'date'> & { id: Id }>(
            PageListStandard.Income,
            8912,
            {
              id: 8912,
              date: new Date('2020-04-03'),
              item: 'my item',
              category: 'my category',
              cost: 1866,
              shop: 'my shop',
              deductions: [{ name: 'Income tax', value: -190539 }],
            },
            null,
            true,
          ),
          listOverviewUpdated(PageListStandard.Income, [1, 2, 3], 1005, 86),
        ]),
      );
      expect(actions).toHaveLength(2);
    });
  });

  it('should subscribe to income deletes', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === IncomeChangedDocument) {
        const data: IncomeChangedSubscription = {
          incomeChanged: {
            deleted: 8912,
            overviewCost: [1, 2, 3],
            total: 1005,
            weekly: 86,
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual(
        expect.arrayContaining([
          listItemDeleted(PageListStandard.Income, 8912, {} as ListItemInput, true),
          listOverviewUpdated(PageListStandard.Income, [1, 2, 3], 1005, 86),
        ]),
      );
      expect(actions).toHaveLength(2);
    });
  });

  it('should subscribe to fund creates', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === FundsChangedDocument) {
        const data: FundsChangedSubscription = {
          fundsChanged: {
            created: {
              fakeId: -7712,
              item: {
                id: 8912,
                item: 'my fund',
                transactions: [
                  {
                    date: '2020-04-20',
                    units: 1,
                    price: 2,
                    fees: 3,
                    taxes: 4,
                    drip: true,
                    pension: true,
                  },
                ],
                stockSplits: [{ date: '2020-04-21', ratio: 10 }],
              },
            },
            overviewCost: [1, 2, 3],
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual(
        expect.arrayContaining([
          listItemCreated<FundNative, PageNonStandard.Funds>(
            PageNonStandard.Funds,
            {
              id: 8912,
              item: 'my fund',
              transactions: [
                {
                  date: new Date('2020-04-20'),
                  units: 1,
                  price: 2,
                  fees: 3,
                  taxes: 4,
                  drip: true,
                  pension: true,
                },
              ],
              stockSplits: [{ date: new Date('2020-04-21'), ratio: 10 }],
            },
            true,
            8912,
            -7712,
          ),
          listOverviewUpdated(PageNonStandard.Funds, [1, 2, 3], undefined, undefined),
        ]),
      );
      expect(actions).toHaveLength(2);
    });
  });

  it('should subscribe to fund updates', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === FundsChangedDocument) {
        const data: FundsChangedSubscription = {
          fundsChanged: {
            updated: {
              id: 8912,
              item: 'my fund',
              transactions: [
                {
                  date: '2020-04-20',
                  units: 1,
                  price: 2,
                  fees: 3,
                  taxes: 4,
                  drip: true,
                  pension: true,
                },
              ],
              stockSplits: [{ date: '2020-04-21', ratio: 10 }],
            },
            overviewCost: [1, 2, 3],
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual(
        expect.arrayContaining([
          listItemUpdated<FundNative>(
            PageNonStandard.Funds,
            8912,
            {
              id: 8912,
              item: 'my fund',
              transactions: [
                {
                  date: new Date('2020-04-20'),
                  units: 1,
                  price: 2,
                  fees: 3,
                  taxes: 4,
                  drip: true,
                  pension: true,
                },
              ],
              stockSplits: [{ date: new Date('2020-04-21'), ratio: 10 }],
            },
            null,
            true,
          ),
          listOverviewUpdated(PageNonStandard.Funds, [1, 2, 3], undefined, undefined),
        ]),
      );
      expect(actions).toHaveLength(2);
    });
  });

  it('should subscribe to fund deletes', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === FundsChangedDocument) {
        const data: FundsChangedSubscription = {
          fundsChanged: {
            deleted: 8912,
            overviewCost: [1, 2, 3],
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual(
        expect.arrayContaining([
          listItemDeleted(PageNonStandard.Funds, 8912, {} as ListItemInput, true),
          listOverviewUpdated(PageNonStandard.Funds, [1, 2, 3]),
        ]),
      );
      expect(actions).toHaveLength(2);
    });
  });

  it('should subscribe to receipt creations', async () => {
    expect.hasAssertions();

    subscribeSpy.mockImplementation((request) => {
      if (request.query === ReceiptCreatedDocument) {
        const data: ReceiptCreatedSubscription = {
          receiptCreated: {
            items: [
              {
                id: 12,
                page: ReceiptPage.Food,
                date: '2020-04-20',
                item: 'food 1',
                category: 'food cat 1',
                cost: 123,
                shop: 'food shop',
              },
              {
                id: 83,
                page: ReceiptPage.General,
                date: '2020-04-30',
                item: 'general 1',
                category: 'general cat 1',
                cost: 456,
                shop: 'general shop',
              },
            ],
          },
        };

        return w.pipe(
          w.interval(50),
          w.map(() => ({
            operation: makeOperation('subscription', request, {} as OperationContext),
            data,
          })),
        );
      }
      return w.fromValue({
        operation: makeOperation('subscription', request, {} as OperationContext),
        data: null,
      });
    });

    const { store } = renderHookWithStore(useListSubscriptions);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toStrictEqual([
        receiptCreated([
          {
            id: 12,
            page: ReceiptPage.Food,
            date: '2020-04-20',
            item: 'food 1',
            category: 'food cat 1',
            cost: 123,
            shop: 'food shop',
          },
          {
            id: 83,
            page: ReceiptPage.General,
            date: '2020-04-30',
            item: 'general 1',
            category: 'general cat 1',
            cost: 456,
            shop: 'general shop',
          },
        ]),
      ]);
    });
  });
});
