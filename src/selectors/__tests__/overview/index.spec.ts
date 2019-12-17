import sinon, { SinonStub } from 'sinon';

import { Summary, ProcessedSummary } from '~/types/overview';
import state from '~/__tests__/state';
import { State } from '~/selectors/overview/common';
import { withSpending, getProcessedColumns, getOverviewTable } from '~/selectors/overview';
import { getNetWorthSummary } from '~/selectors/overview/net-worth';

const testRandoms = [0.15, 0.99];

const getRandomStub = (): SinonStub<[], number> => {
  let randomIndex = 0;

  // eslint-disable-next-line no-plusplus
  return sinon.stub(Math, 'random').callsFake(() => testRandoms[randomIndex++ % 2]);
};

test('withSpending calculates the spend for each month', () => {
  expect.assertions(1);

  const summary: Summary = {
    funds: [],
    fundCosts: [],
    netWorth: [],
    income: [100, 7, 3, 11],
    bills: [1, 5, 3, 3],
    food: [2, 45, 17, 0],
    general: [3, 5, 86, 10],
    holiday: [5, 81, 13, 16],
    social: [7, 14, 19, 54],
  };

  expect(withSpending(summary)).toStrictEqual({
    ...summary,
    spending: [
      1 + 2 + 3 + 5 + 7,
      5 + 45 + 5 + 81 + 14,
      3 + 17 + 86 + 13 + 19,
      3 + 0 + 10 + 16 + 54,
    ],
  });
});

const testState = {
  ...state,
  funds: {
    ...state.funds,
    items: [
      {
        id: 'fund-A',
        item: 'some fund 1',
        transactions: [
          { date: new Date('2018-02-05'), units: 10, cost: 56123 },
          { date: new Date('2018-03-27'), units: -1.32, cost: -2382 },
        ],
      },
      {
        id: 'fund-B',
        item: 'some fund 2',
        transactions: [{ date: new Date('2018-03-17'), units: 51, cost: 10662 }],
      },
    ],
  },
};

const getTestProcessedColumns = (
  day = 23,
): { stateAtDay: State; expectedResult: Partial<ProcessedSummary> } => {
  const stateAtDay = {
    now: new Date(`2018-03-${day}T16:10Z`),
    overview: testState.overview,
    netWorth: testState.netWorth,
    funds: testState.funds,
  };

  const netWorthSummary = getNetWorthSummary({
    now: new Date(`2018-03-${day}T16:10Z`),
    overview: testState.overview,
    netWorth: testState.netWorth,
    funds: testState.funds,
  });

  const funds = [101459, 102981, 103293, 106162, 109111, 112141];
  const fundsOld = [94004, 105390, 110183, 100779];
  const fundCosts = [110000, 110000 + 56123, ...new Array(4).fill(110000 + 56123 - 2382)];
  const fundCostsOld = [100000, 99000, 100000, 100000];

  const bills = [1000, 900, 400, 1300, 2700, 0];
  const food = [50, 13, ...new Array(4).fill(Math.round((20 * 31) / day))];
  const general = [150, 90, Math.round((10 * 31) / day), 90, 90, 90];
  const holiday = [10, 1000, ...new Array(4).fill(Math.round((95 * 31) / day))];
  const social = [50, 65, Math.round((134 * 31) / day), 65, 65, 65];

  const spending = [
    1000 + 50 + 150 + 10 + 50,
    900 + 13 + 90 + 1000 + 65,
    400 +
      Math.round((20 * 31) / day) +
      Math.round((10 * 31) / day) +
      Math.round((95 * 31) / day) +
      Math.round((134 * 31) / day),
    1300 + Math.round((20 * 31) / day) + 90 + Math.round((95 * 31) / day) + 65,
    2700 + Math.round((20 * 31) / day) + 90 + Math.round((95 * 31) / day) + 65,
    0 + Math.round((20 * 31) / day) + 90 + Math.round((95 * 31) / day) + 65,
  ];

  const net = [
    2000 - spending[0],
    1900 - spending[1],
    1500 - spending[2],
    2500 - spending[3],
    2300 - spending[4],
    1800 - spending[5],
  ];

  const partialResult = {
    netWorth: netWorthSummary,
    funds,
    fundsOld,
    fundCosts,
    fundCostsOld,
    bills,
    food,
    general,
    holiday,
    social,
    spending,
    net,
  };

  const jan = netWorthSummary[0];
  const feb = netWorthSummary[0] + net[1] + funds[1] - funds[0] - 56123;
  const mar = netWorthSummary[1] + net[2] + funds[2] - funds[1] - -2382;

  if (day === 31) {
    // We're currently in March, at the end of the month, so we predict the next
    // month's value based on the actual value for March
    const apr = netWorthSummary[2] + net[3] + funds[3] - funds[2];
    const may = apr + net[4] + funds[4] - funds[3];
    const jun = may + net[5] + funds[5] - funds[4];

    const netWorthPredicted = [jan, feb, mar, apr, may, jun];

    // We don't include the current month's prediction in the combined list,
    // because we're at the end of the month
    const netWorthCombined = [
      netWorthSummary[0],
      netWorthSummary[1],
      netWorthSummary[2],
      apr,
      may,
      jun,
    ];

    return {
      stateAtDay,
      expectedResult: {
        ...partialResult,
        netWorthPredicted,
        netWorthCombined,
      },
    };
  }

  // We're currently in March, but not at the end of the month, so we predict the next
  // month's value based on the prediction for March
  const apr = mar + net[3] + funds[3] - funds[2];
  const may = apr + net[4] + funds[4] - funds[3];
  const jun = may + net[5] + funds[5] - funds[4];

  const netWorthPredicted = [jan, feb, mar, apr, may, jun];

  // We include the current month's prediction in the combined list,
  // because we're not yet at the end of the month
  const netWorthCombined = [netWorthSummary[0], netWorthSummary[1], mar, apr, may, jun];

  return {
    stateAtDay,
    expectedResult: {
      ...partialResult,
      netWorthPredicted,
      netWorthCombined,
    },
  };
};

test('getProcessedColumns processes the cost data, including making predictions and derived columns', () => {
  expect.assertions(13);

  const stub = getRandomStub();

  const { stateAtDay, expectedResult } = getTestProcessedColumns();
  const result = getProcessedColumns(stateAtDay);

  expect(result.funds).toStrictEqual(expectedResult.funds);
  expect(result.fundsOld).toStrictEqual(expectedResult.fundsOld);
  expect(result.fundCosts).toStrictEqual(expectedResult.fundCosts);
  expect(result.fundCostsOld).toStrictEqual(expectedResult.fundCostsOld);

  expect(result.bills).toStrictEqual(expectedResult.bills);
  expect(result.food).toStrictEqual(expectedResult.food);
  expect(result.general).toStrictEqual(expectedResult.general);
  expect(result.holiday).toStrictEqual(expectedResult.holiday);
  expect(result.social).toStrictEqual(expectedResult.social);

  expect(result.spending).toStrictEqual(expectedResult.spending);
  expect(result.net).toStrictEqual(expectedResult.net);

  expect(result.netWorthPredicted).toStrictEqual(expectedResult.netWorthPredicted);
  expect(result.netWorthCombined).toStrictEqual(expectedResult.netWorthCombined);

  stub.restore();
});

// eslint-disable-next-line max-len
test('getProcessedColumns uses the actual (non-predicted) net worth value for the current month, if at the last day', () => {
  expect.assertions(13);

  const stub = getRandomStub();

  const { stateAtDay, expectedResult } = getTestProcessedColumns(31);
  const result = getProcessedColumns(stateAtDay);

  expect(result.funds).toStrictEqual(expectedResult.funds);
  expect(result.fundsOld).toStrictEqual(expectedResult.fundsOld);
  expect(result.fundCosts).toStrictEqual(expectedResult.fundCosts);
  expect(result.fundCostsOld).toStrictEqual(expectedResult.fundCostsOld);

  expect(result.bills).toStrictEqual(expectedResult.bills);
  expect(result.food).toStrictEqual(expectedResult.food);
  expect(result.general).toStrictEqual(expectedResult.general);
  expect(result.holiday).toStrictEqual(expectedResult.holiday);
  expect(result.social).toStrictEqual(expectedResult.social);

  expect(result.spending).toStrictEqual(expectedResult.spending);
  expect(result.net).toStrictEqual(expectedResult.net);

  expect(result.netWorthPredicted).toStrictEqual(expectedResult.netWorthPredicted);
  expect(result.netWorthCombined).toStrictEqual(expectedResult.netWorthCombined);

  stub.restore();
});

test('getOverviewTable gets a list of rows for the overview table', () => {
  expect.assertions(1);
  const stub = getRandomStub();

  const { expectedResult } = getTestProcessedColumns();
  const table = getOverviewTable(state);

  // The colour generation is unit-tested in modules/color,
  // and the table colours are manually tested
  const tableWithoutColor = table.map(({ cells, ...rest }) => ({
    ...rest,
    cells: cells.map(({ rgb, ...cell }) => cell),
  }));

  expect(tableWithoutColor).toStrictEqual([
    {
      key: 'Jan-18',
      past: true,
      active: false,
      future: false,
      cells: [
        { column: ['month', 'Month'], value: 'Jan-18' },
        { column: ['funds', 'Stocks'], value: (expectedResult?.funds || [])[0] },
        { column: ['bills', 'Bills'], value: (expectedResult?.bills || [])[0] },
        { column: ['food', 'Food'], value: (expectedResult?.food || [])[0] },
        { column: ['general', 'General'], value: (expectedResult?.general || [])[0] },
        { column: ['holiday', 'Holiday'], value: (expectedResult?.holiday || [])[0] },
        { column: ['social', 'Social'], value: (expectedResult?.social || [])[0] },
        { column: ['income', 'Income'], value: state.overview.income[0] },
        { column: ['spending', 'Out'], value: (expectedResult?.spending || [])[0] },
        { column: ['net', 'Net'], value: (expectedResult?.net || [])[0] },
        {
          column: ['netWorthPredicted', 'Predicted'],
          value: (expectedResult?.netWorthPredicted || [])[0],
        },
        { column: ['netWorth', 'Net Worth'], value: (expectedResult?.netWorth || [])[0] },
      ],
    },
    {
      key: 'Feb-18',
      past: true,
      active: false,
      future: false,
      cells: [
        { column: ['month', 'Month'], value: 'Feb-18' },
        { column: ['funds', 'Stocks'], value: (expectedResult?.funds || [])[1] },
        { column: ['bills', 'Bills'], value: (expectedResult?.bills || [])[1] },
        { column: ['food', 'Food'], value: (expectedResult?.food || [])[1] },
        { column: ['general', 'General'], value: (expectedResult?.general || [])[1] },
        { column: ['holiday', 'Holiday'], value: (expectedResult?.holiday || [])[1] },
        { column: ['social', 'Social'], value: (expectedResult?.social || [])[1] },
        { column: ['income', 'Income'], value: state.overview.income[1] },
        { column: ['spending', 'Out'], value: (expectedResult?.spending || [])[1] },
        { column: ['net', 'Net'], value: (expectedResult?.net || [])[1] },
        {
          column: ['netWorthPredicted', 'Predicted'],
          value: (expectedResult?.netWorthPredicted || [])[1],
        },
        { column: ['netWorth', 'Net Worth'], value: (expectedResult?.netWorth || [])[1] },
      ],
    },
    {
      key: 'Mar-18',
      past: false,
      active: true,
      future: false,
      cells: [
        { column: ['month', 'Month'], value: 'Mar-18' },
        { column: ['funds', 'Stocks'], value: (expectedResult?.funds || [])[2] },
        { column: ['bills', 'Bills'], value: (expectedResult?.bills || [])[2] },
        { column: ['food', 'Food'], value: (expectedResult?.food || [])[2] },
        { column: ['general', 'General'], value: (expectedResult?.general || [])[2] },
        { column: ['holiday', 'Holiday'], value: (expectedResult?.holiday || [])[2] },
        { column: ['social', 'Social'], value: (expectedResult?.social || [])[2] },
        { column: ['income', 'Income'], value: state.overview.income[2] },
        { column: ['spending', 'Out'], value: (expectedResult?.spending || [])[2] },
        { column: ['net', 'Net'], value: (expectedResult?.net || [])[2] },
        {
          column: ['netWorthPredicted', 'Predicted'],
          value: (expectedResult?.netWorthPredicted || [])[2],
        },
        { column: ['netWorth', 'Net Worth'], value: (expectedResult?.netWorth || [])[2] },
      ],
    },
    {
      key: 'Apr-18',
      past: false,
      active: false,
      future: true,
      cells: [
        { column: ['month', 'Month'], value: 'Apr-18' },
        { column: ['funds', 'Stocks'], value: (expectedResult?.funds || [])[3] },
        { column: ['bills', 'Bills'], value: (expectedResult?.bills || [])[3] },
        { column: ['food', 'Food'], value: (expectedResult?.food || [])[3] },
        { column: ['general', 'General'], value: (expectedResult?.general || [])[3] },
        { column: ['holiday', 'Holiday'], value: (expectedResult?.holiday || [])[3] },
        { column: ['social', 'Social'], value: (expectedResult?.social || [])[3] },
        { column: ['income', 'Income'], value: state.overview.income[3] },
        { column: ['spending', 'Out'], value: (expectedResult?.spending || [])[3] },
        { column: ['net', 'Net'], value: (expectedResult?.net || [])[3] },
        {
          column: ['netWorthPredicted', 'Predicted'],
          value: (expectedResult?.netWorthPredicted || [])[3],
        },
        { column: ['netWorth', 'Net Worth'], value: (expectedResult?.netWorth || [])[3] },
      ],
    },
    {
      key: 'May-18',
      past: false,
      active: false,
      future: true,
      cells: [
        { column: ['month', 'Month'], value: 'May-18' },
        { column: ['funds', 'Stocks'], value: (expectedResult?.funds || [])[4] },
        { column: ['bills', 'Bills'], value: (expectedResult?.bills || [])[4] },
        { column: ['food', 'Food'], value: (expectedResult?.food || [])[4] },
        { column: ['general', 'General'], value: (expectedResult?.general || [])[4] },
        { column: ['holiday', 'Holiday'], value: (expectedResult?.holiday || [])[4] },
        { column: ['social', 'Social'], value: (expectedResult?.social || [])[4] },
        { column: ['income', 'Income'], value: state.overview.income[4] },
        { column: ['spending', 'Out'], value: (expectedResult?.spending || [])[4] },
        { column: ['net', 'Net'], value: (expectedResult?.net || [])[4] },
        {
          column: ['netWorthPredicted', 'Predicted'],
          value: (expectedResult?.netWorthPredicted || [])[4],
        },
        { column: ['netWorth', 'Net Worth'], value: (expectedResult?.netWorth || [])[4] },
      ],
    },
    {
      key: 'Jun-18',
      past: false,
      active: false,
      future: true,
      cells: [
        { column: ['month', 'Month'], value: 'Jun-18' },
        { column: ['funds', 'Stocks'], value: (expectedResult?.funds || [])[5] },
        { column: ['bills', 'Bills'], value: (expectedResult?.bills || [])[5] },
        { column: ['food', 'Food'], value: (expectedResult?.food || [])[5] },
        { column: ['general', 'General'], value: (expectedResult?.general || [])[5] },
        { column: ['holiday', 'Holiday'], value: (expectedResult?.holiday || [])[5] },
        { column: ['social', 'Social'], value: (expectedResult?.social || [])[5] },
        { column: ['income', 'Income'], value: state.overview.income[5] },
        { column: ['spending', 'Out'], value: (expectedResult?.spending || [])[5] },
        { column: ['net', 'Net'], value: (expectedResult?.net || [])[5] },
        {
          column: ['netWorthPredicted', 'Predicted'],
          value: (expectedResult?.netWorthPredicted || [])[5],
        },
        { column: ['netWorth', 'Net Worth'], value: (expectedResult?.netWorth || [])[5] },
      ],
    },
  ]);

  stub.restore();
});
