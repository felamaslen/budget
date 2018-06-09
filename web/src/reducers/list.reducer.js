/**
 * Process list data
 */

import { List as list, Map as map } from 'immutable';

import { PAGES, DATA_KEY_ABBR } from '../constants/data';
import { dateInput } from '../helpers/date';
import { TransactionsList } from '../helpers/data';

export function processRawListRows(rows, page) {
    const listCols = list(PAGES[page].cols);

    return map(rows.map(({ [DATA_KEY_ABBR.id]: id, ...row }) => {
        const cols = listCols.map(col => {
            const value = row[DATA_KEY_ABBR[col]];

            if (col === 'date') {
                return dateInput(value, false);
            }

            if (col === 'transactions') {
                // transactions list
                return new TransactionsList(value);
            }

            return value;
        });

        return [id, map({ id, cols })];
    }));
}

export function getListData(page, raw) {
    const numRows = raw.data.length;
    const numCols = PAGES[page].cols.length;
    const total = raw.total;

    return map({ numRows, numCols, total });
}

export function processPageDataList(state, { page, raw }) {
    const data = getListData(page, raw);
    const rows = processRawListRows(raw.data, page);

    return state.setIn(['pages', page], map({ data, rows }));
}

