import { getNetWorthSummary } from './net-worth';
import { getProcessedCost, getOverviewTable } from '.';
import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers/types';
import { testState as state } from '~client/test-data/state';
import { mockRandom } from '~client/test-utils/random';

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

    const funds = [100779, 101459, 102981, 104281, 105597, 106930, 108280];

    describe('if the current day is not the last day of the month', () => {
      const spending = [1260, 2068, 749, 960, 310, 310, 310];
      const fundsOld = [94004, 105390, 110183];

      const net = [740, -168, 751, 1540, 1990, 1490, 2290];

      const netWorthSummary = getNetWorthSummary(testState);

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

      const income = [2000, 1900, 1500, 2500, 2300, 1800, 2600];
      const bills = [1000, 900, 400, 650, 0, 0, 0];
      const food = [50, 13, 27, 27, 27, 27, 27];
      const general = [150, 90, 13, 90, 90, 90, 90];
      const social = [50, 65, 181, 65, 65, 65, 65];
      const holiday = [10, 1000, 128, 128, 128, 128, 128];

      it.each`
        description                             | prop                   | value
        ${'spending data'}                      | ${'spending'}          | ${spending}
        ${'funds data (including predictions)'} | ${'funds'}             | ${funds}
        ${'old funds data'}                     | ${'fundsOld'}          | ${fundsOld}
        ${'net income after expenses'}          | ${'net'}               | ${net}
        ${'predicted net worth data'}           | ${'netWorthPredicted'} | ${netWorthPredicted}
        ${'combined net worth data'}            | ${'netWorthCombined'}  | ${netWorthCombined}
        ${'actual net worth data'}              | ${'netWorth'}          | ${netWorthSummary}
        ${'income data'}                        | ${'income'}            | ${income}
        ${'bills data'}                         | ${'bills'}             | ${bills}
        ${'food data'}                          | ${'food'}              | ${food}
        ${'general data'}                       | ${'general'}           | ${general}
        ${'social data'}                        | ${'social'}            | ${social}
        ${'holiday data'}                       | ${'holiday'}           | ${holiday}
      `('should add $prop', ({ prop, value }) => {
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
      const testStateEndOfMonth: State = {
        ...testState,
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

      it('should use the actual (non-predicted) net worth value for the current month', () => {
        expect.assertions(1);
        const netWorthSummary = getNetWorthSummary(testStateEndOfMonth);

        const net = [740, -168, 841, 1580, 2030, 1530, 2330];

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

        expect(getProcessedCost(nowEndOfMonth)(testStateEndOfMonth)).toStrictEqual(
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
                "rgb": "#caefce",
                "value": 740,
              },
              "netWorth": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "netWorthCombined": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "netWorthPredicted": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "social": Object {
                "rgb": "#fff",
                "value": 50,
              },
              "spending": Object {
                "rgb": "#d36767",
                "value": 1260,
              },
            },
            "future": false,
            "month": "Jan-18",
            "past": true,
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
                "rgb": "#eef1f2",
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
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 1298227.25,
              },
              "netWorthCombined": Object {
                "rgb": "#92df9b",
                "value": 1298227.25,
              },
              "netWorthPredicted": Object {
                "rgb": "#fff",
                "value": 512,
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
            "month": "Feb-18",
            "past": true,
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
                "rgb": "#c9d1d5",
                "value": 102981,
              },
              "general": Object {
                "rgb": "#fff",
                "value": 13,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 128,
              },
              "income": Object {
                "rgb": "#fff",
                "value": 1500,
              },
              "net": Object {
                "rgb": "#c9efcd",
                "value": 751,
              },
              "netWorth": Object {
                "rgb": "#50cc5f",
                "value": 1039156,
              },
              "netWorthCombined": Object {
                "rgb": "#92df9b",
                "value": 1300500.25,
              },
              "netWorthPredicted": Object {
                "rgb": "#92df9b",
                "value": 1300500.25,
              },
              "social": Object {
                "rgb": "#bf9e24",
                "value": 181,
              },
              "spending": Object {
                "rgb": "#df9292",
                "value": 749,
              },
            },
            "future": false,
            "month": "Mar-18",
            "past": false,
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
                "rgb": "#aab7bd",
                "value": 104281,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 128,
              },
              "income": Object {
                "rgb": "#36c448",
                "value": 2500,
              },
              "net": Object {
                "rgb": "#8ede98",
                "value": 1540,
              },
              "netWorth": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "netWorthCombined": Object {
                "rgb": "#92df9b",
                "value": 1303340.25,
              },
              "netWorthPredicted": Object {
                "rgb": "#92df9b",
                "value": 1303340.25,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#da8080",
                "value": 960,
              },
            },
            "future": true,
            "month": "Apr-18",
            "past": false,
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
                "rgb": "#8d9fa7",
                "value": 105597,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 128,
              },
              "income": Object {
                "rgb": "#5bcf69",
                "value": 2300,
              },
              "net": Object {
                "rgb": "#4ecb5e",
                "value": 1990,
              },
              "netWorth": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "netWorthCombined": Object {
                "rgb": "#6cd479",
                "value": 1306646.25,
              },
              "netWorthPredicted": Object {
                "rgb": "#6cd479",
                "value": 1306646.25,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#fff",
                "value": 310,
              },
            },
            "future": true,
            "month": "May-18",
            "past": false,
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
                "rgb": "#718690",
                "value": 106930,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 128,
              },
              "income": Object {
                "rgb": "#bdecc3",
                "value": 1800,
              },
              "net": Object {
                "rgb": "#93e09d",
                "value": 1490,
              },
              "netWorth": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "netWorthCombined": Object {
                "rgb": "#4dcb5c",
                "value": 1309469.25,
              },
              "netWorthPredicted": Object {
                "rgb": "#4dcb5c",
                "value": 1309469.25,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#fff",
                "value": 310,
              },
            },
            "future": true,
            "month": "Jun-18",
            "past": false,
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
                "rgb": "#546e7a",
                "value": 108280,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 128,
              },
              "income": Object {
                "rgb": "#24bf37",
                "value": 2600,
              },
              "net": Object {
                "rgb": "#24bf37",
                "value": 2290,
              },
              "netWorth": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "netWorthCombined": Object {
                "rgb": "#24bf37",
                "value": 1313109.25,
              },
              "netWorthPredicted": Object {
                "rgb": "#24bf37",
                "value": 1313109.25,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#fff",
                "value": 310,
              },
            },
            "future": true,
            "month": "Jul-18",
            "past": false,
          },
        ]
      `);
    });
  });
});
