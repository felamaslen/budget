import test from 'ava';

import reducer, { initialState } from '~client/reducers/analysis';

import {
    requested,
    received,
    treeItemDisplayToggled,
    treeItemHovered,
    blockRequested,
    blockReceived
} from '~client/actions/analysis';
import { loggedOut } from '~client/actions/login';

test('Null action returns the initial state', t => {
    t.is(reducer(undefined, null), initialState);
});

test('LOGGED_OUT resets the state', t => {
    t.deepEqual(reducer(undefined, loggedOut()), initialState);
});

test('ANALYSIS_REQUESTED sets up the state for loading new data', t => {
    const state = {
        loading: false,
        period: 'year',
        grouping: 'category',
        page: 3
    };

    const withPeriod = reducer(state, requested({ period: 'month' }));
    t.is(withPeriod.loading, true);
    t.is(withPeriod.loadingDeep, false);
    t.is(withPeriod.period, 'month');
    t.is(withPeriod.grouping, 'category');
    t.is(withPeriod.page, 0);

    const withGrouping = reducer(state, requested({ grouping: 'shop' }));
    t.is(withGrouping.loading, true);
    t.is(withGrouping.loadingDeep, false);
    t.is(withGrouping.period, 'year');
    t.is(withGrouping.grouping, 'shop');
    t.is(withGrouping.page, 0);

    const withPage = reducer(state, requested({ page: 1 }));
    t.is(withPage.loading, true);
    t.is(withPage.loadingDeep, false);
    t.is(withPage.period, 'year');
    t.is(withPage.grouping, 'category');
    t.is(withPage.page, 1);

    const withNothing = reducer(state, requested());
    t.is(withNothing.loading, true);
    t.is(withNothing.loadingDeep, false);
    t.is(withNothing.period, 'year');
    t.is(withNothing.grouping, 'category');
    t.is(withNothing.page, 0);
});

test('ANALYSIS_RECEIVED updates data in state', t => {
    const state = {
        loading: true,
        period: 'year',
        grouping: 'category',
        page: 0,
        timeline: null,
        treeVisible: { bills: false, general: true }
    };

    const action = received({
        data: {
            timeline: [
                [72500, 1035, 2779, 1745],
                [3724, 3340, 3299]
            ],
            cost: [
                ['bills', [['EDF Energy', -6110], ['Water', 44272]]],
                ['food', [['Baking', 880], ['Dairy', 4614]]],
                ['general', [['Furniture', 8399], ['Mail', 402]]]
            ],
            saved: 996899,
            description: '2019'
        }
    });

    const result = reducer(state, action);

    t.is(result.loading, false);
    t.is(result.loadingDeep, false);

    t.deepEqual(result.timeline, [
        [72500, 1035, 2779, 1745],
        [3724, 3340, 3299]
    ]);

    t.is(result.deep, null);

    t.deepEqual(result.cost, [
        ['bills', [['EDF Energy', -6110], ['Water', 44272]]],
        ['food', [['Baking', 880], ['Dairy', 4614]]],
        ['general', [['Furniture', 8399], ['Mail', 402]]]
    ]);

    t.is(result.saved, 996899);

    t.is(result.description, '2019');
});

test('ANALYSIS_BLOCK_REQUESTED (while on main view) sets state up for loading deep view', t => {
    const state = {};

    const action = blockRequested('food');

    const result = reducer(state, action);

    t.is(result.loading, true);
    t.is(result.loadingDeep, true);
    t.is(result.deepBlock, 'food');
});

test('ANALYSIS_BLOCK_REQUESTED (while on main view) doesn\'t do anything on bills or saved block', t => {
    const state = {};

    t.deepEqual(reducer(state, blockRequested('bills')), { loading: false, loadingDeep: false });
    t.deepEqual(reducer(state, blockRequested('saved')), { loading: false, loadingDeep: false });
});

test('ANALYSIS_BLOCK_REQUESTED (while on deep view) resets the deep data', t => {
    const state = {
        deep: [1, 2, 3],
        deepBlock: 'food'
    };

    const action = blockRequested('Fish');

    const result = reducer(state, action);

    t.is(result.deep, null);
    t.is(result.deepBlock, null);
    t.is(result.loading, false);
    t.is(result.loadingDeep, false);
});

test('ANALYSIS_BLOCK_RECEIVED updates deep-block data in state', t => {
    const state = {
        loading: false,
        loadingDeep: true,
        cost: { something: true },
        saved: 230,
        description: 'some description',
        period: 'year',
        grouping: 'category',
        page: 0,
        timeline: [1, 2, 3],
        treeVisible: { bills: false, general: true }
    };

    const action = blockReceived({
        data: {
            items: [
                ['Bread', [['Bread', 317]]],
                ['Fish', [['Cod Fillets', 299], ['Salmon', 585]]]
            ]
        }
    });

    const result = reducer(state, action);

    t.is(result.loading, false);
    t.is(result.loadingDeep, false);

    t.is(result.timeline, state.timeline);

    t.deepEqual(result.deep, [
        ['Bread', [['Bread', 317]]],
        ['Fish', [['Cod Fillets', 299], ['Salmon', 585]]]
    ]);

    t.is(result.cost, state.cost);

    t.is(result.saved, state.saved);

    t.is(result.description, state.description);
});

test('ANALYSIS_TREE_DISPLAY_TOGGLED toggles treeVisible', t => {
    const state = {
        treeVisible: { bills: false, general: true }
    };

    const withBills = reducer(state, treeItemDisplayToggled('bills'));
    t.deepEqual(withBills.treeVisible, { bills: true, general: true });

    const withFood = reducer(state, treeItemDisplayToggled('food'));
    t.deepEqual(withFood.treeVisible, { bills: false, general: true, food: false });

    const withGeneral = reducer(state, treeItemDisplayToggled('general'));
    t.deepEqual(withGeneral.treeVisible, { bills: false, general: false });
});

test('ANALYSIS_TREE_HOVERED sets the active block', t => {
    const state = {};

    const action = treeItemHovered('food', 'Fish');

    const result = reducer(state, action);

    t.is(result.activeGroup, 'food');
    t.is(result.activeBlock, 'Fish');
});
