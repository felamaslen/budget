import test from 'ava';
import { fromJS, Map as map, List as list } from 'immutable';
import '~client-test/browser';
import { DateTime } from 'luxon';
import {
    rOnWindowResize,
    getItemValue,
    rHandleKeyPress,
    rHandleServerUpdate,
    rUpdateTime,
    rUpdateServer,
    rLogout
} from '~client/reducers/app.reducer';
import reduction from '~client/reduction';

test('rOnWindowResize setting the window size in state', t => {
    t.deepEqual(
        rOnWindowResize(fromJS({ other: { windowWidth: 100 } }), { size: 200 }).toJS(),
        { other: { windowWidth: 200 } }
    );
});

const stateOverview = fromJS({
    pages: {
        overview: {
            data: {
                cost: {
                    balance: [100, 1001, 392, 9913, 923]
                }
            }
        }
    }
});

test('getItemValue (on the overview page) geting an object with the relevant value', t => {
    t.deepEqual(getItemValue(stateOverview, 'overview', 0), { id: null, item: null, value: 100 });

    t.deepEqual(getItemValue(stateOverview, 'overview', 3), { id: null, item: null, value: 9913 });
});

test('getItemValue (on list pages, on the add row) returning the current add-item value', t => {
    const stateOnAddRow = stateOverview.set('edit', map({
        add: map({
            food: list.of(DateTime.fromISO('2018-06-10'), 'foo', 'bar', 365, 'baz')
        })
    }));

    t.deepEqual(getItemValue(stateOnAddRow, 'food', -1, 1), { id: null, item: 'item', value: 'foo' });
    t.deepEqual(getItemValue(stateOnAddRow, 'food', -1, 3), { id: null, item: 'cost', value: 365 });
});

test('getItemValue (on list pages, on the list row) returning the current list-row value', t => {
    const stateOnListRow = stateOverview.setIn(['pages', 'food', 'rows'], map([
        ['76', map({
            cols: list.of(DateTime.fromISO('2018-06-03'), 'foo1', 'bar1', 861, 'baz2')
        })],
        ['2', map({
            cols: list.of(DateTime.fromISO('2018-06-11'), 'foo2', 'bar2', 1943, 'baz3')
        })]
    ]));

    t.deepEqual(getItemValue(stateOnListRow, 'food', '76', 4), { id: '76', item: 'shop', value: 'baz2' });

    t.deepEqual(getItemValue(stateOnListRow, 'food', '2', 0), { id: '2', item: 'date', value: DateTime.fromISO('2018-06-11') });
});

const stateKeyPress = map({
    user: map({ uid: '0' })
});

test('rHandleKeyPress doing nothing if the key is a modifier', t => {
    t.is(rHandleKeyPress(stateKeyPress, { key: 'Control' }), stateKeyPress);
    t.is(rHandleKeyPress(stateKeyPress, { key: 'Shift' }), stateKeyPress);
});

const stateLoggedIn = stateOverview.setIn(['user', 'uid'], '1')
    .set('currentPage', 'food')
    .set('edit', map({
        active: map({
            row: -1,
            col: 2,
            value: null
        }),
        add: map({
            food: list.of(DateTime.fromISO('2018-06-10'), '', '', 0, '')
        })
    }))
    .set('editSuggestions', map({
        list: list.of(),
        active: -1,
        nextCategory: list.of()
    }))
    .set('pages', map({
        food: map({
            data: map({ numRows: 10, numCols: 5 }),
            rows: map([
                ['1', map({
                    id: '1',
                    cols: list.of(DateTime.fromISO('2018-06-03'), 'foo1', 'bar1', 30, 'baz1')
                })],
                ['2', map({
                    id: '2',
                    cols: list.of(DateTime.fromISO('2018-06-02'), 'foo2', 'bar2', 30, 'baz2')
                })],
                ['5', map({
                    id: '5',
                    cols: list.of(DateTime.fromISO('2018-05-28'), 'foo3', 'bar3', 30, 'baz3')
                })],
                ['6', map({
                    id: '6',
                    cols: list.of(DateTime.fromISO('2018-05-28'), 'foo4', 'bar4', 30, 'baz4')
                })],
                ['35', map({
                    id: '35',
                    cols: list.of(DateTime.fromISO('2018-05-09'), 'foo5', 'bar5', 30, 'baz5')
                })],
                ['19', map({
                    id: '19',
                    cols: list.of(DateTime.fromISO('2018-04-19'), 'foo6', 'bar6', 30, 'baz6')
                })],
                ['7', map({
                    id: '7',
                    cols: list.of(DateTime.fromISO('2018-04-18'), 'foo7', 'bar7', 30, 'baz7')
                })],
                ['9', map({
                    id: '9',
                    cols: list.of(DateTime.fromISO('2018-04-09'), 'foo8', 'bar8', 30, 'baz8')
                })],
                ['11', map({
                    id: '11',
                    cols: list.of(DateTime.fromISO('2018-04-05'), 'foo9', 'bar9', 30, 'baz9')
                })],
                ['61', map({
                    id: '61',
                    cols: list.of(DateTime.fromISO('2018-04-03'), 'foo10', 'bar10', 30, 'baz10')
                })]
            ])
        })
    }));

const stateFromSuggestions = stateLoggedIn.set('editSuggestions', map({
    list: list.of('foo', 'bar'),
    active: 1,
    nextCategory: list.of()
}));

test('rHandleKeyPress (logged in, navigating from suggestions, on escape) clearing the edit suggestions list', t => {
    const result = rHandleKeyPress(stateFromSuggestions, { key: 'Escape' });

    t.deepEqual(result.get('editSuggestions').toJS(), {
        list: [],
        active: -1,
        nextCategory: []
    });
});

test('rHandleKeyPress (logged in, navigating from suggestions, no prefill) setting editable value to the suggestion value', t => {
    const result = rHandleKeyPress(stateFromSuggestions, { key: 'Enter' });

    t.is(result.getIn(['edit', 'add', 'food', 2]), 'bar');
});

test('rHandleKeyPress (logged in, navigating from suggestions, no prefill) navigating to the next field', t => {
    const result = rHandleKeyPress(stateFromSuggestions, { key: 'Enter' });

    t.is(result.getIn(['edit', 'active', 'col']), 3);
});

const stateWithPrefill = stateFromSuggestions
    .setIn(['edit', 'active', 'col'], 1)
    .setIn(['editSuggestions', 'nextCategory'], list.of('baz', 'bak'));

test('rHandleKeyPress (logged in, navigating from suggestions, with prefill) prefilling the category column', t => {
    const result = rHandleKeyPress(stateWithPrefill, { key: 'Enter' });

    t.is(result.getIn(['edit', 'add', 'food', 2]), 'bak');
});

test('rHandleKeyPress (logged in, navigating within suggestions) looping through the suggestions', t => {
    const stateWithSuggestions = stateLoggedIn.set('editSuggestions', map({
        list: list.of('foo', 'bar'),
        active: -1
    }));

    let nextState = stateWithSuggestions;

    const navState = prevState => rHandleKeyPress(prevState, { key: 'Tab' });

    nextState = navState(nextState);
    t.is(nextState.getIn(['editSuggestions', 'active']), 0);

    nextState = navState(nextState);
    t.is(nextState.getIn(['editSuggestions', 'active']), 1);

    nextState = navState(nextState);
    t.is(nextState.getIn(['editSuggestions', 'active']), -1);
});

test('rHandleKeyPress (logged in, navigating from the active field) setting the next active field', t => {
    const result = rHandleKeyPress(stateLoggedIn, { key: 'Tab' });

    t.is(result.getIn(['edit', 'active', 'col']), 3);
});

test('rHandleKeyPress (logged in, on escape) deactivateing and cancel editing', t => {
    const stateEditing = stateLoggedIn.setIn(['edit', 'active', 'value'], 'wanttocancelthis');

    const result = rHandleKeyPress(stateEditing, { key: 'Escape' });

    t.is(result.getIn(['edit', 'active', 'value']), null);
});

test('rHandleKeyPress (logged in, on enter) noting do anything if the add button is selected', t => {
    const stateWithAddButton = stateLoggedIn.setIn(['edit', 'addBtnFocus'], true);

    const result = rHandleKeyPress(stateWithAddButton, { key: 'Enter' });

    t.is(result, stateWithAddButton);
});

test('rHandleKeyPress (logged in, on enter) activateing the current edit item', t => {
    const result = rHandleKeyPress(stateLoggedIn, { key: 'Enter' });

    t.is(result.getIn(['edit', 'active', 'col']), -1);
    t.is(result.getIn(['edit', 'active', 'id']), null);
    t.is(result.getIn(['edit', 'active', 'item']), null);
    t.is(result.getIn(['edit', 'active', 'originalValue']), null);
    t.is(result.getIn(['edit', 'active', 'page']), 'food');

    t.is(result.getIn(['edit', 'add', 'food', 2]), null);
    t.is(result.getIn(['edit', 'addBtnFocus']), false);

    t.is(result.getIn(['editSuggestions', 'loading']), false);
    t.is(result.getIn(['editSuggestions', 'reqId']), null);
});

const stateLoggedOut = stateKeyPress.set('loginForm', map({
    values: list.of('0', '1'),
    inputStep: 2,
    visible: true
}));

test('rHandleKeyPress (logged out) resetting the login form if Escape was pressed', t => {
    t.deepEqual(rHandleKeyPress(stateLoggedOut, { key: 'Escape' }).toJS(), {
        user: { uid: '0' },
        loginForm: {
            values: [],
            inputStep: 0,
            visible: true
        }
    });
});

test('rHandleKeyPress (logged out) inputing the key to the login form, otherwise', t => {
    t.deepEqual(rHandleKeyPress(stateLoggedOut, { key: '4' }).toJS(), {
        user: { uid: '0' },
        loginForm: {
            values: ['0', '1', '4'],
            inputStep: 3,
            visible: true,
            active: true
        }
    });
});

let envBefore = null;
test.before(() => {
    envBefore = process.env.DEFAULT_FUND_PERIOD;

    process.env.DEFAULT_FUND_PERIOD = 'year1';
});
test.after(() => {
    process.env.DEFAULT_FUND_PERIOD = envBefore;
});

test('rLogout noting do anything if the state is loading', t => {
    t.deepEqual(rLogout(fromJS({ loading: true })).toJS(), { loading: true });
});

test('rLogout resetting the state and set the login form to visible', t => {
    t.deepEqual(rLogout(fromJS({ loginForm: { visible: false } })).toJS(), reduction
        .delete('now')
        .setIn(['loginForm', 'visible'], true)
        .deleteIn(['errorMsg'])
        .deleteIn(['loading'])
        .deleteIn(['loadingApi'])
        .toJS()
    );
});

test('rUpdateTime setting the now property in the state', t => {
    const now = DateTime.local();

    t.deepEqual(rUpdateTime(fromJS({ now: null }), { now }).toJS(), { now });
});

test('rUpdateServer setting loadingApi to true', t => {
    t.deepEqual(rUpdateServer(fromJS({ loadingApi: false })).toJS(), { loadingApi: true });
});

test('rHandleServerUpdate setting loadingApi to false and resetting the request queue', t => {
    t.deepEqual(rHandleServerUpdate(fromJS({
        loadingApi: true,
        edit: {
            requestList: ['foo', 'bar']
        }
    })).toJS(), {
        loadingApi: false,
        edit: {
            requestList: []
        }
    });
});

