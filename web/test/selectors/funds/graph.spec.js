import test from 'ava';
import memoize from 'fast-memoize';
import { DateTime } from 'luxon';
import {
    makeGetGraphProps
} from '~client/selectors/funds/graph';
import { GRAPH_FUNDS_MODE_ROI } from '~client/constants/graph';
import { testRows, testPrices, testStartTime, testCacheTimes, testLines } from '~client-test/test_data/testFunds';

const state = {
    now: DateTime.fromISO('2017-09-01T19:01Z'),
    pages: {
        funds: {
            rows: testRows,
            cache: {
                period1: {
                    startTime: testStartTime,
                    cacheTimes: testCacheTimes,
                    prices: testPrices
                }
            }
        }
    },
    other: {
        viewSoldFunds: true,
        graphFunds: {
            mode: GRAPH_FUNDS_MODE_ROI,
            period: 'period1',
            enabledList: [
                { id: 'overall', enabled: true },
                { id: '10', enabled: false },
                { id: '1', enabled: true },
                { id: '3', enabled: false },
                { id: '5', enabled: false }
            ]
        }
    }
};

const getFundItemsResult = memoize((customState = state, customProps = { isMobile: false }) => {
    const getGraphProps = makeGetGraphProps();

    const result = getGraphProps(customState, customProps);

    return result;
});

test('makeGetGraphProps (fund items) returns an array', t => {
    const result = getFundItemsResult();

    t.true(Array.isArray(result.fundItems));
});

const testCases = [
    { id: 'overall', color: [0, 0, 0], enabled: true, item: 'Overall' },
    { id: '10', color: [0, 74, 153], enabled: false, item: 'some fund 1' },
    { id: '1', color: [0, 74, 153], enabled: true, item: 'some fund 3' },
    { id: '3', color: [0, 74, 153], enabled: false, item: 'some fund 2' },
    { id: '5', color: [0, 153, 99], enabled: false, item: 'test fund 4' }
];

testCases.forEach(value => {
    test(`makeGetGraphProps (fund items) sets the fund item with id ${value.id}`, t => {
        const { fundItems } = getFundItemsResult();

        t.deepEqual(fundItems.find(({ id }) => id === value.id), value);
    });
});

test('makeGetGraphProps (fund items) returns fund lines', t => {
    const result = getFundItemsResult();

    t.deepEqual(result.lines, testLines);
});

test('makeGetGraphProps (fund items) returns fund items for deleted funds', t => {
    const stateWithDeletedItem = {
        ...state,
        pages: {
            ...state.pages,
            funds: {
                ...state.pages.funds,
                rows: state.pages.funds.rows.filter(({ id }) => id !== '10')
            }
        }
    };

    const resultWithDeletedItem = getFundItemsResult(stateWithDeletedItem, { isMobile: false });

    t.is(resultWithDeletedItem.fundItems.length, 4);
    t.false(resultWithDeletedItem.fundItems.some(({ id }) => id === '10'));
});
