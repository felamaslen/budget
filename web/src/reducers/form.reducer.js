import { Map as map, List as list } from 'immutable';
import { compose } from 'redux';
import { getNow } from '~client/selectors/app';
import { rCalculateOverview } from './overview.reducer';
import { addToRequestQueue } from './request-queue.reducer';
import { stringifyFields, getInvalidInsertDataKeys, updateTotal } from './edit.reducer';
import { IDENTITY, dataEquals, getAddDefaultValues, resortListRows } from '~client/modules/data';
import { PAGES } from '~client/constants/data';

export function rOpenFormDialogEdit(state, { page, id }) {
    const rowItem = state.getIn(['pages', page, 'rows', id]);

    const fields = rowItem.get('cols')
        .map((value, key) => map({
            item: PAGES[page].cols[key],
            value
        }));

    const modalDialog = state
        .get('modalDialog')
        .set('active', true)
        .set('visible', true)
        .set('type', 'edit')
        .set('id', id)
        .set('fields', fields)
        .set('fieldsValidated', list.of())
        .set('fieldsString', null)
        .set('invalidKeys', list.of());

    return state.set('modalDialog', modalDialog);
}

export function rOpenFormDialogAdd(state, { page }) {
    const values = getAddDefaultValues(page, getNow(state));
    const fields = list(PAGES[page].cols)
        .map((item, key) => map({ item, value: values.get(key) }));

    const modalDialog = state
        .get('modalDialog')
        .set('active', true)
        .set('visible', true)
        .set('type', 'add')
        .set('id', null)
        .set('fields', fields)
        .set('fieldsValidated', list.of())
        .set('fieldsString', null)
        .set('invalidKeys', list.of());

    return state.set('modalDialog', modalDialog);
}

function resetModalDialog(state, remove = false) {
    const newModalDialog = state
        .get('modalDialog')
        .set('loading', false);

    if (remove) {
        return state.set('modalDialog', newModalDialog
            .set('active', false)
            .set('type', null)
            .set('fields', list.of())
            .set('fieldsString', null)
            .set('fieldsValidated', list.of())
            .set('invalidKeys', list.of())
        );
    }

    return state.set('modalDialog', newModalDialog.set('visible', false));
}

function updateRows(page, id, newRow) {
    return state => state.setIn(['pages', page, 'rows', id], newRow);
}

function updateRequestList(page, id, fields) {
    return state => state.setIn(['edit', 'requestList'],
        fields.map(field => field.set('id', id).set('page', page))
            .reduce(
                (requestList, field) => addToRequestQueue(requestList, field),
                state.getIn(['edit', 'requestList'])
            )
    );
}

export function rCloseFormDialogEdit(state, { page, fields }) {
    const id = state.getIn(['modalDialog', 'id']);

    const oldRow = state.getIn(['pages', page, 'rows', id]);
    const newRow = oldRow.set('cols', fields.map(field => field.get('value')));

    const nextState = resetModalDialog(state);

    const changed = newRow
        .get('cols')
        .reduce((status, item, key) => {
            if (status || !dataEquals(item, oldRow.getIn(['cols', key]))) {
                return true;
            }

            return false;
        }, false);

    if (!changed) {
        return nextState;
    }

    let doOverview = IDENTITY;
    let doTotal = IDENTITY;

    const dateKey = PAGES[page].cols.indexOf('date');
    const costKey = PAGES[page].cols.indexOf('cost');
    if (dateKey > -1 && costKey > -1) {
        const newDate = newRow.getIn(['cols', dateKey]);
        const oldDate = oldRow.getIn(['cols', dateKey]);
        const newItemCost = newRow.getIn(['cols', costKey]);
        const oldItemCost = oldRow.getIn(['cols', costKey]);

        doOverview = rCalculateOverview({ page, newDate, oldDate, newItemCost, oldItemCost });

        const oldTotal = state.getIn(['pages', page, 'data', 'total']);
        const newTotal = oldTotal + newRow.getIn(['cols', costKey]) -
            oldRow.getIn(['cols', costKey]);

        doTotal = updateTotal(page, newTotal);
    }

    return compose(
        updateRequestList(page, id, fields),
        doOverview,
        doTotal,
        resortListRows(page, state.get('now')),
        updateRows(page, id, newRow)
    )(nextState);
}

export function validateFields(fields) {
    const invalidKeys = getInvalidInsertDataKeys(fields);

    return { fields, invalidKeys };
}

export function rCloseFormDialog(state, { page, deactivate }) {
    if (deactivate || typeof page === 'undefined') {
        return resetModalDialog(state, deactivate);
    }

    const type = state.getIn(['modalDialog', 'type']);
    const rawFields = state.getIn(['modalDialog', 'fields']);

    const { fields, invalidKeys } = validateFields(rawFields);
    if (invalidKeys.size) {
        return state
            .setIn(['modalDialog', 'invalidKeys'], invalidKeys);
    }

    if (type === 'add') {
        return state
            .setIn(['modalDialog', 'loading'], true)
            .setIn(['modalDialog', 'fieldsString'], stringifyFields(fields))
            .setIn(['modalDialog', 'fieldsValidated'], fields);
    }

    if (type === 'edit') {
        return rCloseFormDialogEdit(state, { page, fields });
    }

    return state;
}

export function rHandleFormInputChange(state, req) {
    return state
        .setIn(['modalDialog', 'fields', req.fieldKey, 'value'], req.value);
}

