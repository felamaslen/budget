/**
 * Process list data
 */

import { List as list, Map as map } from 'immutable';

import { PAGES, DATA_KEY_ABBR } from '~client/constants/data';
import { dateInput } from '~client/modules/date';
import { getTransactionsList } from '~client/modules/data';

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
                return getTransactionsList(value);
            }

            return value;
        });

        return [id, map({ id, cols })];
    }));
}

export const getListData = (page, { total }) => map({ total });

export function processPageDataList(state, { page, raw }) {
    const data = getListData(page, raw);
    const rows = processRawListRows(raw.data, page);

    return state.setIn(['pages', page], map({ data, rows }));
}
