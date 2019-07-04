import test from 'ava';
import memoize from 'fast-memoize';
import { DateTime } from 'luxon';
import {
    makeGetGraphProps
} from '~client/selectors/funds/graph';
import { testState } from '~client-test/test_data/state';
import { testLines } from '~client-test/test_data/testFunds';

const state = {
    ...testState,
    now: DateTime.fromISO('2017-09-01T19:01Z'),
    funds: {
        ...testState.funds,
        viewSoldFunds: false,
        period: 'period1'
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
    { id: 'overall', color: [0, 0, 0], item: 'Overall' },
    { id: '10', color: [0, 74, 153], item: 'some fund 1' }
];

testCases.forEach(value => {
    test(`makeGetGraphProps (fund items) sets the fund item with id ${value.id}`, t => {
        const { fundItems } = getFundItemsResult();

        t.deepEqual(fundItems.find(({ id }) => id === value.id), value);
    });
});

const soldIds = ['1', '3', '5'];

test('makeGetGraphProps doesn\'t calculate sold funds graph values', t => {
    const { fundItems } = getFundItemsResult();

    soldIds.forEach(id => t.false(fundItems.some(({ id: fundId }) => fundId === id)));
});

test('makeGetGraphProps (fund items) returns fund lines', t => {
    const result = getFundItemsResult();

    t.deepEqual(result.lines, testLines);
});

test('makeGetGraphProps (fund items) returns fund items for deleted funds', t => {
    const stateWithDeletedItem = {
        ...state,
        funds: {
            ...state.funds,
            viewSoldFunds: true,
            items: state.funds.items.filter(({ id }) => id !== '10')
        }
    };

    const resultWithDeletedItem = getFundItemsResult(stateWithDeletedItem, { isMobile: false });

    t.is(resultWithDeletedItem.fundItems.length, 4);
    t.false(resultWithDeletedItem.fundItems.some(({ id }) => id === '10'));
});
