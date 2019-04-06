import test from 'ava';

import {
    aFundsGraphClicked,
    aFundsGraphLineToggled,
    aFundsGraphPeriodChanged,
    aFundsGraphPeriodReceived
} from '~client/actions/graph.actions';

import {
    GRAPH_FUNDS_LINE_TOGGLED,
    GRAPH_FUNDS_CLICKED,
    GRAPH_FUNDS_PERIOD_LOADED,
    GRAPH_FUNDS_PERIOD_CHANGED
} from '~client/constants/actions';

test('aFundsGraphClicked returns GRAPH_FUNDS_CLICKED', t => {
    t.deepEqual(aFundsGraphClicked(), { type: GRAPH_FUNDS_CLICKED });
});

test('aFundsGraphLineToggled returns GRAPH_FUNDS_LINE_TOGGLED with index', t => {
    t.deepEqual(aFundsGraphLineToggled(10), {
        type: GRAPH_FUNDS_LINE_TOGGLED, index: 10
    });
});

test('aFundsGraphPeriodReceived returns GRAPH_FUNDS_PERIOD_LOADED with res object', t => {
    t.deepEqual(aFundsGraphPeriodReceived({ foo: 'bar' }), {
        type: GRAPH_FUNDS_PERIOD_LOADED, foo: 'bar'
    });
});

test('aFundsGraphPeriodChanged returns GRAPH_FUNDS_PERIOD_CHANGED with req object', t => {
    t.deepEqual(aFundsGraphPeriodChanged({ foo: 'bar' }), {
        type: GRAPH_FUNDS_PERIOD_CHANGED, foo: 'bar'
    });
});

