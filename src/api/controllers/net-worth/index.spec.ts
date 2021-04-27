import { DatabaseTransactionConnectionType } from 'slonik';

import { createNetWorthEntry, updateNetWorthEntry, deleteNetWorthEntry } from './index';

import * as pubsub from '~api/modules/graphql/pubsub';
import * as queries from '~api/queries';
import { NetWorthCashTotal, NetWorthEntryInput } from '~api/types';

jest.mock('~api/modules/graphql/pubsub');
jest.mock('~api/queries');

describe('Net worth controller', () => {
  const db = {} as DatabaseTransactionConnectionType;
  const uid = 1238;

  const testEntryInput: NetWorthEntryInput = {
    date: new Date('2020-04-20'),
    values: [{ subcategory: 91, simple: 722934 }],
    creditLimit: [],
    currencies: [],
  };

  describe(createNetWorthEntry.name, () => {
    it('should publish the created item and cash total', async () => {
      expect.assertions(3);

      jest.spyOn(queries, 'getInvalidIds').mockResolvedValueOnce([]);
      jest.spyOn(queries, 'getInvalidCreditCategories').mockResolvedValueOnce([]);
      jest.spyOn(queries, 'insertValues').mockResolvedValueOnce([]);
      jest.spyOn(queries, 'insertEntry').mockResolvedValueOnce(65);

      jest.spyOn(queries, 'selectEntry').mockResolvedValueOnce([
        {
          id: 65,
          date: '2020-04-20',
          currency_ids: [null],
          currencies: [null],
          currency_rates: [null],
          credit_limit_subcategory: [null],
          credit_limit_value: [null],
          value_id: 32,
          value_subcategory: 91,
          value_skip: null,
          value_simple: 722934,
          is_saye: null,
          fx_values: [null],
          fx_currencies: [null],
          op_units: null,
          op_strike_price: null,
          op_market_price: null,
          op_vested: null,
          loan_payments_remaining: null,
          loan_rate: null,
        },
      ]);

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish');

      await createNetWorthEntry(db, uid, {
        input: testEntryInput,
      });

      expect(pubsubSpy).toHaveBeenCalledTimes(2);
      expect(pubsubSpy).toHaveBeenCalledWith(`${pubsub.PubSubTopic.NetWorthEntryCreated}.${uid}`, {
        item: {
          id: 65,
          date: new Date('2020-04-20'),
          values: [
            {
              subcategory: 91,
              value: 722934,
              simple: 722934,
              fx: null,
              option: null,
              loan: null,
              skip: null,
            },
          ],
          creditLimit: [],
          currencies: [],
        },
      });

      expect(pubsubSpy).toHaveBeenCalledWith<[string, NetWorthCashTotal]>(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${uid}`,
        {
          cashInBank: expect.any(Number),
          stockValue: expect.any(Number),
          stocksIncludingCash: expect.any(Number),
          date: null,
        },
      );
    });
  });

  describe(updateNetWorthEntry.name, () => {
    it('should publish the updated item and cash total', async () => {
      expect.assertions(3);

      jest.spyOn(queries, 'getInvalidIds').mockResolvedValueOnce([]);
      jest.spyOn(queries, 'getInvalidCreditCategories').mockResolvedValueOnce([]);
      jest.spyOn(queries, 'insertValues').mockResolvedValueOnce([]);

      jest
        .spyOn(queries, 'selectEntry')
        .mockResolvedValueOnce([
          {
            id: 65,
            date: '2020-04-20',
            currency_ids: [null],
            currencies: [null],
            currency_rates: [null],
            credit_limit_subcategory: [null],
            credit_limit_value: [null],
            value_id: 32,
            value_subcategory: 91,
            value_skip: null,
            value_simple: 722934,
            is_saye: null,
            fx_values: [null],
            fx_currencies: [null],
            op_units: null,
            op_strike_price: null,
            op_market_price: null,
            op_vested: null,
            loan_payments_remaining: null,
            loan_rate: null,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 65,
            date: '2020-04-23',
            currency_ids: [4, 7],
            currencies: ['CZK', 'USD'],
            currency_rates: [0.0273, 0.7463],
            credit_limit_subcategory: [null],
            credit_limit_value: [null],
            value_id: 32,
            value_subcategory: 91,
            value_skip: null,
            value_simple: null,
            is_saye: null,
            fx_values: [105, 56],
            fx_currencies: ['CZK', 'USD'],
            op_units: null,
            op_strike_price: null,
            op_market_price: null,
            op_vested: null,
            loan_payments_remaining: null,
            loan_rate: null,
          },
        ]);

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish');

      await updateNetWorthEntry(db, uid, {
        id: 65,
        input: testEntryInput,
      });

      expect(pubsubSpy).toHaveBeenCalledTimes(2);
      expect(pubsubSpy).toHaveBeenCalledWith(`${pubsub.PubSubTopic.NetWorthEntryUpdated}.${uid}`, {
        item: {
          id: 65,
          date: new Date('2020-04-23'),
          values: [
            {
              subcategory: 91,
              value: Math.round(105 * 100 * 0.0273 + 56 * 100 * 0.7463),
              simple: null,
              fx: [
                { value: 105, currency: 'CZK' },
                { value: 56, currency: 'USD' },
              ],
              option: null,
              loan: null,
              skip: null,
            },
          ],
          creditLimit: [],
          currencies: [
            { currency: 'CZK', rate: 0.0273 },
            { currency: 'USD', rate: 0.7463 },
          ],
        },
      });

      expect(pubsubSpy).toHaveBeenCalledWith<[string, NetWorthCashTotal]>(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${uid}`,
        {
          cashInBank: expect.any(Number),
          stockValue: expect.any(Number),
          stocksIncludingCash: expect.any(Number),
          date: null,
        },
      );
    });
  });

  describe(deleteNetWorthEntry.name, () => {
    it('should publish the deleted item and cash total', async () => {
      expect.assertions(3);

      jest.spyOn(queries, 'deleteNetWorthEntryRow').mockResolvedValueOnce(1);

      const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish');

      await deleteNetWorthEntry(db, uid, {
        id: 65,
      });

      expect(pubsubSpy).toHaveBeenCalledTimes(2);
      expect(pubsubSpy).toHaveBeenCalledWith(`${pubsub.PubSubTopic.NetWorthEntryDeleted}.${uid}`, {
        id: 65,
      });

      expect(pubsubSpy).toHaveBeenCalledWith<[string, NetWorthCashTotal]>(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${uid}`,
        {
          cashInBank: expect.any(Number),
          stockValue: expect.any(Number),
          stocksIncludingCash: expect.any(Number),
          date: null,
        },
      );
    });
  });
});
