import { Map as map, List as list } from 'immutable';

import { rCalculateOverview } from './data/overview';
import { dataEquals, getAddDefaultValues } from '../misc/data';
import { LIST_COLS_PAGES, PAGES } from '../misc/const';
import {
    getInvalidInsertDataKeys,
    stringifyFields,
    resortListRows,
    recalculateFundProfits
} from './EditReducer';

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
    const rowKey = reduction.getIn(['appState', 'modalDialog', 'row']);

    const oldRow = reduction.getIn(['appState', 'pages', pageIndex, 'rows', rowKey]);

    const newRow = oldRow.set('cols', fields.map(field => field.get('value')));

    let newReduction = resetModalDialog(reduction);

    const changed = newRow
        .get('cols')
        .reduce((status, item, key) => {
            if (status || !dataEquals(item, oldRow.getIn(['cols', key]))) {
                return true;
            }

            return false;
        }, false);

    if (!changed) {
        return newReduction;
    }

    const overviewKey = PAGES.indexOf('overview');
    const dateKey = LIST_COLS_PAGES[pageIndex].indexOf('date');
    const costKey = LIST_COLS_PAGES[pageIndex].indexOf('cost');

    const oldTotal = reduction.getIn(
        ['appState', 'pages', pageIndex, 'data', 'total']
    );
    const newTotal = oldTotal + newRow.getIn(['cols', costKey]) -
        oldRow.getIn(['cols', costKey]);

    if (PAGES[pageIndex] === 'funds') {
        newReduction = recalculateFundProfits(newReduction, pageIndex);
    }

    newReduction = resortListRows(newReduction, pageIndex);

    if (reduction.getIn(['appState', 'pagesLoaded', overviewKey])) {
        const newDate = newRow.getIn(['cols', dateKey]);
        const oldDate = oldRow.getIn(['cols', dateKey]);

        const newCost = newRow.getIn(['cols', costKey]);
        const oldCost = oldRow.getIn(['cols', costKey]);

        newReduction = rCalculateOverview(
            newReduction,
            pageIndex,
            newDate,
            oldDate,
            newCost,
            oldCost
        );
    }

    const id = reduction.getIn(['appState', 'modalDialog', 'id']);
    const fieldsWithIds = id
        ? fields.map(field => field.set('id', id))
        : fields;

    const queue = reduction.getIn(['appState', 'edit', 'queue'])
        .concat(fieldsWithIds.map(field => field.set('pageIndex', pageIndex)));

    return resetModalDialog(newReduction)
        .setIn(['appState', 'edit', 'queue'], queue)
        .setIn(['appState', 'pages', pageIndex, 'rows', rowKey], newRow)
        .setIn(['appState', 'pages', pageIndex, 'data', 'total'], newTotal);
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

