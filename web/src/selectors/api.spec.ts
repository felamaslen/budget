import { getTransactionsList } from '~client/modules/data';
import { getApiKey, getLocked, getUnsaved } from '~client/selectors';
import { testState } from '~client/test-data';
import { Page, RequestType } from '~client/types';

describe('API selectors', () => {
  describe('getApiKey', () => {
    it('getApiKey gets the API key from the state', () => {
      expect.assertions(1);
      expect(
        getApiKey({
          ...testState,
          api: {
            ...testState.api,
            key: 'foo',
          },
        }),
      ).toBe('foo');
    });
  });

  describe('getLocked', () => {
    it('getLocked returns true iff the state is locked for synchronisation', () => {
      expect.assertions(2);
      expect(getLocked({ ...testState, api: { ...testState.api, locked: true } })).toBe(true);
      expect(getLocked({ ...testState, api: { ...testState.api, locked: false } })).toBe(false);
    });
  });

  describe('getUnsaved', () => {
    it('getUnsaved returns true iff the state contains unsaved optimistic updates', () => {
      expect.assertions(5);
      expect(
        getUnsaved({
          ...testState,
          [Page.funds]: {
            ...testState.funds,
            items: [
              ...testState.funds.items,
              {
                id: 'some-fund-id',
                item: 'some-fund-name',
                transactions: getTransactionsList([
                  { date: '2019-05-03', units: 103, cost: 99231 },
                ]),
              },
            ],
            __optimistic: [...testState.funds.__optimistic, RequestType.update],
          },
          [Page.food]: {
            ...testState.food,
            items: [
              ...testState.food.items,
              {
                id: 'real-id-z',
                date: new Date(),
                item: 'some food item',
                category: 'some food category',
                cost: 3,
                shop: 'some food shop',
              },
            ],
            __optimistic: [...testState.food.__optimistic, RequestType.update],
          },
          [Page.general]: {
            ...testState.general,
            items: [
              ...testState.general.items,
              {
                id: 'some-fake-id',
                date: new Date(),
                item: 'some general item',
                category: 'some general category',
                cost: 3,
                shop: 'some general shop',
              },
            ],
            __optimistic: [...testState.general.__optimistic, RequestType.create],
          },
          [Page.holiday]: {
            ...testState.holiday,
            items: [
              ...testState.holiday.items,
              {
                id: 'real-id-x',
                date: new Date(),
                item: 'some holiday item',
                holiday: 'some holiday',
                cost: 3,
                shop: 'some holiday shop',
              },
            ],
            __optimistic: [...testState.holiday.__optimistic, RequestType.delete],
          },
        }),
      ).toBe(true);

      expect(
        getUnsaved({
          ...testState,
          netWorth: {
            ...testState.netWorth,
            categories: {
              items: [
                ...testState.netWorth.categories.items,
                {
                  id: 'some-fake-id',
                  type: 'asset',
                  category: 'My asset',
                  color: '#00ff00',
                  isOption: false,
                },
              ],
              __optimistic: [...testState.netWorth.categories.__optimistic, RequestType.create],
            },
          },
        }),
      ).toBe(true);

      expect(
        getUnsaved({
          ...testState,
          netWorth: {
            ...testState.netWorth,
            subcategories: {
              items: [
                ...testState.netWorth.subcategories.items,
                {
                  id: 'some-fake-id',
                  categoryId: 'some-category-id',
                  subcategory: 'My wallet',
                  hasCreditLimit: null,
                  opacity: 0,
                },
              ],
              __optimistic: [...testState.netWorth.subcategories.__optimistic, RequestType.create],
            },
          },
        }),
      ).toBe(true);

      expect(
        getUnsaved({
          ...testState,
          netWorth: {
            ...testState.netWorth,
            entries: {
              items: [...testState.netWorth.entries.items, testState.netWorth.entries.items[0]],
              __optimistic: [...testState.netWorth.entries.__optimistic, RequestType.update],
            },
          },
        }),
      ).toBe(true);

      expect(
        getUnsaved({
          ...testState,
          [Page.funds]: {
            ...testState.funds,
            items: [
              ...testState.funds.items,
              {
                id: 'some-fund-id',
                item: 'some-fund-name',
                transactions: getTransactionsList([
                  { date: '2019-05-03', units: 103, cost: 99231 },
                ]),
              },
            ],
            __optimistic: [...testState.food.__optimistic, undefined],
          },
          [Page.food]: {
            ...testState.food,
            items: [
              ...testState.food.items,
              {
                id: 'real-id-z',
                date: new Date(),
                item: 'some food item',
                category: 'some food category',
                cost: 3,
                shop: 'some food shop',
              },
            ],
            __optimistic: [...testState.food.__optimistic, undefined],
          },
          [Page.general]: {
            ...testState.general,
            items: [
              ...testState.general.items,
              {
                id: 'some-fake-id',
                date: new Date(),
                item: 'some general item',
                category: 'some general category',
                cost: 3,
                shop: 'some general shop',
              },
            ],
            __optimistic: [...testState.general.__optimistic, undefined],
          },
          [Page.holiday]: {
            ...testState.holiday,
            items: [
              ...testState.holiday.items,
              {
                id: 'real-id-x',
                date: new Date(),
                item: 'some holiday item',
                holiday: 'some holiday',
                cost: 3,
                shop: 'some holiday shop',
              },
            ],
            __optimistic: [...testState.holiday.__optimistic, undefined],
          },
        }),
      ).toBe(false);
    });
  });
});
