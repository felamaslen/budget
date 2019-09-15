import test from 'ava';

import {
    ITEMS_SET,
    COLUMNS_SET,
    NAV_TOGGLED,
    NAV_NEXT,
    NAV_PREV,
    NAV_XY,
    ACTIVE_SET,
    ADD_BTN,
    navReducer,
} from '~client/hooks/nav';
import { CREATE_ID } from '~client/constants/data';

const initialState = {
    nav: true,
    items: [],
    activeId: null,
    activeItem: null,
    activeColumn: null,
    columns: [],
};

test('ITEMS_SET sets items', (t) => {
    t.deepEqual(navReducer(initialState, {
        type: ITEMS_SET,
        items: [1, 2, 3],
    }), { ...initialState, items: [1, 2, 3] });
});

test('COLUMNS_SET sets columns', (t) => {
    t.deepEqual(navReducer(initialState, {
        type: COLUMNS_SET,
        columns: ['foo', 'bar'],
    }), { ...initialState, columns: ['foo', 'bar'] });
});

test('NAV_TOGGLED (to nav) enables navigation', (t) => {
    t.deepEqual(navReducer({
        nav: false,
        items: [1, 2, 3],
        activeId: 'some-id',
        activeItem: { some: 'item' },
        activeColumn: null,
        columns: null,
    }, { type: NAV_TOGGLED }), {
        nav: true,
        items: [1, 2, 3],
        activeId: null,
        activeItem: null,
        activeColumn: null,
        columns: null,
    });
});

test('NAV_TOGGLED (from nav) disables navigation', (t) => {
    t.deepEqual(navReducer({
        nav: true,
        items: [1, 2, 3],
        activeId: 'some-id',
        activeItem: { some: 'item' },
        activeColumn: 'some',
        columns: ['some'],
    }, { type: NAV_TOGGLED }), {
        nav: false,
        items: [1, 2, 3],
        activeId: null,
        activeItem: null,
        activeColumn: 'some',
        columns: ['some'],
    });
});

const stateColumns = {
    ...initialState,
    items: [
        { id: 'id1', foo: 'foo1', bar: 'bar1' },
        { id: 'id2', foo: 'foo2', bar: 'bar2' },
    ],
    columns: ['foo', 'bar'],
};

const stateNoColumns = {
    ...initialState,
    items: [
        { id: 'id1', foo: 'foo1' },
        { id: 'id2', foo: 'foo2' },
    ],
};

test('NAV_NEXT (columns disabled) goes to the next row', (t) => {
    const action = { type: NAV_NEXT };

    const result0 = navReducer(stateNoColumns, action);
    t.is(result0.activeId, CREATE_ID);
    t.is(result0.activeItem, null);

    const result1 = navReducer(result0, action);
    t.is(result1.activeId, 'id1');
    t.is(result1.activeItem, stateNoColumns.items[0]);

    const result2 = navReducer(result1, action);
    t.is(result2.activeId, 'id2');
    t.is(result2.activeItem, stateNoColumns.items[1]);

    const result3 = navReducer(result2, action);
    t.is(result3.activeId, CREATE_ID);
    t.is(result3.activeItem, null);
});

test('NAV_PREV (columns disabled) goes to the previous row', (t) => {
    const action = { type: NAV_PREV };

    const result0 = navReducer(stateNoColumns, action);
    t.is(result0.activeId, 'id2');
    t.is(result0.activeItem, stateNoColumns.items[1]);

    const result1 = navReducer(result0, action);
    t.is(result1.activeId, 'id1');
    t.is(result1.activeItem, stateNoColumns.items[0]);

    const result2 = navReducer(result1, action);
    t.is(result2.activeId, CREATE_ID);
    t.is(result2.activeItem, null);

    const result3 = navReducer(result2, action);
    t.is(result3.activeId, 'id2');
    t.is(result3.activeItem, stateNoColumns.items[1]);
});

test('NAV_XY (x=1, y=0) loops through the rows and columns', (t) => {
    const action = { type: NAV_XY, dx: 1, dy: 0 };

    const fromNull = navReducer(stateColumns, action);
    t.is(fromNull.activeId, CREATE_ID);
    t.is(fromNull.activeColumn, 'foo');

    const fromCreateFoo = navReducer(fromNull, action);
    t.is(fromCreateFoo.activeId, CREATE_ID);
    t.is(fromCreateFoo.activeColumn, 'bar');

    const fromCreateBar = navReducer(fromCreateFoo, action);
    t.is(fromCreateBar.activeId, CREATE_ID);
    t.is(fromCreateBar.activeColumn, ADD_BTN);

    const fromCreateAddBtn = navReducer(fromCreateBar, action);
    t.is(fromCreateAddBtn.activeId, 'id1');
    t.is(fromCreateAddBtn.activeColumn, 'foo');

    const fromRow1Foo = navReducer(fromCreateAddBtn, action);
    t.is(fromRow1Foo.activeId, 'id1');
    t.is(fromRow1Foo.activeColumn, 'bar');

    const fromRow1Bar = navReducer(fromRow1Foo, action);
    t.is(fromRow1Bar.activeId, 'id2');
    t.is(fromRow1Bar.activeColumn, 'foo');

    const fromRow2Foo = navReducer(fromRow1Bar, action);
    t.is(fromRow2Foo.activeId, 'id2');
    t.is(fromRow2Foo.activeColumn, 'bar');

    const fromRow2Bar = navReducer(fromRow2Foo, action);
    t.is(fromRow2Bar.activeId, CREATE_ID);
    t.is(fromRow2Bar.activeColumn, 'foo');
});

test('NAV_XY (x=-1, y=0) loops through the rows and columns in reverse', (t) => {
    const action = { type: NAV_XY, dx: -1, dy: 0 };

    const fromNull = navReducer(stateColumns, action);
    t.is(fromNull.activeId, 'id2');
    t.is(fromNull.activeColumn, 'bar');

    const fromRow2Bar = navReducer(fromNull, action);
    t.is(fromRow2Bar.activeId, 'id2');
    t.is(fromRow2Bar.activeColumn, 'foo');

    const fromRow2Foo = navReducer(fromRow2Bar, action);
    t.is(fromRow2Foo.activeId, 'id1');
    t.is(fromRow2Foo.activeColumn, 'bar');

    const fromRow1Bar = navReducer(fromRow2Foo, action);
    t.is(fromRow1Bar.activeId, 'id1');
    t.is(fromRow1Bar.activeColumn, 'foo');

    const fromRow1Foo = navReducer(fromRow1Bar, action);
    t.is(fromRow1Foo.activeId, CREATE_ID);
    t.is(fromRow1Foo.activeColumn, ADD_BTN);

    const fromCreateAddBtn = navReducer(fromRow1Foo, action);
    t.is(fromCreateAddBtn.activeId, CREATE_ID);
    t.is(fromCreateAddBtn.activeColumn, 'bar');

    const fromCreateBar = navReducer(fromCreateAddBtn, action);
    t.is(fromCreateBar.activeId, CREATE_ID);
    t.is(fromCreateBar.activeColumn, 'foo');

    const fromCreateFoo = navReducer(fromCreateBar, action);
    t.is(fromCreateFoo.activeId, 'id2');
    t.is(fromCreateFoo.activeColumn, 'bar');
});

test('NAV_XY (x=0, y=1) loops through a single column', (t) => {
    const action = { type: NAV_XY, dx: 0, dy: 1 };

    const fromNull = navReducer(stateColumns, action);
    t.is(fromNull.activeId, CREATE_ID);
    t.is(fromNull.activeColumn, 'foo');

    const fromCreate = navReducer(fromNull, action);
    t.is(fromCreate.activeId, 'id1');
    t.is(fromCreate.activeColumn, 'foo');

    const fromRow1 = navReducer(fromCreate, action);
    t.is(fromRow1.activeId, 'id2');
    t.is(fromRow1.activeColumn, 'foo');

    const fromRow2 = navReducer(fromRow1, action);
    t.is(fromRow2.activeId, CREATE_ID);
    t.is(fromRow2.activeColumn, 'foo');
});

test('NAV_XY (x=0, y=-1) loops through a single column in reverse', (t) => {
    const action = { type: NAV_XY, dx: 0, dy: -1 };

    const fromNull = navReducer(stateColumns, action);
    t.is(fromNull.activeId, 'id2');
    t.is(fromNull.activeColumn, 'foo');

    const fromRow2 = navReducer(fromNull, action);
    t.is(fromRow2.activeId, 'id1');
    t.is(fromRow2.activeColumn, 'foo');

    const fromRow1 = navReducer(fromRow2, action);
    t.is(fromRow1.activeId, CREATE_ID);
    t.is(fromRow1.activeColumn, 'foo');

    const fromCreate = navReducer(fromRow1, action);
    t.is(fromCreate.activeId, 'id2');
    t.is(fromCreate.activeColumn, 'foo');
});

test('NAV_XY (x=0, y=1) from the add button chooses the last column', (t) => {
    const action = { type: NAV_XY, dx: 0, dy: 1 };
    const state = { ...stateColumns, activeId: CREATE_ID, activeColumn: ADD_BTN };

    const result = navReducer(state, action);

    t.is(result.activeId, 'id1');
    t.is(result.activeColumn, 'bar');
});

test('ACTIVE_SET (columns disabled) sets the active ID and item', (t) => {
    const result = navReducer(stateNoColumns, { type: ACTIVE_SET, id: 'id2' });
    t.is(result.activeId, 'id2');
    t.is(result.activeItem, stateNoColumns.items[1]);

    const resultCreate = navReducer(stateNoColumns, { type: ACTIVE_SET, id: CREATE_ID });
    t.is(resultCreate.activeId, CREATE_ID);
    t.is(resultCreate.activeItem, null);
});

test('ACTIVE_SET (columns enabled) sets the active ID, item and active column', (t) => {
    const result = navReducer(stateColumns, { type: ACTIVE_SET, id: 'id2', column: 'foo' });
    t.is(result.activeId, 'id2');
    t.is(result.activeItem, stateColumns.items[1]);
    t.is(result.activeColumn, 'foo');
});
