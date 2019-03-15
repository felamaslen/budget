/**
 * Helper functions for the app reducer to decide how to navigate in the app
 */

import { PAGES } from '~client/constants/data';

function getNavRow({ dx, dy, numRows, numCols, currentRow, currentCol }) {
    const wasInactive = currentCol === -1 && currentRow === 0;

    if (wasInactive) {
        if (dx < 0 || dy < 0) {
            return numRows - 1;
        }

        return 0;
    }

    const backwardsFromTop = currentCol === 0 && currentRow === 0 && (dx < 0 || dy < 0);
    if (backwardsFromTop) {
        return numRows - 1;
    }

    const rowsJumped = Math.floor((currentCol + dx) / numCols);

    return (currentRow + dy + rowsJumped + numRows) % numRows;
}

function getNavRowFromAddButton(dx, dy, rowKeys) {
    if (dy < 0) {
        return rowKeys.last();
    }

    if (dx < 0) {
        return -1;
    }

    return rowKeys.first();
}

function getNavRowList({ dx, dy, rowKeys, numCols, currentRow, currentCol, addBtnFocus }) {
    if (addBtnFocus) {
        return getNavRowFromAddButton(dx, dy, rowKeys);
    }

    const wasInactive = currentRow === -1 && currentCol === -1;
    if (wasInactive) {
        if (dx < 0 || dy < 0) {
            return rowKeys.last();
        }

        return -1;
    }

    const backwardsFromTop = currentCol === 0 && currentRow === 0 && (dx < 0 || dy < 0);
    if (backwardsFromTop) {
        return rowKeys.last();
    }

    const rowsJumped = dy + Math.floor((currentCol + dx) / numCols);
    const currentRowKey = rowKeys.indexOf(currentRow);

    const currentlyAtTop = currentRowKey === -1;
    if (currentlyAtTop) {
        if (rowsJumped > 0) {
            return rowKeys.get(rowsJumped - 1);
        }

        if (rowsJumped < 0) {
            return rowKeys.get(rowKeys.size + rowsJumped);
        }

        return -1;
    }

    const newRowKey = currentRowKey + rowsJumped;
    if (newRowKey < 0 || newRowKey > rowKeys.size - 1) {
        return -1;
    }

    return rowKeys.get(currentRowKey + rowsJumped);
}

function getNavCol({ dx, dy, numCols, currentRow, currentCol, addBtnFocus }) {
    if (addBtnFocus) {
        // navigate from the add button
        if (dx > 0) {
            return 0;
        }

        return numCols - 1;
    }

    const wasInactive = currentRow === -1 && currentCol === -1;
    if (wasInactive) {
        if (dx < 0 || dy < 0) {
            return numCols - 1;
        }

        return 0;
    }

    const backwardsFromTop = currentCol === 0 && currentRow === 0 && (dx < 0 || dy < 0);
    if (backwardsFromTop) {
        // go to the end if navigating backwards
        return numCols - 1;
    }

    return (currentCol + dx + numCols) % numCols;
}

export function getNavRowCol(req, pageIsList = false) {
    const row = pageIsList
        ? getNavRowList(req)
        : getNavRow(req);

    const col = getNavCol(req);

    return { row, col };
}

export function getNumRowsCols(state, page, pageIsList) {
    const listAddRow = pageIsList >> 0;
    const numRows = state.getIn(['pages', page, 'rows']).size + listAddRow;
    const numCols = PAGES[page].cols.length;

    return { numRows, numCols };
}

export function getCurrentRowCol(editing) {
    const currentRow = editing.get('row');
    const currentCol = editing.get('col');

    return { currentRow, currentCol };
}

