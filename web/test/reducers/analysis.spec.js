import test from 'ava';

import reducer, { initialState } from '~client/reducers/analysis';

import {
    optionChanged,
    analysisDataRefreshed,
    treeItemDisplayToggled,
    treeItemHovered,
    blockClicked
} from '~client/actions/analysis';
import { loggedOut } from '~client/actions/login';

test('Null action returns the initial state', t => {
    t.is(reducer(undefined, null), initialState);
});

test('LOGGED_OUT resets the state', t => {
    t.deepEqual(reducer(undefined, loggedOut()), initialState);
});

test('ANALYSIS_OPTION_CHANGED sets up the state for loading new data', t => {
    const state = {
        loading: false,
        period: 'year',
        grouping: 'category',
        page: 3
    };

    const withPeriod = reducer(state, optionChanged({ period: 'month' }));
    t.is(withPeriod.loading, true);
    t.is(withPeriod.period, 'month');
    t.is(withPeriod.grouping, 'category');
    t.is(withPeriod.page, 0);

    const withGrouping = reducer(state, optionChanged({ grouping: 'shop' }));
    t.is(withGrouping.loading, true);
    t.is(withGrouping.period, 'year');
    t.is(withGrouping.grouping, 'shop');
    t.is(withGrouping.page, 0);

    const withPage = reducer(state, optionChanged({ page: 1 }));
    t.is(withPage.loading, true);
    t.is(withPage.period, 'year');
    t.is(withPage.grouping, 'category');
    t.is(withPage.page, 1);
});

test('ANALYSIS_DATA_REFRESHED updates data in state', t => {
    const state = {
        loading: true,
        period: 'year',
        grouping: 'category',
        page: 0,
        timeline: null,
        treeVisible: { bills: false, general: true }
    };

    const action = analysisDataRefreshed({
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

test('ANALYSIS_DATA_REFRESHED updates deep-block data in state', t => {
    const state = {
        loading: true,
        cost: { something: true },
        saved: 230,
        description: 'some description',
        period: 'year',
        grouping: 'category',
        page: 0,
        timeline: [1, 2, 3],
        treeVisible: { bills: false, general: true }
    };

    const action = analysisDataRefreshed({
        data: {
            items: [
                ['Bread', [['Bread', 317]]],
                ['Fish', [['Cod Fillets', 299], ['Salmon', 585]]]
            ]
        }
    });

    const result = reducer(state, action);

    t.is(result.loading, false);

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
    t.deepEqual(withFood.treeVisible, { bills: false, general: true, food: true });

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

test('ANALYSIS_BLOCK_CLICKED (while on main view) sets state up for loading deep view', t => {
    const state = {};

    const action = blockClicked('food');

    const result = reducer(state, action);

    t.is(result.loading, true);
});

test('ANALYSIS_BLOCK_CLICKED (while on main view) doesn\'t do anything on bills or saved block', t => {
    const state = { loading: false };

    t.deepEqual(reducer(state, blockClicked('bills')), state);
    t.deepEqual(reducer(state, blockClicked('saved')), state);
});

test('ANALYSIS_BLOCK_CLICKED (while on deep view) resets the deep data', t => {
    const state = {
        deep: [1, 2, 3]
    };

    const action = blockClicked('Fish');

    const result = reducer(state, action);

    t.is(result.deep, null);
});
