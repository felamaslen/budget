import { Map as map, List as list } from 'immutable';

import { getAddDefaultValues } from '../misc/data';
import { LIST_COLS_PAGES } from '../misc/const';
import { getInvalidInsertDataKeys, rAddListItem } from './EditReducer';

export function rOpenFormDialogEdit(reduction, req) {
    const pageIndex = req.pageIndex;
    const rowItem = reduction.getIn(['appState', 'pages', pageIndex, 'rows', req.rowKey]);

    const fields = rowItem.get('cols')
        .map((value, key) => {
            const item = LIST_COLS_PAGES[pageIndex][key];

            return map({ item, value });
        });

    const id = rowItem.get('id');

    return reduction
        .setIn(['appState', 'modalDialog'], map({
            active: true,
            type: 'edit',
            row: req.rowKey,
            id,
            fields,
            invalidKeys: list.of()
        }));
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
            id: null,
            fields,
            invalidKeys: list.of()
        }));
}

export function rCloseFormDialogEdit(reduction, req) {
    return reduction;
}

export function rCloseFormDialogAdd(reduction, pageIndex) {
    const resetDialog = red => red
        .setIn(['appState', 'modalDialog', 'active'], false)
        .setIn(['appState', 'modalDialog', 'type'], null)
        .setIn(['appState', 'modalDialog', 'fields'], list.of())
        .setIn(['appState', 'modalDialog', 'invalidKeys'], list.of());

    if (pageIndex === null) {
        return resetDialog(reduction);
    }

    if (reduction.getIn(['appState', 'loadingApi'])) {
        return reduction;
    }

    const fields = reduction.getIn(['appState', 'modalDialog', 'fields']);
    const invalidKeys = getInvalidInsertDataKeys(fields);

    if (invalidKeys.size > 0) {
        return reduction
            .setIn(['appState', 'modalDialog', 'invalidKeys'], invalidKeys);
    }

    const items = fields.map(field => {
        return {
            props: {
                item: field.get('item'),
                value: field.get('value')
            }
        };
    });

    return resetDialog(
        rAddListItem(reduction, items)
    );
}

export function rHandleFormInputChange(reduction, req) {
    return reduction
        .setIn(['appState', 'modalDialog', 'fields', req.fieldKey, 'value'], req.value);
}

