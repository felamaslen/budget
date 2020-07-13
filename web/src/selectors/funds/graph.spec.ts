import { getStartTime, getCacheTimes, getFundItems, getFundLines } from './graph';
import { Period, Mode, GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colorKey } from '~client/modules/color';
import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers';
import { colors } from '~client/styled/variables';
import { testState, testStartTime, testCacheTimes } from '~client/test-data';
import { Page, FundItem } from '~client/types';

describe('Fund selectors / graph', () => {
  const today = new Date('2020-04-20');
  const state: State = {
    ...testState,
    funds: {
      ...testState.funds,
      viewSoldFunds: true,
      period: Period.year1,
    },
  };

  describe('getStartTime', () => {
    it('should get the current funds cache start time', () => {
      expect.assertions(1);
      expect(getStartTime(state)).toBe(testStartTime);
    });

    it('should default to zero', () => {
      expect.assertions(1);
      expect(
        getStartTime({
          ...state,
          [Page.funds]: {
            ...state[Page.funds],
            period: Period.year5,
          },
        }),
      ).toBe(0);
    });
  });

  describe('getCacheTimes', () => {
    it('should get the current funds cache times list', () => {
      expect.assertions(1);
      expect(getCacheTimes(state)).toBe(testCacheTimes);
    });
  });

  describe('getFundItems', () => {
    it('should get an ordered (by value) list of available funds with an overall item', () => {
      expect.assertions(1);
      expect(getFundItems(today)(state)).toStrictEqual<FundItem[]>([
        { id: GRAPH_FUNDS_OVERALL_ID, item: 'Overall', color: colors.black },
        { id: 10, item: 'some fund 1', color: colorKey('some fund 1') },
        { id: 3, item: 'some fund 2', color: colorKey('some fund 2') },
        { id: 1, item: 'some fund 3', color: colorKey('some fund 3') },
        { id: 5, item: 'test fund 4', color: colorKey('test fund 4') },
      ]);
    });

    it('should filter out sold funds, if the options is set', () => {
      expect.assertions(1);
      const stateNoSold = {
        ...state,
        funds: {
          ...state.funds,
          viewSoldFunds: false,
        },
      };

      expect(getFundItems(today)(stateNoSold)).toStrictEqual<FundItem[]>([
        { id: GRAPH_FUNDS_OVERALL_ID, item: 'Overall', color: colors.black },
        { id: 10, item: 'some fund 1', color: colorKey('some fund 1') },
      ]);
    });

    it('should filter out funds with only future transactions', () => {
      expect.assertions(1);

      const stateWithFutureFund = {
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          items: [
            {
              ...state[Page.funds].items[0],
              item: 'Some future fund',
              transactions: getTransactionsList([{ date: '2020-04-21', units: 23, cost: 103 }]),
            },
            ...state[Page.funds].items.slice(1),
          ],
        },
      };

      expect(getFundItems(today)(stateWithFutureFund)).not.toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ item: 'Some future fund' })]),
      );
    });
  });

  describe('getFundLines', () => {
    it('should get a list (by mode) of graphed, split fund lines', () => {
      expect.assertions(1);
      const result = getFundLines(today)(state);
      expect(result).toStrictEqual({
        [Mode.ROI]: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            color: expect.stringMatching(/^#[0-9a-f]{6}$/),
            data: expect.arrayContaining([[expect.any(Number), expect.any(Number)]]),
          }),
        ]),
        [Mode.Value]: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            color: expect.stringMatching(/^#[0-9a-f]{6}$/),
            data: expect.arrayContaining([[expect.any(Number), expect.any(Number)]]),
          }),
        ]),
        [Mode.Price]: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            color: expect.stringMatching(/^#[0-9a-f]{6}$/),
            data: expect.arrayContaining([[expect.any(Number), expect.any(Number)]]),
          }),
        ]),
      });
    });

    it('should filter out sold funds, if the option is set', () => {
      expect.assertions(9);
      const stateNoSold = {
        ...state,
        funds: {
          ...state.funds,
          viewSoldFunds: false,
        },
      };

      const soldIds = [3, 1, 5];

      const result = getFundLines(today)(stateNoSold);

      soldIds.forEach((soldId) => {
        expect(result[Mode.ROI]).not.toStrictEqual(
          expect.objectContaining({
            [soldId]: expect.anything,
          }),
        );

        expect(result[Mode.Value]).not.toStrictEqual(
          expect.objectContaining({
            [soldId]: expect.anything,
          }),
        );

        expect(result[Mode.Price]).not.toStrictEqual(
          expect.objectContaining({
            [soldId]: expect.anything,
          }),
        );
      });
    });

    it('should include all past transactions of a sold fund on the last datapoint', () => {
      expect.assertions(1);
      const stateWithSold = {
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          items: [
            {
              ...state[Page.funds].items[0],
              transactions: getTransactionsList([
                { date: '2017-05-09', units: 934, cost: 400000 },
                { date: '2017-07-10', units: -934, cost: -487762 },
                { date: '2020-04-21', units: 1000, cost: 79015 },
              ]),
            },
            ...state[Page.funds].items.slice(1),
          ],
        },
      };

      const result = getFundLines(today)(stateWithSold);

      const overallLine = result[Mode.ROI].find(({ id }) => id === GRAPH_FUNDS_OVERALL_ID);

      expect(overallLine?.data[overallLine?.data.length - 1]).toMatchInlineSnapshot(`
        Array [
          28623600,
          20.33,
        ]
      `);
    });
  });
});
