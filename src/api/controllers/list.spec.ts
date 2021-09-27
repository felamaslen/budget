import { omit } from 'lodash';
import { DatabaseTransactionConnectionType } from 'slonik';

import { createList, createReceipt, deleteList, getOlderExists, updateList } from './list';
import * as crudQueries from '~api/modules/crud/queries';
import * as pubsub from '~api/modules/graphql/pubsub';
import * as queries from '~api/queries';
import {
  ListSubscriptionRawDate,
  MutationCreateListItemArgs,
  MutationCreateReceiptArgs,
  MutationDeleteListItemArgs,
  MutationUpdateListItemArgs,
  PageListStandard,
  ReceiptPage,
} from '~api/types';

jest.mock('~api/queries');
jest.mock('~api/modules/crud/queries');

describe('List controller', () => {
  const testUserId = 1234;

  const expectedOverviewCost = [1023, 8823, 1291];

  beforeEach(() => {
    jest.spyOn(queries, 'selectSinglePageListSummary').mockResolvedValueOnce(expectedOverviewCost);

    jest
      .spyOn(queries, 'selectListTotalCost')
      .mockResolvedValueOnce([{ page: PageListStandard.Income, total: 1776912 }]);
    jest.spyOn(queries, 'selectListWeeklyCosts').mockResolvedValueOnce([
      { year: 2018, weekly: 7659 },
      { year: 2019, weekly: 12932 },
      { year: 2020, weekly: 8154 },
    ]);
  });

  describe(createList.name, () => {
    const args: MutationCreateListItemArgs = {
      page: PageListStandard.Income,
      fakeId: -1887123,
      input: {
        date: '2020-04-20',
        item: 'Salary payment',
        cost: 324103,
        category: 'category one',
        shop: 'company one',
      },
    };

    it('should publish a message', async () => {
      expect.assertions(3);

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();
      const testItem = {
        id: 1236,
        ...args.input,
      };

      jest.spyOn(crudQueries, 'insertCrudItem').mockResolvedValueOnce({
        ...omit(testItem, 'cost'),
        value: testItem.cost,
      });

      await createList({} as DatabaseTransactionConnectionType, testUserId, args);

      expect(pubsubSpy).toHaveBeenCalledTimes(2);
      expect(pubsubSpy).toHaveBeenCalledWith<[string, ListSubscriptionRawDate]>(
        `${pubsub.PubSubTopic.ListChanged}.${testUserId}`,
        {
          page: PageListStandard.Income,
          created: {
            fakeId: -1887123,
            item: {
              ...args.input,
              id: 1236,
            },
          },
          overviewCost: expectedOverviewCost,
          total: 1776912,
          weekly: 9113,
        },
      );
      expect(pubsubSpy).toHaveBeenCalledWith(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${testUserId}`,
        expect.objectContaining({
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        }),
      );
    });
  });

  describe(createReceipt.name, () => {
    it('should publish a message to the pubsub queue', async () => {
      expect.assertions(3);

      jest.spyOn(queries, 'insertListItems').mockImplementation(async (_, __, page) => {
        if (page === 'food') {
          return [123];
        }
        if (page === 'general') {
          return [456];
        }
        if (page === 'social') {
          return [789];
        }
        return [];
      });

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      const args: MutationCreateReceiptArgs = {
        date: new Date('2020-04-21'),
        shop: 'Some shop',
        items: [
          {
            page: ReceiptPage.Food,
            item: 'Some food item',
            category: 'Some food category',
            cost: 881,
          },
          {
            page: ReceiptPage.General,
            item: 'Some general item',
            category: 'Some general category',
            cost: 710,
          },
          {
            page: ReceiptPage.Social,
            item: 'Some social item',
            category: 'Some social category',
            cost: 6301,
          },
        ],
      };

      await createReceipt({} as DatabaseTransactionConnectionType, testUserId, args);

      expect(pubsubSpy).toHaveBeenCalledTimes(2);
      expect(pubsubSpy).toHaveBeenCalledWith(`${pubsub.PubSubTopic.ReceiptCreated}.${testUserId}`, {
        items: [
          {
            page: ReceiptPage.Food,
            id: 123,
            date: new Date('2020-04-21'),
            item: 'Some food item',
            category: 'Some food category',
            cost: 881,
            shop: 'Some shop',
          },
          {
            page: PageListStandard.General,
            id: 456,
            date: new Date('2020-04-21'),
            item: 'Some general item',
            category: 'Some general category',
            cost: 710,
            shop: 'Some shop',
          },
          {
            page: PageListStandard.Social,
            id: 789,
            date: new Date('2020-04-21'),
            item: 'Some social item',
            category: 'Some social category',
            cost: 6301,
            shop: 'Some shop',
          },
        ],
      });
      expect(pubsubSpy).toHaveBeenCalledWith(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${testUserId}`,
        expect.objectContaining({
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        }),
      );
    });
  });

  describe(updateList.name, () => {
    const args: MutationUpdateListItemArgs = {
      page: PageListStandard.Income,
      id: 178,
      input: {
        date: '2020-04-20',
        item: 'Other payment',
        cost: 324103,
        category: 'category one',
        shop: 'company one',
      },
    };

    it('should publish a message', async () => {
      expect.assertions(3);

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      jest.spyOn(crudQueries, 'updateCrudItem').mockResolvedValueOnce({
        ...omit(args.input, 'cost'),
        value: args.input.cost,
        id: args.id,
      });

      await updateList({} as DatabaseTransactionConnectionType, testUserId, args);

      expect(pubsubSpy).toHaveBeenCalledTimes(2);
      expect(pubsubSpy).toHaveBeenCalledWith<[string, ListSubscriptionRawDate]>(
        `${pubsub.PubSubTopic.ListChanged}.${testUserId}`,
        {
          page: PageListStandard.Income,
          updated: { id: args.id, ...args.input },
          overviewCost: expectedOverviewCost,
          total: 1776912,
          weekly: 9113,
        },
      );
      expect(pubsubSpy).toHaveBeenCalledWith(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${testUserId}`,
        expect.objectContaining({
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        }),
      );
    });
  });

  describe(deleteList.name, () => {
    const args: MutationDeleteListItemArgs = {
      page: PageListStandard.Income,
      id: 913,
    };

    it('should publish a message', async () => {
      expect.assertions(3);

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      jest.spyOn(crudQueries, 'deleteCrudItem').mockResolvedValueOnce(1);

      await deleteList({} as DatabaseTransactionConnectionType, testUserId, args);

      expect(pubsubSpy).toHaveBeenCalledTimes(2);
      expect(pubsubSpy).toHaveBeenCalledWith<[string, ListSubscriptionRawDate]>(
        `${pubsub.PubSubTopic.ListChanged}.${testUserId}`,
        {
          page: PageListStandard.Income,
          deleted: 913,
          overviewCost: expectedOverviewCost,
          total: 1776912,
          weekly: 9113,
        },
      );
      expect(pubsubSpy).toHaveBeenCalledWith(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${testUserId}`,
        expect.objectContaining({
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        }),
      );
    });
  });

  describe(getOlderExists.name, () => {
    const db = {} as DatabaseTransactionConnectionType;

    beforeEach(() => {
      jest.spyOn(queries, 'countStandardRows').mockResolvedValueOnce(882);
    });

    describe('if there are older rows', () => {
      it('should return true', async () => {
        expect.assertions(1);
        expect(await getOlderExists(db, testUserId, PageListStandard.Food, 100, 7)).toBe(true);
      });
    });

    describe('if there are no older rows', () => {
      it('should return false', async () => {
        expect.assertions(1);
        expect(await getOlderExists(db, testUserId, PageListStandard.Food, 100, 8)).toBe(false);
      });
    });
  });
});
