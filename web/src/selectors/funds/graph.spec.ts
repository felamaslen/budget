import { getStartTime, getCacheTimes, getFundItems, getFundLines } from './graph';
import { Period, Mode, GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colorKey } from '~client/modules/color';
import { State } from '~client/reducers';
import { colors } from '~client/styled/variables';
import {
  testState,
  testStartTime,
  testCacheTimes,
  testLinesRoi,
  testLinesAbsolute,
  testLinesPrice,
} from '~client/test-data';
import { Page } from '~client/types';

describe('Fund selectors / graph', () => {
  const state: Pick<State, 'now' | Page.funds> = {
    ...testState,
    now: new Date('2017-09-01T19:01Z'),
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
    it('should get the list of available funds with an overall item in addition', () => {
      expect.assertions(1);
      expect(getFundItems(state)).toStrictEqual([
        { id: GRAPH_FUNDS_OVERALL_ID, item: 'Overall', color: colors.black },
        { id: '10', item: 'some fund 1', color: colorKey('some fund 1') },
        { id: '3', item: 'some fund 2', color: colorKey('some fund 2') },
        { id: '1', item: 'some fund 3', color: colorKey('some fund 3') },
        { id: '5', item: 'test fund 4', color: colorKey('test fund 4') },
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

      expect(getFundItems(stateNoSold)).toStrictEqual([
        { id: GRAPH_FUNDS_OVERALL_ID, item: 'Overall', color: colors.black },
        { id: '10', item: 'some fund 1', color: colorKey('some fund 1') },
      ]);
    });
  });

  describe('getFundLines', () => {
    it('should get a list (by mode) of graphed, split fund lines', () => {
      expect.assertions(1);
      expect(getFundLines(state)).toStrictEqual({
        [Mode.ROI]: testLinesRoi,
        [Mode.Value]: testLinesAbsolute,
        [Mode.Price]: testLinesPrice,
      });
    });

    it('should filter out sold funds, if the option is set', () => {
      expect.assertions(1);
      const stateNoSold = {
        ...state,
        funds: {
          ...state.funds,
          viewSoldFunds: false,
        },
      };

      const soldIds = ['3', '1', '5'];

      expect(getFundLines(stateNoSold)).toStrictEqual({
        [Mode.ROI]: testLinesRoi.filter(({ id }) => !soldIds.includes(id)),
        [Mode.Value]: testLinesAbsolute.filter(({ id }) => !soldIds.includes(id)),
        [Mode.Price]: testLinesPrice.filter(({ id }) => !soldIds.includes(id)),
      });
    });
  });
});
