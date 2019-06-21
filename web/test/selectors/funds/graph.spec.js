import test from 'ava';
import memoize from 'fast-memoize';
import { Map as map, List as list } from 'immutable';
import { DateTime } from 'luxon';
import {
    makeGetGraphProps
} from '~client/selectors/funds/graph';
import { GRAPH_FUNDS_MODE_ROI } from '~client/constants/graph';
import { testRows, testPrices, testStartTime, testCacheTimes, testLines } from '../../test_data/testFunds';

const state = map({
    now: DateTime.fromISO('2017-09-01T19:01Z'),
    pages: map({
        funds: map({
            rows: testRows,
            cache: map({
                period1: map({
                    startTime: testStartTime,
                    cacheTimes: testCacheTimes,
                    prices: testPrices
                })
            })
        })
    }),
    other: map({
        viewSoldFunds: true,
        graphFunds: map({
            mode: GRAPH_FUNDS_MODE_ROI,
            period: 'period1',
            enabledList: map([
                ['overall', true],
                ['10', false],
                ['1', true],
                ['3', false],
                ['5', false]
            ])
        })
    })
});

const getFundItemsResult = memoize((customState = state, customProps = { isMobile: false }) => {
    const getGraphProps = makeGetGraphProps();

    const result = getGraphProps(customState, customProps);

    return result;
});

test('makeGetGraphProps (fund items) returns a map', t => {
    const result = getFundItemsResult();

    t.true('fundItems' in result);
    t.true(result.fundItems instanceof map);
});

const testCases = [
    { id: 'overall', value: { color: [0, 0, 0], enabled: true, item: 'Overall' } },
    { id: '10', value: { color: [0, 74, 153], enabled: false, item: 'some fund 1' } },
    { id: '1', value: { color: [0, 74, 153], enabled: true, item: 'some fund 3' } },
    { id: '3', value: { color: [0, 74, 153], enabled: false, item: 'some fund 2' } },
    { id: '5', value: { color: [0, 153, 99], enabled: false, item: 'test fund 4' } }
];

testCases.forEach(({ id, value }) => {
    test(`makeGetGraphProps (fund items) sets the fund item with id ${id}`, t => {
        const { fundItems } = getFundItemsResult();

        t.deepEqual(fundItems.get(id).toJS(), value);
    });
});

test('makeGetGraphProps (fund items) returns fund lines', t => {
    const result = getFundItemsResult();

    t.true('lines' in result);
    t.true(result.lines instanceof list);
    t.deepEqual(result.lines.toJS(), testLines);
});

test('makeGetGraphProps (fund items) returns fund items for deleted funds', t => {
    const stateWithDeletedItem = state.setIn(['pages', 'funds', 'rows'],
        state.getIn(['pages', 'funds', 'rows']).delete('10'));

    const resultWithDeletedItem = getFundItemsResult(stateWithDeletedItem, { isMobile: false });

    t.false('10' in resultWithDeletedItem.fundItems.toJS());
});
