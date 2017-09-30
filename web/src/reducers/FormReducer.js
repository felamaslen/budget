import { Map as map, List as list } from 'immutable';

import { rCalculateOverview } from './data/overview';
import { dataEquals, getAddDefaultValues } from '../misc/data';
import { LIST_COLS_PAGES, PAGES } from '../misc/const';
import {
    getInvalidInsertDataKeys,
    stringifyFields,
    resortListRows,
    recalculateFundProfits,
    addToRequestQueue
} from './EditReducer';

import buildMessage from '../messageBuilder';

import { EF_SERVER_ADD_REQUESTED } from '../constants/effects';

export function rOpenFormDialogEdit(reduction, { pageIndex, id }) {
    const rowItem = reduction.getIn(['pages', pageIndex, 'rows', id]);

    const fields = rowItem.get('cols')
        .map((value, key) => {
            const item = LIST_COLS_PAGES[pageIndex][key];

            return map({ item, value });
        });

    return reduction
        .setIn(['modalDialog'], map({
            active: true,
            type: 'edit',
            id,
            fields,
            invalidKeys: list.of()
        }));
}

export function rOpenFormDialogAdd(reduction, { pageIndex }) {
    const values = getAddDefaultValues(pageIndex);
    const fields = list(LIST_COLS_PAGES[pageIndex])
        .map((item, key) => map({ item, value: values.get(key) }));

    return reduction
        .setIn(['modalDialog'], map({
            active: true,
            type: 'add',
            id: null,
            fields,
            invalidKeys: list.of()
        }));
}

function resetModalDialog(reduction) {
    return reduction
        .setIn(['modalDialog', 'active'], false)
        .setIn(['modalDialog', 'type'], null)
        .setIn(['modalDialog', 'fields'], list.of())
        .setIn(['modalDialog', 'invalidKeys'], list.of());
}

export function rCloseFormDialogEdit(reduction, pageIndex, fields) {
    const id = reduction.getIn(['modalDialog', 'id']);

    const oldRow = reduction.getIn(['pages', pageIndex, 'rows', id]);

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
        ['pages', pageIndex, 'data', 'total']
    );
    const newTotal = oldTotal + newRow.getIn(['cols', costKey]) -
        oldRow.getIn(['cols', costKey]);

    if (PAGES[pageIndex] === 'funds') {
        newReduction = recalculateFundProfits(newReduction, pageIndex);
    }

    newReduction = resortListRows(newReduction, pageIndex);

    if (reduction.getIn(['pagesLoaded', overviewKey])) {
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

    const newRequestList = fields
        .map(field => field
            .set('id', id)
            .set('pageIndex', pageIndex))
        .reduce(
            (requestList, field) => addToRequestQueue(requestList, field),
            reduction.getIn(['edit', 'requestList'])
        );

    return newReduction
        .setIn(['edit', 'requestList'], newRequestList)
        .setIn(['pages', pageIndex, 'rows', id], newRow)
        .setIn(['pages', pageIndex, 'data', 'total'], newTotal);
}

export function rCloseFormDialogAdd(reduction, pageIndex, fields) {
    const item = stringifyFields(fields);
    const apiKey = reduction.getIn(['user', 'apiKey']);
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

    const fields = reduction.getIn(['modalDialog', 'fields']);
    const invalidKeys = getInvalidInsertDataKeys(fields);

    if (invalidKeys.size > 0) {
        return reduction
            .setIn(['modalDialog', 'invalidKeys'], invalidKeys);
    }

    const type = reduction.getIn(['modalDialog', 'type']);

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
        .setIn(['modalDialog', 'fields', req.fieldKey, 'value'], req.value);
}

