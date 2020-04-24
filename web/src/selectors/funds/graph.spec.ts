import { DateTime } from 'luxon';

import { State } from '~client/reducers';
import { getStartTime, getCacheTimes, getFundItems, getFundLines } from './graph';
import { testState } from '~client/test-data/state';
import {
  testStartTime,
  testCacheTimes,
  testLinesRoi,
  testLinesAbsolute,
  testLinesPrice,
} from '~client/test-data/funds';
import {
  Period,
  GRAPH_FUNDS_MODE_ROI,
  GRAPH_FUNDS_MODE_ABSOLUTE,
  GRAPH_FUNDS_MODE_PRICE,
  GRAPH_FUNDS_OVERALL_ID,
} from '~client/constants/graph';
import { COLOR_GRAPH_FUND_LINE } from '~client/constants/colors';
import { colorKey } from '~client/modules/color';

describe('Fund selectors / graph', () => {
  const state: Pick<State, 'now' | 'funds'> = {
    ...testState,
    now: DateTime.fromISO('2017-09-01T19:01Z'),
    funds: {
      ...testState.funds,
      viewSoldFunds: true,
      period: Period.year1,
    },
  };

  describe('getStartTime', () => {
    it('should get the current funds cache start time', () => {
      expect(getStartTime(state)).toBe(testStartTime);
    });
  });

  describe('getCacheTimes', () => {
    it('should get the current funds cache times list', () => {
      expect(getCacheTimes(state)).toBe(testCacheTimes);
    });
  });

  describe('getFundItems', () => {
    it('should get the list of available funds with an overall item in addition', () => {
      expect(getFundItems(state)).toEqual([
        { id: GRAPH_FUNDS_OVERALL_ID, item: 'Overall', color: COLOR_GRAPH_FUND_LINE },
        { id: '10', item: 'some fund 1', color: colorKey('some fund 1') },
        { id: '3', item: 'some fund 2', color: colorKey('some fund 2') },
        { id: '1', item: 'some fund 3', color: colorKey('some fund 3') },
        { id: '5', item: 'test fund 4', color: colorKey('test fund 4') },
      ]);
    });

    it('should filter out sold funds, if the options is set', () => {
      const stateNoSold = {
        ...state,
        funds: {
          ...state.funds,
          viewSoldFunds: false,
        },
      };

      expect(getFundItems(stateNoSold)).toEqual([
        { id: GRAPH_FUNDS_OVERALL_ID, item: 'Overall', color: COLOR_GRAPH_FUND_LINE },
        { id: '10', item: 'some fund 1', color: colorKey('some fund 1') },
      ]);
    });
  });

  describe('getFundLines', () => {
    it('should get a list (by mode) of graphed, split fund lines', () => {
      expect(getFundLines(state)).toEqual({
        [GRAPH_FUNDS_MODE_ROI]: testLinesRoi,
        [GRAPH_FUNDS_MODE_ABSOLUTE]: testLinesAbsolute,
        [GRAPH_FUNDS_MODE_PRICE]: testLinesPrice,
      });
    });

    it('should filter out sold funds, if the option is set', () => {
      const stateNoSold = {
        ...state,
        funds: {
          ...state.funds,
          viewSoldFunds: false,
        },
      };

      const soldIds = ['3', '1', '5'];

      expect(getFundLines(stateNoSold)).toEqual({
        [GRAPH_FUNDS_MODE_ROI]: testLinesRoi.filter(({ id }) => !soldIds.includes(id)),
        [GRAPH_FUNDS_MODE_ABSOLUTE]: testLinesAbsolute.filter(({ id }) => !soldIds.includes(id)),
        [GRAPH_FUNDS_MODE_PRICE]: testLinesPrice.filter(({ id }) => !soldIds.includes(id)),
      });
    });
  });
});
