import { Map as map, List as list } from 'immutable';

import { rCalculateOverview } from './overview.reducer';
import { addToRequestQueue } from './request-queue.reducer';
import { resortListRows, recalculateFundProfits } from './editable-updates.reducer';
import { stringifyFields, getInvalidInsertDataKeys } from './edit.reducer';

import { dataEquals, getAddDefaultValues } from '../misc/data';
import { LIST_COLS_PAGES, PAGES } from '../misc/const';

export function rOpenFormDialogEdit(reduction, { pageIndex, id }) {
    const rowItem = reduction.getIn(['pages', pageIndex, 'rows', id]);

    const fields = rowItem.get('cols')
        .map((value, key) => {
            const item = LIST_COLS_PAGES[pageIndex][key];

            return map({ item, value });
        });

    const modalDialog = reduction
        .get('modalDialog')
        .set('active', true)
        .set('visible', true)
        .set('type', 'edit')
        .set('id', id)
        .set('fields', fields)
        .set('fieldsValidated', list.of())
        .set('fieldsString', null)
        .set('invalidKeys', list.of());

    return reduction.set('modalDialog', modalDialog);
}

export function rOpenFormDialogAdd(reduction, { pageIndex }) {
    const values = getAddDefaultValues(pageIndex);
    const fields = list(LIST_COLS_PAGES[pageIndex])
        .map((item, key) => map({ item, value: values.get(key) }));

    const modalDialog = reduction
        .get('modalDialog')
        .set('active', true)
        .set('visible', true)
        .set('type', 'add')
        .set('id', null)
        .set('fields', fields)
        .set('fieldsValidated', list.of())
        .set('fieldsString', null)
        .set('invalidKeys', list.of());

    return reduction.set('modalDialog', modalDialog);
}

function resetModalDialog(reduction, remove = false) {
    const newModalDialog = reduction
        .get('modalDialog')
        .set('loading', false);

    if (remove) {
        return reduction.set('modalDialog', newModalDialog
            .set('active', false)
            .set('type', null)
            .set('fields', list.of())
            .set('fieldsString', null)
            .set('fieldsValidated', list.of())
            .set('invalidKeys', list.of())
        );
    }

    return reduction.set('modalDialog', newModalDialog.set('visible', false));
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

    newReduction = newReduction.setIn(['pages', pageIndex, 'rows', id], newRow);

    if (PAGES[pageIndex] === 'funds') {
        newReduction = recalculateFundProfits(newReduction, pageIndex);
    }

    newReduction = resortListRows(newReduction, { pageIndex });

    if (reduction.getIn(['pagesLoaded', overviewKey])) {
        const newDate = newRow.getIn(['cols', dateKey]);
        const oldDate = oldRow.getIn(['cols', dateKey]);

        const newItemCost = newRow.getIn(['cols', costKey]);
        const oldItemCost = oldRow.getIn(['cols', costKey]);

        newReduction = rCalculateOverview(newReduction, {
            pageIndex,
            newDate,
            oldDate,
            newItemCost,
            oldItemCost
        });
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
        .setIn(['pages', pageIndex, 'data', 'total'], newTotal);
}

export function validateFields(fields) {
    const invalidKeys = getInvalidInsertDataKeys(fields);

    return { fields, invalidKeys };
}

export function rCloseFormDialog(reduction, { pageIndex, deactivate }) {
    if (deactivate || typeof pageIndex === 'undefined') {
        return resetModalDialog(reduction, deactivate);
    }

    const type = reduction.getIn(['modalDialog', 'type']);
    const rawFields = reduction.getIn(['modalDialog', 'fields']);

    const { fields, invalidKeys } = validateFields(rawFields);
    if (invalidKeys.size) {
        return reduction
            .setIn(['modalDialog', 'invalidKeys'], invalidKeys);
    }

    if (type === 'add') {
        return reduction
            .setIn(['modalDialog', 'loading'], true)
            .setIn(['modalDialog', 'fieldsString'], stringifyFields(fields))
            .setIn(['modalDialog', 'fieldsValidated'], fields);
    }

    if (type === 'edit') {
        return rCloseFormDialogEdit(reduction, pageIndex, fields);
    }

    return reduction;
}

export function rHandleFormInputChange(reduction, req) {
    return reduction
        .setIn(['modalDialog', 'fields', req.fieldKey, 'value'], req.value);
}

