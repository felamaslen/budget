import { DatabaseTransactionConnectionType } from 'slonik';

import { createList, createReceipt, deleteList, getOlderExists, updateList } from './list';
import * as overviewController from './overview';
import * as crudQueries from '~api/modules/crud/queries';
import * as pubsub from '~api/modules/graphql/pubsub';
import * as queries from '~api/queries';
import {
  MutationCreateListItemArgs,
  MutationCreateReceiptArgs,
  MutationDeleteListItemArgs,
  MutationUpdateListItemArgs,
  PageListExtended,
  PageListStandard,
  ReceiptPage,
} from '~api/types';

jest.mock('~api/queries');
jest.mock('~api/modules/crud/queries');

describe('List controller', () => {
  const testUserId = 1234;

  describe(createList.name, () => {
    const args: MutationCreateListItemArgs = {
      page: PageListStandard.Income,
      fakeId: -1887123,
      input: {
        date: '2020-04-20',
        item: 'Salary payment',
        cost: 324103,
      },
    };

    it('should publish a message', async () => {
      expect.assertions(2);

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();
      const testItem = {
        id: 1236,
        ...args.input,
      };

      const overviewCost = [1023, 8823, 1291];

      jest.spyOn(crudQueries, 'insertCrudItem').mockResolvedValueOnce(testItem);
      jest.spyOn(queries, 'selectListTotalCost').mockResolvedValueOnce(1776912);
      jest.spyOn(queries, 'selectListWeeklyCosts').mockResolvedValueOnce([7659, 12932, 8154]);
      jest.spyOn(overviewController, 'getMonthCost').mockResolvedValueOnce(overviewCost);

      await createList({} as DatabaseTransactionConnectionType, testUserId, args);

      expect(pubsubSpy).toHaveBeenCalledTimes(1);
      expect(pubsubSpy).toHaveBeenCalledWith(
        `${pubsub.PubSubTopic.ListItemCreated}.${testUserId}`,
        {
          page: PageListStandard.Income,
          id: 1236,
          fakeId: -1887123,
          item: args.input,
          overviewCost,
          total: 1776912,
          weekly: 9113,
        },
      );
    });
  });

  describe(createReceipt.name, () => {
    it('should publish a message to the pubsub queue', async () => {
      expect.assertions(2);

      jest.spyOn(queries, 'insertListItems').mockImplementation(async (_, __, table) => {
        if (table === 'food') {
          return [123];
        }
        if (table === 'general') {
          return [456];
        }
        if (table === 'social') {
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

      expect(pubsubSpy).toHaveBeenCalledTimes(1);
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
            page: PageListExtended.General,
            id: 456,
            date: new Date('2020-04-21'),
            item: 'Some general item',
            category: 'Some general category',
            cost: 710,
            shop: 'Some shop',
          },
          {
            page: PageListExtended.Social,
            id: 789,
            date: new Date('2020-04-21'),
            item: 'Some social item',
            category: 'Some social category',
            cost: 6301,
            shop: 'Some shop',
          },
        ],
      });
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
      },
    };

    it('should publish a message', async () => {
      expect.assertions(2);

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      const overviewCost = [1023, 8823, 1291];

      jest.spyOn(crudQueries, 'updateCrudItem').mockResolvedValueOnce({
        ...args.input,
        id: args.id,
      });
      jest.spyOn(queries, 'selectListTotalCost').mockResolvedValueOnce(1776912);
      jest.spyOn(queries, 'selectListWeeklyCosts').mockResolvedValueOnce([7659, 12932, 8154]);
      jest.spyOn(overviewController, 'getMonthCost').mockResolvedValueOnce(overviewCost);

      await updateList({} as DatabaseTransactionConnectionType, testUserId, args);

      expect(pubsubSpy).toHaveBeenCalledTimes(1);
      expect(pubsubSpy).toHaveBeenCalledWith(
        `${pubsub.PubSubTopic.ListItemUpdated}.${testUserId}`,
        {
          page: PageListStandard.Income,
          id: 178,
          item: args.input,
          overviewCost,
          total: 1776912,
          weekly: 9113,
        },
      );
    });
  });

  describe(deleteList.name, () => {
    const args: MutationDeleteListItemArgs = {
      page: PageListStandard.Income,
      id: 913,
    };

    it('should publish a message', async () => {
      expect.assertions(2);

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      const overviewCost = [1023, 8823, 1291];

      jest.spyOn(crudQueries, 'deleteCrudItem').mockResolvedValueOnce(1);
      jest.spyOn(queries, 'selectListTotalCost').mockResolvedValueOnce(1776912);
      jest.spyOn(queries, 'selectListWeeklyCosts').mockResolvedValueOnce([7659, 12932, 8154]);
      jest.spyOn(overviewController, 'getMonthCost').mockResolvedValueOnce(overviewCost);

      await deleteList({} as DatabaseTransactionConnectionType, testUserId, args);

      expect(pubsubSpy).toHaveBeenCalledTimes(1);
      expect(pubsubSpy).toHaveBeenCalledWith(
        `${pubsub.PubSubTopic.ListItemDeleted}.${testUserId}`,
        {
          page: PageListStandard.Income,
          id: 913,
          overviewCost,
          total: 1776912,
          weekly: 9113,
        },
      );
    });
  });

  describe(getOlderExists.name, () => {
    const db = {} as DatabaseTransactionConnectionType;

    beforeEach(() => {
      jest.spyOn(queries, 'countRows').mockResolvedValueOnce(882);
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
