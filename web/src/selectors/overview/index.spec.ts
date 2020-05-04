import { State } from '~client/reducers/types';
import state from '~client/test-data/state';
import { getProcessedCost, getOverviewTable } from '.';
import { getNetWorthSummary } from './net-worth';
import { getTransactionsList } from '~client/modules/data';
import { mockRandom } from '~client/mocks/random';

describe('Net worth selectors', () => {
  beforeEach(() => {
    mockRandom([0.15, 0.99]);
  });

  describe('getProcessedCost', () => {
    const testState: State = {
      ...state,
      now: new Date('2018-03-23T11:54:23.000Z'),
      funds: {
        ...state.funds,
        items: [
          {
            id: 'fund-A',
            item: 'some fund 1',
            transactions: getTransactionsList([
              { date: new Date('2018-02-05'), units: 10, cost: 56123 },
              { date: new Date('2018-03-27'), units: -1.32, cost: -2382 },
            ]),
          },
          {
            id: 'fund-B',
            item: 'some fund 2',
            transactions: getTransactionsList([
              { date: new Date('2018-03-17'), units: 51, cost: 10662 },
            ]),
          },
        ],
      },
    };

    it('should process the cost data, including making predictions and derived columns', () => {
      expect.assertions(1);

      const netWorthSummary = getNetWorthSummary(testState);

      const net = [740, -168, 751, 1540, 1990, 1490, 2290];
      const funds = [100779, 101459, 102981, 105841, 108781, 111802, 114907];

      const jan = netWorthSummary[0];
      const feb = netWorthSummary[0] + net[1] + funds[1] - funds[0] - 56123;
      const mar = netWorthSummary[1] + net[2] + funds[2] - funds[1] + 2382 - 10662;

      // We're currently in March, but not at the end of the month, so we predict the next
      // month's value based on the prediction for March
      const apr = mar + net[3] + funds[3] - funds[2];
      const may = apr + net[4] + funds[4] - funds[3];
      const jun = may + net[5] + funds[5] - funds[4];
      const jul = jun + net[6] + funds[6] - funds[5];

      const netWorthPredicted = [jan, feb, mar, apr, may, jun, jul];

      // We include the current month's prediction in the combined list,
      // because we're not yet at the end of the month
      const netWorthCombined = [netWorthSummary[0], netWorthSummary[1], mar, apr, may, jun, jul];

      expect(getProcessedCost(testState)).toStrictEqual(
        expect.objectContaining({
          spending: [1260, 2068, 749, 960, 310, 310, 310],
          funds,
          fundsOld: [94004, 105390, 110183],
          income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
          bills: [1000, 900, 400, 650, 0, 0, 0],
          food: [50, 13, 27, 27, 27, 27, 27],
          general: [150, 90, 13, 90, 90, 90, 90],
          social: [50, 65, 181, 65, 65, 65, 65],
          holiday: [10, 1000, 128, 128, 128, 128, 128],
          net,
          netWorthPredicted,
          netWorthCombined,
          netWorth: netWorthSummary,
        }),
      );
    });

    describe('if the current day is the last of the month', () => {
      const testStateEndOfMonth: State = {
        ...testState,
        now: new Date('2018-03-31'),
        funds: {
          ...testState.funds,
          items: [
            {
              id: 'fund-A',
              item: 'some fund 1',
              transactions: getTransactionsList([
                { date: new Date('2018-02-05'), units: 10, cost: 56123 },
                { date: new Date('2018-03-27'), units: -1.32, cost: -2382 },
              ]),
            },
            {
              id: 'fund-B',
              item: 'some fund 2',
              transactions: getTransactionsList([
                { date: new Date('2018-03-17'), units: 51, cost: 10662 },
              ]),
            },
          ],
        },
      };

      it('should use the actual (non-predicted) net worth value for the current month, if at the last day', () => {
        expect.assertions(1);
        const netWorthSummary = getNetWorthSummary(testStateEndOfMonth);

        const net = [740, -168, 841, 1580, 2030, 1530, 2330];
        const funds = [100779, 101459, 102981, 105841, 108781, 111802, 114907];

        const jan = netWorthSummary[0];
        const feb = netWorthSummary[0] + net[1] + funds[1] - funds[0] - 56123;
        const mar = netWorthSummary[1] + net[2] + funds[2] - funds[1] + 2382 - 10662;

        // We're currently in March, at the end of the month, so we predict the next
        // month's value based on the actual value for March
        const apr = netWorthSummary[2] + net[3] + funds[3] - funds[2];
        const may = apr + net[4] + funds[4] - funds[3];
        const jun = may + net[5] + funds[5] - funds[4];
        const jul = jun + net[6] + funds[6] - funds[5];

        const netWorthPredicted = [jan, feb, mar, apr, may, jun, jul];

        // We don't include the current month's prediction in the combined list,
        // because we're at the end of the month
        const netWorthCombined = [
          netWorthSummary[0],
          netWorthSummary[1],
          netWorthSummary[2],
          apr,
          may,
          jun,
          jul,
        ];

        expect(getProcessedCost(testStateEndOfMonth)).toStrictEqual(
          expect.objectContaining({
            spending: [1260, 2068, 659, 920, 270, 270, 270],
            funds,
            net,
            netWorthPredicted,
            netWorthCombined,
            netWorth: netWorthSummary,
          }),
        );
      });
    });
  });

  describe('getOverviewTable', () => {
    it('should get a list of rows for the overview table', () => {
      expect.assertions(1);
      const table = getOverviewTable(state);

      expect(table).toStrictEqual([
        {
          key: 'Jan-18',
          past: true,
          active: false,
          future: false,
          cells: [
            expect.objectContaining({
              column: ['month', 'Month'],
              value: 'Jan-18',
            }),
            expect.objectContaining({
              column: ['funds', 'Stocks'],
              value: 100779,
            }),
            expect.objectContaining({
              column: ['bills', 'Bills'],
              value: 1000,
            }),
            expect.objectContaining({
              column: ['food', 'Food'],
              value: 50,
            }),
            expect.objectContaining({
              column: ['general', 'General'],
              value: 150,
            }),
            expect.objectContaining({
              column: ['holiday', 'Holiday'],
              value: 10,
            }),
            expect.objectContaining({
              column: ['social', 'Social'],
              value: 50,
            }),
            expect.objectContaining({
              column: ['income', 'Income'],
              value: 2000,
            }),
            expect.objectContaining({
              column: ['spending', 'Out'],
              value: 1260,
            }),
            expect.objectContaining({
              column: ['net', 'Net'],
              value: 740,
            }),
            expect.objectContaining({
              column: ['netWorthPredicted', 'Predicted'],
              value: 0,
            }),
            expect.objectContaining({
              column: ['netWorth', 'Net Worth'],
              value: 0,
            }),
          ],
        },
        {
          key: 'Feb-18',
          past: true,
          active: false,
          future: false,
          cells: [
            expect.objectContaining({
              column: ['month', 'Month'],
              value: 'Feb-18',
            }),
            expect.objectContaining({
              column: ['funds', 'Stocks'],
              value: 101459,
            }),
            expect.objectContaining({ column: ['bills', 'Bills'], value: 900 }),
            expect.objectContaining({ column: ['food', 'Food'], value: 13 }),
            expect.objectContaining({ column: ['general', 'General'], value: 90 }),
            expect.objectContaining({
              column: ['holiday', 'Holiday'],
              value: 1000,
            }),
            expect.objectContaining({ column: ['social', 'Social'], value: 65 }),
            expect.objectContaining({ column: ['income', 'Income'], value: 1900 }),
            expect.objectContaining({ column: ['spending', 'Out'], value: 2068 }),
            expect.objectContaining({ column: ['net', 'Net'], value: -168 }),
            expect.objectContaining({
              column: ['netWorthPredicted', 'Predicted'],
              value: 512,
            }),
            expect.objectContaining({
              column: ['netWorth', 'Net Worth'],
              value: 1298227.25,
            }),
          ],
        },
        {
          key: 'Mar-18',
          past: false,
          active: true,
          future: false,
          cells: [
            expect.objectContaining({ column: ['month', 'Month'], value: 'Mar-18' }),
            expect.objectContaining({ column: ['funds', 'Stocks'], value: 102981 }),
            expect.objectContaining({ column: ['bills', 'Bills'], value: 400 }),
            expect.objectContaining({ column: ['food', 'Food'], value: 27 }),
            expect.objectContaining({ column: ['general', 'General'], value: 13 }),
            expect.objectContaining({ column: ['holiday', 'Holiday'], value: 128 }),
            expect.objectContaining({ column: ['social', 'Social'], value: 181 }),
            expect.objectContaining({ column: ['income', 'Income'], value: 1500 }),
            expect.objectContaining({ column: ['spending', 'Out'], value: 749 }),
            expect.objectContaining({ column: ['net', 'Net'], value: 751 }),
            expect.objectContaining({
              column: ['netWorthPredicted', 'Predicted'],
              value: 1300500.25,
            }),
            expect.objectContaining({ column: ['netWorth', 'Net Worth'], value: 1039156 }),
          ],
        },
        {
          key: 'Apr-18',
          past: false,
          active: false,
          future: true,
          cells: [
            expect.objectContaining({ column: ['month', 'Month'], value: 'Apr-18' }),
            expect.objectContaining({ column: ['funds', 'Stocks'], value: 105841 }),
            expect.objectContaining({ column: ['bills', 'Bills'], value: 650 }),
            expect.objectContaining({ column: ['food', 'Food'], value: 27 }),
            expect.objectContaining({ column: ['general', 'General'], value: 90 }),
            expect.objectContaining({ column: ['holiday', 'Holiday'], value: 128 }),
            expect.objectContaining({ column: ['social', 'Social'], value: 65 }),
            expect.objectContaining({ column: ['income', 'Income'], value: 2500 }),
            expect.objectContaining({ column: ['spending', 'Out'], value: 960 }),
            expect.objectContaining({ column: ['net', 'Net'], value: 1540 }),
            expect.objectContaining({
              column: ['netWorthPredicted', 'Predicted'],
              value: 1304900.25,
            }),
            expect.objectContaining({ column: ['netWorth', 'Net Worth'], value: 0 }),
          ],
        },
        {
          key: 'May-18',
          past: false,
          active: false,
          future: true,
          cells: [
            expect.objectContaining({ column: ['month', 'Month'], value: 'May-18' }),
            expect.objectContaining({ column: ['funds', 'Stocks'], value: 108781 }),
            expect.objectContaining({ column: ['bills', 'Bills'], value: 0 }),
            expect.objectContaining({ column: ['food', 'Food'], value: 27 }),
            expect.objectContaining({ column: ['general', 'General'], value: 90 }),
            expect.objectContaining({ column: ['holiday', 'Holiday'], value: 128 }),
            expect.objectContaining({ column: ['social', 'Social'], value: 65 }),
            expect.objectContaining({ column: ['income', 'Income'], value: 2300 }),
            expect.objectContaining({ column: ['spending', 'Out'], value: 310 }),
            expect.objectContaining({ column: ['net', 'Net'], value: 1990 }),
            expect.objectContaining({
              column: ['netWorthPredicted', 'Predicted'],
              value: 1309830.25,
            }),
            expect.objectContaining({ column: ['netWorth', 'Net Worth'], value: 0 }),
          ],
        },
        {
          key: 'Jun-18',
          past: false,
          active: false,
          future: true,
          cells: [
            expect.objectContaining({ column: ['month', 'Month'], value: 'Jun-18' }),
            expect.objectContaining({ column: ['funds', 'Stocks'], value: 111802 }),
            expect.objectContaining({ column: ['bills', 'Bills'], value: 0 }),
            expect.objectContaining({ column: ['food', 'Food'], value: 27 }),
            expect.objectContaining({ column: ['general', 'General'], value: 90 }),
            expect.objectContaining({ column: ['holiday', 'Holiday'], value: 128 }),
            expect.objectContaining({ column: ['social', 'Social'], value: 65 }),
            expect.objectContaining({ column: ['income', 'Income'], value: 1800 }),
            expect.objectContaining({ column: ['spending', 'Out'], value: 310 }),
            expect.objectContaining({ column: ['net', 'Net'], value: 1490 }),
            expect.objectContaining({
              column: ['netWorthPredicted', 'Predicted'],
              value: 1314341.25,
            }),
            expect.objectContaining({ column: ['netWorth', 'Net Worth'], value: 0 }),
          ],
        },
        {
          key: 'Jul-18',
          past: false,
          active: false,
          future: true,
          cells: [
            expect.objectContaining({ column: ['month', 'Month'], value: 'Jul-18' }),
            expect.objectContaining({ column: ['funds', 'Stocks'], value: 114907 }),
            expect.objectContaining({ column: ['bills', 'Bills'], value: 0 }),
            expect.objectContaining({ column: ['food', 'Food'], value: 27 }),
            expect.objectContaining({ column: ['general', 'General'], value: 90 }),
            expect.objectContaining({ column: ['holiday', 'Holiday'], value: 128 }),
            expect.objectContaining({ column: ['social', 'Social'], value: 65 }),
            expect.objectContaining({ column: ['income', 'Income'], value: 2600 }),
            expect.objectContaining({ column: ['spending', 'Out'], value: 310 }),
            expect.objectContaining({ column: ['net', 'Net'], value: 2290 }),
            expect.objectContaining({
              column: ['netWorthPredicted', 'Predicted'],
              value: 1319736.25,
            }),
            expect.objectContaining({ column: ['netWorth', 'Net Worth'], value: 0 }),
          ],
        },
      ]);
    });
  });
});
