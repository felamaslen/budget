import { Map as map, List as list } from 'immutable';

import { getAddDefaultValues } from '../misc/data';
import { LIST_COLS_PAGES } from '../misc/const';

export function rOpenFormDialogEdit(reduction, req) {
    return reduction;
}

export function rOpenFormDialogAdd(reduction, req) {
    const pageIndex = req.pageIndex;
    const values = getAddDefaultValues(pageIndex);
    const fields = list(LIST_COLS_PAGES[pageIndex])
        .map((item, key) => map({ item, value: values.get(key) }));

    return reduction
        .setIn(['appState', 'modalDialog'], map({
            active: true,
            type: 'add',
            row: null,
            col: null,
            id: null,
            fields
        }));
}

export function rCloseFormDialogEdit(reduction, req) {
    return reduction;
}

export function rCloseFormDialogAdd(reduction, req) {
    return reduction;
}

export function rHandleFormInputChange(reduction, req) {
}

