import test from 'ava';
import { fromJS, List as list } from 'immutable';
import {
    getNavRowCol,
    getNumRowsCols,
    getCurrentRowCol
} from '~client/reducers/nav';

const req = {
    rowKeys: list([1, 2, 3, 4, 5]),
    numRows: 5,
    numCols: 3
};

test('getNavRowCol (list page, from add button) row navigated to being the last (looping), if going up', t => {
    const req1 = { ...req, addBtnFocus: true };
    t.is(getNavRowCol({ ...req1, dy: -1 }, true).row, 5);
});

test('getNavRowCol (list page, from add button) row navigated to being the add row, if going left', t => {
    const req1 = { ...req, addBtnFocus: true };
    t.is(getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).row, -1);
});

test('getNavRowCol (list page, from add button) row navigated to being the first content row, otherwise', t => {
    const req1 = { ...req, addBtnFocus: true };
    t.is(getNavRowCol({ ...req1, dx: 0, dy: 1 }, true).row, 1);
    t.is(getNavRowCol({ ...req1, dx: 1, dy: 0 }, true).row, 1);
});

test('getNavRowCol (list page, from add button) column navigated to being the first, if going right', t => {
    const req1 = { ...req, addBtnFocus: true };
    t.is(getNavRowCol({ ...req1, dx: 1, dy: 0 }, true).col, 0);
});

test('getNavRowCol (list page, from add button) column navigated to being the last, otherwise', t => {
    const req1 = { ...req, addBtnFocus: true };
    t.is(getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).col, 2);
    t.is(getNavRowCol({ ...req1, dx: 0, dy: 1 }, true).col, 2);
    t.is(getNavRowCol({ ...req1, dx: 0, dy: -1 }, true).col, 2);
});

test('getNavRowCol (list page, inactive state) row navigated to being the last, if going backwards', t => {
    const req1 = { ...req, currentRow: -1, currentCol: -1 };
    t.is(getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).row, 5);
    t.is(getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).row, 5);
});

test('getNavRowCol (list page, inactive state) row navigated to being the add row, otherwise', t => {
    const req1 = { ...req, currentRow: -1, currentCol: -1 };
    t.is(getNavRowCol({ ...req1, dx: 1, dy: 0 }, true).row, -1);
    t.is(getNavRowCol({ ...req1, dx: 0, dy: 1 }, true).row, -1);
});

test('getNavRowCol (list page) row navigated to being the last (looping), if navigating backwards from the top', t => {
    const req1 = { ...req, currentCol: 0, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).row, 5);
    t.is(getNavRowCol({ ...req1, dx: 0, dy: -1 }, true).row, 5);
});

test('getNavRowCol (list page, currently on add row) row navigated to being the first content row, if at the end and going forward', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }, true).row, 1);
});

test('getNavRowCol (list page, currently on add row) row navigated to being the first content row, if going down', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }, true).row, 1);
});

test('getNavRowCol (list page, currently on add row) row navigated to being the add row (unchanged), if not at the end, but going forward', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }, true).row, -1);
});

test('getNavRowCol (list page, currently on add row) row navigated to being the last row (looping), if at the start and going backwards', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }, true).row, 5);
});

test('getNavRowCol (list page, currently on add row) row navigated to being the last row (looping), if going up', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }, true).row, 5);
});

test('getNavRowCol (list page, on first content row) row navigated to being the next row, if at the end and going forward', t => {
    const req1 = { ...req, currentRow: 1 };
    t.is(getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }, true).row, 2);
});

test('getNavRowCol (list page, on first content row) row navigated to being the next row, if going down', t => {
    const req1 = { ...req, currentRow: 1 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }, true).row, 2);
});

test('getNavRowCol (list page, on first content row) row navigated to being the same row, if not at the end, but going forward', t => {
    const req1 = { ...req, currentRow: 1 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }, true).row, 1);
});

test('getNavRowCol (list page, on first content row) row navigated to being the add row, if at the start and going backwards', t => {
    const req1 = { ...req, currentRow: 1 };
    t.is(getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }, true).row, -1);
});

test('getNavRowCol (list page, on first content row) row navigated to being the add row, if going up', t => {
    const req1 = { ...req, currentRow: 1 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }, true).row, -1);
});

test('getNavRowCol (list page, somewhere in middle) row navigated to being the next row, if at the end and going forward', t => {
    const req1 = { ...req, currentRow: 3 };
    t.is(getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }, true).row, 4);
});

test('getNavRowCol (list page, somewhere in middle) row navigated to being the next row, if going down', t => {
    const req1 = { ...req, currentRow: 3 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }, true).row, 4);
});

test('getNavRowCol (list page, somewhere in middle) row navigated to being the same row, if not at the end, but going forward', t => {
    const req1 = { ...req, currentRow: 3 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }, true).row, 3);
});

test('getNavRowCol (list page, somewhere in middle) row navigated to being the previous row, if at the start and going backwards', t => {
    const req1 = { ...req, currentRow: 3 };
    t.is(getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }, true).row, 2);
});

test('getNavRowCol (list page, somewhere in middle) row navigated to being the previous row, if going up', t => {
    const req1 = { ...req, currentRow: 3 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }, true).row, 2);
});

test('getNavRowCol (list page, at the end) row navigated to being the add row, if at the end and going forward', t => {
    const req1 = { ...req, currentRow: 5 };
    t.is(getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }, true).row, -1);
});

test('getNavRowCol (list page, at the end) row navigated to being the add row, if going down', t => {
    const req1 = { ...req, currentRow: 5 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }, true).row, -1);
});

test('getNavRowCol (list page, at the end) row navigated to being the same row, if not at the end, but going forward', t => {
    const req1 = { ...req, currentRow: 5 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }, true).row, 5);
});

test('getNavRowCol (list page, at the end) row navigated to being the previous row, if at the start and going backwards', t => {
    const req1 = { ...req, currentRow: 5 };
    t.is(getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }, true).row, 4);
});

test('getNavRowCol (list page, at the end) row navigated to being the previous row, if going up', t => {
    const req1 = { ...req, currentRow: 5 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }, true).row, 4);
});

test('getNavRowCol (list page) column navigated to being unchanged, if only going up or down', t => {
    t.is(getNavRowCol({ ...req, currentCol: 0, dx: 0, dy: -1 }, true).col, 0);
    t.is(getNavRowCol({ ...req, currentCol: 0, dx: 0, dy: 1 }, true).col, 0);
    t.is(getNavRowCol({ ...req, currentCol: 1, dx: 0, dy: -1 }, true).col, 1);
    t.is(getNavRowCol({ ...req, currentCol: 1, dx: 0, dy: 1 }, true).col, 1);
});

test('getNavRowCol (list page, at beginning) column navigated to being the last column (looping), if going backwards', t => {
    const req1 = { ...req, currentCol: 0 };
    t.is(getNavRowCol({ ...req1, dx: -1 }, true).col, 2);
});

test('getNavRowCol (list page, at beginning) column navigated to being the next column, if going forwards', t => {
    const req1 = { ...req, currentCol: 0 };
    t.is(getNavRowCol({ ...req1, dx: 1 }, true).col, 1);
});

test('getNavRowCol (list page, in the middle) column navigated to being the previous column, if going backwards', t => {
    const req1 = { ...req, currentCol: 1 };
    t.is(getNavRowCol({ ...req1, dx: -1 }, true).col, 0);
});

test('getNavRowCol (list page, in the middle) column navigated to being the next column, if going forwards', t => {
    const req1 = { ...req, currentCol: 1 };
    t.is(getNavRowCol({ ...req1, dx: 1 }, true).col, 2);
});

test('getNavRowCol (list page, at the end) column navigated to being the previous column, if going backwards', t => {
    const req1 = { ...req, currentCol: 2 };
    t.is(getNavRowCol({ ...req1, dx: -1 }, true).col, 1);
});

test('getNavRowCol (list page, at the end) column navigated to being the first column (looping), if going forwards', t => {
    const req1 = { ...req, currentCol: 2 };
    t.is(getNavRowCol({ ...req1, dx: 1 }, true).col, 0);
});

test('getNavRowCol (non-list page, inactive state) row navigated to being the last, if going backwards', t => {
    const req1 = { ...req, currentRow: 0, currentCol: -1 };
    t.is(getNavRowCol({ ...req1, dx: -1, dy: 0 }).row, 4);
    t.is(getNavRowCol({ ...req1, dx: -1, dy: 0 }).row, 4);
});

test('getNavRowCol (non-list page, inactive state) row navigated to being the first row, otherwise', t => {
    const req1 = { ...req, currentRow: 0, currentCol: -1 };
    t.is(getNavRowCol({ ...req1, dx: 1, dy: 0 }).row, 0);
    t.is(getNavRowCol({ ...req1, dx: 0, dy: 1 }).row, 0);
});

test('getNavRowCol (non-list page, backwards from top) row navigated to being the last (looping), if navigating backwards from the top', t => {
    const req1 = { ...req, currentCol: 0, currentRow: 0 };

    t.is(getNavRowCol({ ...req1, dx: -1, dy: 0 }).row, 4);
    t.is(getNavRowCol({ ...req1, dx: 0, dy: -1 }).row, 4);
});

test('getNavRowCol (non-list page, on first row) row navigated to being the next row, if at the end and going forward', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }).row, 1);
});

test('getNavRowCol (non-list page, on first row) row navigated to being the next row, if going down', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }).row, 1);
});

test('getNavRowCol (non-list page, on first row) row navigated to being the same row, if not at the end, but going forward', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }).row, 0);
});

test('getNavRowCol (non-list page, on first row) row navigated to being the last row (looping), if at the start and going backwards', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }).row, 4);
});

test('getNavRowCol (non-list page, on first row) row navigated to being the last row (looping), if going up', t => {
    const req1 = { ...req, currentRow: 0 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }).row, 4);
});

test('getNavRowCol (non-list page, in the middle) row navigated to being the next row, if at the end and going forward', t => {
    const req1 = { ...req, currentRow: 2 };
    t.is(getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }).row, 3);
});

test('getNavRowCol (non-list page, in the middle) row navigated to being the next row, if going down', t => {
    const req1 = { ...req, currentRow: 2 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }).row, 3);
});

test('getNavRowCol (non-list page, in the middle) row navigated to being the same row, if not at the end, but going forward', t => {
    const req1 = { ...req, currentRow: 2 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }).row, 2);
});

test('getNavRowCol (non-list page, in the middle) row navigated to being the previous row, if at the start and going backwards', t => {
    const req1 = { ...req, currentRow: 2 };
    t.is(getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }).row, 1);
});

test('getNavRowCol (non-list page, in the middle) row navigated to being the previous row, if going up', t => {
    const req1 = { ...req, currentRow: 2 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }).row, 1);
});

test('getNavRowCol (non-list page, at the end) row navigated to being the first row (looping), if at the end and going forward', t => {
    const req1 = { ...req, currentRow: 4 };
    t.is(getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }).row, 0);
});

test('getNavRowCol (non-list page, at the end) row navigated to being the first row (looping), if going down', t => {
    const req1 = { ...req, currentRow: 4 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }).row, 0);
});

test('getNavRowCol (non-list page, at the end) row navigated to being the same row, if not at the end, but going forward', t => {
    const req1 = { ...req, currentRow: 4 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }).row, 4);
});

test('getNavRowCol (non-list page, at the end) row navigated to being the previous row, if at the start and going backwards', t => {
    const req1 = { ...req, currentRow: 4 };
    t.is(getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }).row, 3);
});

test('getNavRowCol (non-list page, at the end) row navigated to being the previous row, if going up', t => {
    const req1 = { ...req, currentRow: 4 };
    t.is(getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }).row, 3);
});

test('getNavRowCol (non-list page, only going up or down) column navigated to being unchanged, if only going up or down', t => {
    t.is(getNavRowCol({ ...req, currentCol: 0, dx: 0, dy: -1 }).col, 0);
    t.is(getNavRowCol({ ...req, currentCol: 0, dx: 0, dy: 1 }).col, 0);
    t.is(getNavRowCol({ ...req, currentCol: 1, dx: 0, dy: -1 }).col, 1);
    t.is(getNavRowCol({ ...req, currentCol: 1, dx: 0, dy: 1 }).col, 1);
});

test('getNavRowCol (non-list page, at the beginning) column navigated to being the last column (looping), if going backwards', t => {
    const req1 = { ...req, currentCol: 0 };
    t.is(getNavRowCol({ ...req1, dx: -1 }).col, 2);
});

test('getNavRowCol (non-list page, at the beginning) column navigated to being the next column, if going forwards', t => {
    const req1 = { ...req, currentCol: 0 };
    t.is(getNavRowCol({ ...req1, dx: 1 }).col, 1);
});

test('getNavRowCol (non-list page, in the middle) column navigated to being the previous column, if going backwards', t => {
    const req1 = { ...req, currentCol: 1 };
    t.is(getNavRowCol({ ...req1, dx: -1 }).col, 0);
});

test('getNavRowCol (non-list page, in the middle) column navigated to being the next column, if going forwards', t => {
    const req1 = { ...req, currentCol: 1 };
    t.is(getNavRowCol({ ...req1, dx: 1 }).col, 2);
});

test('getNavRowCol (non-list page, at the end) column navigated to being the previous column, if going backwards', t => {
    const req1 = { ...req, currentCol: 2 };
    t.is(getNavRowCol({ ...req1, dx: -1 }).col, 1);
});

test('getNavRowCol (non-list page, at the end) column navigated to being the first column (looping), if going forwards', t => {
    const req1 = { ...req, currentCol: 2 };
    t.is(getNavRowCol({ ...req1, dx: 1 }).col, 0);
});

test('getNumRowsCols returning the number in the data, if the page isn\'t a list page', t => {
    t.deepEqual(
        getNumRowsCols(fromJS({
            pages: {
                overview: {
                    rows: [0, 0, 0, 0, 0, 0]
                }
            }
        }), 'overview', false),
        { numRows: 6, numCols: 1 }
    );
});

test('getNumRowsCols adding one (for the add row) if the page is a list page', t => {
    t.deepEqual(
        getNumRowsCols(fromJS({
            pages: {
                food: {
                    rows: [0, 0, 0, 0, 0, 0]
                }
            }
        }), 'food', true),
        { numRows: 7, numCols: 5 }
    );
});

test('getCurrentRowCol getting the current row and column from the editing object', t => {
    t.deepEqual(
        getCurrentRowCol(fromJS({ row: 10, col: 13 })),
        {
            currentRow: 10,
            currentCol: 13
        }
    );
});

