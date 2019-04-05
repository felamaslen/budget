import test from 'ava';
import { fromJS } from 'immutable';
import {
    rToggleShowAll
} from '~client/reducers/graph.reducer';

test('rToggleShowAll toggling showAllBalanceGraph', t => {
    t.is(
        rToggleShowAll(fromJS({ other: { showAllBalanceGraph: true } }))
            .getIn(['other', 'showAllBalanceGraph']),
        false
    );

    t.is(
        rToggleShowAll(fromJS({ other: { showAllBalanceGraph: false } }))
            .getIn(['other', 'showAllBalanceGraph']),
        true
    );

    t.is(
        rToggleShowAll(fromJS({ other: { showAllBalanceGraph: null } }))
            .getIn(['other', 'showAllBalanceGraph']),
        true
    );
});

test.todo('rToggleFundsGraphMode');
test.todo('rToggleFundsGraphLine');
test.todo('rHandleFundPeriodResponse');
test.todo('rChangeFundsGraphPeriod');

