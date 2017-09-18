import { Map as map, List as list } from 'immutable';

import { getAddDefaultValues } from '../misc/data';
import { LIST_COLS_PAGES } from '../misc/const';
import { getInvalidInsertDataKeys, stringifyFields } from './EditReducer';

import buildMessage from '../messageBuilder';
import { EF_SERVER_ADD_REQUESTED } from '../constants/effects';

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

function resetModalDialog(reduction) {
    return reduction
        .setIn(['appState', 'modalDialog', 'active'], false)
        .setIn(['appState', 'modalDialog', 'type'], null)
        .setIn(['appState', 'modalDialog', 'fields'], list.of())
        .setIn(['appState', 'modalDialog', 'invalidKeys'], list.of());
}

export function rCloseFormDialogEdit(reduction, pageIndex, fields) {
    return reduction; // TODO
}

export function rCloseFormDialogAdd(reduction, pageIndex, fields) {
    const item = stringifyFields(fields);
    const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
    const req = { apiKey, item, fields, pageIndex };

    return resetModalDialog(reduction)
        .set('effects', reduction
            .get('effects')
            .push(buildMessage(EF_SERVER_ADD_REQUESTED, req))
        );
}

export function rCloseFormDialog(reduction, pageIndex) {
    if (pageIndex === null) {
        return resetModalDialog(reduction);
    }

    const fields = reduction.getIn(['appState', 'modalDialog', 'fields']);
    const invalidKeys = getInvalidInsertDataKeys(fields);

    if (invalidKeys.size > 0) {
        return reduction
            .setIn(['appState', 'modalDialog', 'invalidKeys'], invalidKeys);
    }

    const type = reduction.getIn(['appState', 'modalDialog', 'type']);

    if (type === 'edit') {
        return rCloseFormDialogEdit(reduction, pageIndex, fields);
    }

    if (type === 'add') {
        return rCloseFormDialogAdd(reduction, pageIndex, fields);
    }

    return reduction;
}

export function rHandleFormInputChange(reduction, req) {
    return reduction
        .setIn(['appState', 'modalDialog', 'fields', req.fieldKey, 'value'], req.value);
}

