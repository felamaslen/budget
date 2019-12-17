import { getFundsRows } from '~/selectors/funds/helpers';

import { DELETE } from '~/constants/crud';

test('getFundsRows excludes optimistically deleted items', () => {
  expect.assertions(1);
  expect(
    getFundsRows({
      funds: {
        viewSoldFunds: false,
        period: ['year', 1],
        cache: {},
        items: [
          {
            item: 'foo fund',
            transactions: [],
            __optimistic: DELETE,
          },
          { item: 'bar fund', transactions: [] },
        ],
      },
    }),
  ).toStrictEqual([{ item: 'bar fund', transactions: [] }]);
});

test('getFundsRows orders by item', () => {
  expect.assertions(1);
  expect(
    getFundsRows({
      funds: {
        viewSoldFunds: false,
        period: ['year', 1],
        cache: {},
        items: [
          { item: 'foo fund', transactions: [] },
          { item: 'bar fund', transactions: [] },
        ],
      },
    }),
  ).toStrictEqual([
    { item: 'bar fund', transactions: [] },
    { item: 'foo fund', transactions: [] },
  ]);
});
