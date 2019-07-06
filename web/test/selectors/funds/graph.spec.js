import test from 'ava';
import { DateTime } from 'luxon';
import {
    getStartTime,
    getCacheTimes,
    getFundItems,
    getFundLines
} from '~client/selectors/funds/graph';
import { testState } from '~client-test/test_data/state';
import {
    testStartTime,
    testCacheTimes,
    testLinesRoi,
    testLinesAbsolute,
    testLinesPrice
} from '~client-test/test_data/testFunds';
import {
    GRAPH_FUNDS_MODE_ROI,
    GRAPH_FUNDS_MODE_ABSOLUTE,
    GRAPH_FUNDS_MODE_PRICE,
    GRAPH_FUNDS_OVERALL_ID
} from '~client/constants/graph';
import { COLOR_GRAPH_FUND_LINE } from '~client/constants/colors';
import { colorKey } from '~client/modules/color';

const state = {
    ...testState,
    now: DateTime.fromISO('2017-09-01T19:01Z'),
    funds: {
        ...testState.funds,
        viewSoldFunds: true,
        period: 'period1'
    }
};

test('getStartTime gets the current funds cache start time', t => {
    t.is(getStartTime(state), testStartTime);
});

test('getCacheTimes gets the current funds cache times list', t => {
    t.is(getCacheTimes(state), testCacheTimes);
});

test('getFundItems gets the list of available funds with an overall item in addition', t => {
    t.deepEqual(getFundItems(state), [
        { id: GRAPH_FUNDS_OVERALL_ID, item: 'Overall', color: COLOR_GRAPH_FUND_LINE },
        { id: '10', item: 'some fund 1', color: colorKey('some fund 1') },
        { id: '3', item: 'some fund 2', color: colorKey('some fund 2') },
        { id: '1', item: 'some fund 3', color: colorKey('some fund 3') },
        { id: '5', item: 'test fund 4', color: colorKey('test fund 4') }
    ]);
});

test('getFundItems filters out sold funds, if the option is set', t => {
    const stateNoSold = {
        ...state,
        funds: {
            ...state.funds,
            viewSoldFunds: false
        }
    };

    t.deepEqual(getFundItems(stateNoSold), [
        { id: GRAPH_FUNDS_OVERALL_ID, item: 'Overall', color: COLOR_GRAPH_FUND_LINE },
        { id: '10', item: 'some fund 1', color: colorKey('some fund 1') }
    ]);
});

test('getFundLines gets a list (by mode) of graphed, split fund lines', t => {
    t.deepEqual(getFundLines(state), {
        [GRAPH_FUNDS_MODE_ROI]: testLinesRoi,
        [GRAPH_FUNDS_MODE_ABSOLUTE]: testLinesAbsolute,
        [GRAPH_FUNDS_MODE_PRICE]: testLinesPrice
    });
});

test('getFundLines filters out sold funds, if the option is set', t => {
    const stateNoSold = {
        ...state,
        funds: {
            ...state.funds,
            viewSoldFunds: false
        }
    };

    const soldIds = ['3', '1', '5'];

    const filter = values => values.filter(({ id }) => !soldIds.includes(id));

    t.deepEqual(getFundLines(stateNoSold), {
        [GRAPH_FUNDS_MODE_ROI]: filter(testLinesRoi),
        [GRAPH_FUNDS_MODE_ABSOLUTE]: filter(testLinesAbsolute),
        [GRAPH_FUNDS_MODE_PRICE]: filter(testLinesPrice)
    });
});
