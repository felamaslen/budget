import { replaceAtIndex } from 'replace-array';
import numericHash from 'string-hash';
import { getNetWorthSummary } from './net-worth';
import { getProcessedCost, getOverviewTable } from '.';
import type { State } from '~client/reducers/types';
import { testState as state } from '~client/test-data';
import { mockRandom } from '~client/test-utils/random';
import { PageListStandard, PageNonStandard } from '~client/types/enum';
import type { Cost } from '~client/types/gql';

describe('Overview selectors', () => {
  beforeEach(() => {
    mockRandom([0.15, 0.99]);
  });

  const now = new Date('2018-03-23T11:54:23.127Z');

  describe('getProcessedCost', () => {
    const testState: State = {
      ...state,
      funds: {
        ...state.funds,
        items: [
          {
            id: numericHash('fund-A'),
            item: 'some fund 1',
            transactions: [
              { date: new Date('2018-02-05'), units: 10, price: 5612, fees: 3, taxes: 0 },
              { date: new Date('2018-03-27'), units: -1.32, price: 1804, fees: 0.72, taxes: 0 },
            ],
            allocationTarget: 0,
          },
          {
            id: numericHash('fund-B'),
            item: 'some fund 2',
            transactions: [
              { date: new Date('2018-03-17'), units: 51, price: 109, fees: 3, taxes: 0 },
            ],
            allocationTarget: 0,
          },
        ],
        prices: {
          [numericHash('fund-A')]: [{ startIndex: 0, values: [4973] }],
          [numericHash('fund-B')]: [{ startIndex: 0, values: [113] }],
        },
      },
    };

    describe('if the current day is not the last day of the month', () => {
      const spending = [1260, 2068, 713, 927, 277, 277, 277];

      const fundsOld = [94004, 105390, 110183];
      const currentFundsValue = 10 * 4973 + 51 * 113;
      const fundsCurrent = [100779, 101459, currentFundsValue, 104281, 105597, 106930, 108280];

      const net = [740, -168, 787, 1573, 2023, 1523, 2323];

      const netWorthSummary = getNetWorthSummary(testState);

      const jan = netWorthSummary[0];
      const feb = netWorthSummary[0] + net[1] + fundsCurrent[1] - fundsCurrent[0] - (10 * 5612 + 3);
      const mar =
        netWorthSummary[1] +
        net[2] +
        fundsCurrent[2] -
        fundsCurrent[1] +
        (1804 * 1.32 - 0.72) -
        (109 * 51 + 3);

      // We're currently in March, but not at the end of the month, so we predict the next
      // month's value based on the prediction for March
      const apr = mar + net[3] + fundsCurrent[3] - fundsCurrent[2];
      const may = apr + net[4] + fundsCurrent[4] - fundsCurrent[3];
      const jun = may + net[5] + fundsCurrent[5] - fundsCurrent[4];
      const jul = jun + net[6] + fundsCurrent[6] - fundsCurrent[5];

      const netWorthPredicted = [jan, feb, mar, apr, may, jun, jul];

      // We include the current month's prediction in the combined list,
      // because we're not yet at the end of the month
      const netWorthCombined = [netWorthSummary[0], netWorthSummary[1], mar, apr, may, jun, jul];

      const income = [2000, 1900, 1500, 2500, 2300, 1800, 2600];
      const bills = [1000, 900, 400, 650, 0, 0, 0];
      const food = [50, 13, 27, 27, 27, 27, 27];
      const general = [150, 90, 10, 90, 90, 90, 90];
      const social = [50, 65, 181, 65, 65, 65, 65];
      const holiday = [10, 1000, 95, 95, 95, 95, 95];

      const savingsRatio = [
        1 - (1000 + 50 + 150 + 50 + 10) / 2000,
        0,
        1 - (400 + 27 + 10 + 181 + 95) / 1500,
        1 - (650 + 27 + 90 + 65 + 95) / 2500,
        1 - (0 + 27 + 90 + 65 + 95) / 2300,
        1 - (0 + 27 + 90 + 65 + 95) / 1800,
        1 - (0 + 27 + 90 + 65 + 95) / 2600,
      ];

      it.each`
        description                    | prop                   | value
        ${'spending data'}             | ${'spending'}          | ${spending}
        ${'current funds data'}        | ${'funds'}             | ${fundsCurrent}
        ${'old funds data'}            | ${'fundsOld'}          | ${fundsOld}
        ${'net income after expenses'} | ${'net'}               | ${net}
        ${'predicted net worth data'}  | ${'netWorthPredicted'} | ${netWorthPredicted}
        ${'combined net worth data'}   | ${'netWorthCombined'}  | ${netWorthCombined}
        ${'actual net worth data'}     | ${'netWorth'}          | ${netWorthSummary}
        ${'savings ratio data'}        | ${'savingsRatio'}      | ${savingsRatio}
        ${'income data'}               | ${'income'}            | ${income}
        ${'bills data'}                | ${'bills'}             | ${bills}
        ${'food data'}                 | ${'food'}              | ${food}
        ${'general data'}              | ${'general'}           | ${general}
        ${'social data'}               | ${'social'}            | ${social}
        ${'holiday data'}              | ${'holiday'}           | ${holiday}
      `('should add $description', ({ prop, value }) => {
        expect.assertions(1);
        expect(getProcessedCost(now)(testState)).toStrictEqual(
          expect.objectContaining({
            [prop]: value,
          }),
        );
      });
    });

    describe('if the current day is the last of the month', () => {
      const nowEndOfMonth = new Date('2018-03-31T11:28:10Z');

      it('should use the actual (non-predicted) net worth value for the current month', () => {
        expect.assertions(1);
        const netWorthSummary = getNetWorthSummary(testState);

        const currentFundsValue = (10 - 1.32) * 4973 + 51 * 113;
        const fundsCurrent = [100779, 101459, currentFundsValue, 104281, 105597, 106930, 108280];

        const net = [740, -168, 841, 1580, 2030, 1530, 2330];

        const jan = netWorthSummary[0];
        const feb =
          netWorthSummary[0] + net[1] + fundsCurrent[1] - fundsCurrent[0] - (10 * 5612 + 3);
        const mar =
          netWorthSummary[1] +
          net[2] +
          fundsCurrent[2] -
          fundsCurrent[1] +
          (1804 * 1.32 - 0.72) -
          (109 * 51 + 3);

        // We're currently in March, at the end of the month, so we predict the next
        // month's value based on the actual value for March
        const apr = netWorthSummary[2] + net[3] + fundsCurrent[3] - fundsCurrent[2];
        const may = apr + net[4] + fundsCurrent[4] - fundsCurrent[3];
        const jun = may + net[5] + fundsCurrent[5] - fundsCurrent[4];
        const jul = jun + net[6] + fundsCurrent[6] - fundsCurrent[5];

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

        const bills = [1000, 900, 400, 650, 0, 0, 0];
        const food = [50, 13, 20, 20, 20, 20, 20];
        const general = [150, 90, 10, 90, 90, 90, 90];
        const social = [50, 65, 134, 65, 65, 65, 65];
        const holiday = [10, 1000, 95, 95, 95, 95, 95];

        const spending = [1260, 2068, 659, 920, 270, 270, 270];

        expect(getProcessedCost(nowEndOfMonth)(testState)).toStrictEqual(
          expect.objectContaining({
            spending,
            bills,
            food,
            general,
            social,
            holiday,
            funds: fundsCurrent,
            net,
            netWorthPredicted,
            netWorthCombined,
            netWorth: netWorthSummary,
          }),
        );
      });
    });

    describe.each`
      case                         | key                        | value
      ${'income is zero'}          | ${PageListStandard.Income} | ${0}
      ${'spending exceeds income'} | ${PageListStandard.Bills}  | ${16600023}
    `('if $case for a given month', ({ key, value }) => {
      const testStateWithZeroIncome: State = {
        ...testState,
        [PageNonStandard.Overview]: {
          ...testState[PageNonStandard.Overview],
          cost: {
            ...testState[PageNonStandard.Overview].cost,
            [key]: replaceAtIndex(
              testState[PageNonStandard.Overview].cost[key as Exclude<keyof Cost, '__typename'>],
              1,
              value,
            ),
          },
        },
      };

      it('should set the savings ratio to 0', () => {
        expect.assertions(1);
        expect(getProcessedCost(now)(testStateWithZeroIncome)).toStrictEqual(
          expect.objectContaining({
            savingsRatio: [
              expect.any(Number),
              0,
              expect.any(Number),
              expect.any(Number),
              expect.any(Number),
              expect.any(Number),
              expect.any(Number),
            ],
          }),
        );
      });
    });

    describe('when there are updated fund prices', () => {
      const testStateWithFundPrices: State = {
        ...testState,
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          items: [
            {
              id: 193,
              item: 'My stock',
              transactions: [
                { date: new Date('2018-01-03'), units: 101, price: 56.23, fees: 10, taxes: 11 },
              ],
            },
          ],
          todayPrices: {
            193: 67.93,
          },
        },
      };

      it('should recalculate the current month fund value', () => {
        expect.assertions(1);
        const result = getProcessedCost(now)(testStateWithFundPrices);
        expect(result.funds[2]).toBeCloseTo(101 * 67.93);
      });
    });
  });

  describe('getOverviewTable', () => {
    it('should get a list of rows for the overview table', () => {
      expect.assertions(1);
      const table = getOverviewTable(now)(state);

      expect(table).toMatchInlineSnapshot(`
        Array [
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#b71c1c",
                "value": 1000,
              },
              "food": Object {
                "rgb": "#43a047",
                "value": 50,
              },
              "funds": Object {
                "rgb": "#fff",
                "value": 100779,
              },
              "general": Object {
                "rgb": "#01579b",
                "value": 150,
              },
              "holiday": Object {
                "rgb": "#fff",
                "value": 10,
              },
              "income": Object {
                "rgb": "#92df9b",
                "value": 2000,
              },
              "net": Object {
                "rgb": "#cbf0cf",
                "value": 740,
              },
              "netWorthCombined": Object {
                "rgb": "#fff",
                "value": 1680500,
              },
              "social": Object {
                "rgb": "#fff",
                "value": 50,
              },
              "spending": Object {
                "rgb": "#d26565",
                "value": 1260,
              },
            },
            "future": false,
            "month": 1,
            "monthText": "Jan-18",
            "past": true,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#bd2f2f",
                "value": 900,
              },
              "food": Object {
                "rgb": "#fff",
                "value": 13,
              },
              "funds": Object {
                "rgb": "#f3f5f6",
                "value": 101459,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#00897b",
                "value": 1000,
              },
              "income": Object {
                "rgb": "#a7e5af",
                "value": 1900,
              },
              "net": Object {
                "rgb": "#NaNNaNNaN",
                "value": -168,
              },
              "netWorthCombined": Object {
                "rgb": "#92df9b",
                "value": 4420593,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#bf2424",
                "value": 2068,
              },
            },
            "future": false,
            "month": 2,
            "monthText": "Feb-18",
            "past": true,
            "year": 2018,
          },
          Object {
            "active": true,
            "cells": Object {
              "bills": Object {
                "rgb": "#db8e8e",
                "value": 400,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "funds": Object {
                "rgb": "#546e7a",
                "value": 399098.2,
              },
              "general": Object {
                "rgb": "#fff",
                "value": 10,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#fff",
                "value": 1500,
              },
              "net": Object {
                "rgb": "#c7efcc",
                "value": 787,
              },
              "netWorthCombined": Object {
                "rgb": "#24bf37",
                "value": 4719019.2,
              },
              "social": Object {
                "rgb": "#bf9e24",
                "value": 181,
              },
              "spending": Object {
                "rgb": "#df9292",
                "value": 713,
              },
            },
            "future": false,
            "month": 3,
            "monthText": "Mar-18",
            "past": false,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#cc5e5e",
                "value": 650,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "funds": Object {
                "rgb": "#c1cacf",
                "value": 104281,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#36c448",
                "value": 2500,
              },
              "net": Object {
                "rgb": "#8ede98",
                "value": 1573,
              },
              "netWorthCombined": Object {
                "rgb": "#92df9b",
                "value": 4425775,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#da8080",
                "value": 927,
              },
            },
            "future": true,
            "month": 4,
            "monthText": "Apr-18",
            "past": false,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "funds": Object {
                "rgb": "#aab7bd",
                "value": 105597,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#5bcf69",
                "value": 2300,
              },
              "net": Object {
                "rgb": "#4ecb5e",
                "value": 2023,
              },
              "netWorthCombined": Object {
                "rgb": "#92df9b",
                "value": 4429114,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#fff",
                "value": 277,
              },
            },
            "future": true,
            "month": 5,
            "monthText": "May-18",
            "past": false,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "funds": Object {
                "rgb": "#a9b6bc",
                "value": 106930,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#bdecc3",
                "value": 1800,
              },
              "net": Object {
                "rgb": "#93e09d",
                "value": 1523,
              },
              "netWorthCombined": Object {
                "rgb": "#90df9a",
                "value": 4431970,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#fff",
                "value": 277,
              },
            },
            "future": true,
            "month": 6,
            "monthText": "Jun-18",
            "past": false,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "funds": Object {
                "rgb": "#a9b6bc",
                "value": 108280,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#24bf37",
                "value": 2600,
              },
              "net": Object {
                "rgb": "#24bf37",
                "value": 2323,
              },
              "netWorthCombined": Object {
                "rgb": "#8fde99",
                "value": 4435643,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#fff",
                "value": 277,
              },
            },
            "future": true,
            "month": 7,
            "monthText": "Jul-18",
            "past": false,
            "year": 2018,
          },
        ]
      `);
    });
  });
});
