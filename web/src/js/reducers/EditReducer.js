/**
 * Carries out actions for the editable framework
 */

import { Map as map } from 'immutable';
import { rGetOverviewRows } from '../reducers/data/overview';

const applyEditsOverview = (reduction, item) => {
  // update the balance for a row and recalculate overview data
  const value = item.get('value');
  const row = item.get('row');
  const newData = reduction.getIn(['appState', 'pages', 0, 'data'])
  .setIn(['cost', 'balance', row], value);

  return reduction.setIn(['appState', 'pages', 0, 'data'], newData)
  .setIn(['appState', 'pages', 0, 'rows'], rGetOverviewRows(newData));
};

/**
 * applyEdits: apply editItem edits to UI (API handled separately)
 * @param {Record} reduction: reduction to modify and return
 * @param {map} item: edit item
 * @returns {Record} modified reduction
 */
const applyEdits = (reduction, item) => {
  const page = item.get('page');
  if (page === 'overview') {
    return applyEditsOverview(reduction, item);
  }
  return reduction;
};

export const rActivateEditable = (reduction, editable) => {
  let newReduction = reduction;
  const active = reduction.getIn(['appState', 'edit', 'active']);
  const queue = reduction.getIn(['appState', 'edit', 'queue']);

  // confirm the previous item's edits
  if (active && active.get('value') !== active.get('originalValue') && active.get('row') > -1) {
    // add last item to queue for saving on API
    newReduction = newReduction.setIn(['appState', 'edit', 'queue'], queue.push(active));

    // append the changes of the last item to the UI
    newReduction = applyEdits(newReduction, active);
  }

  // can pass null to deactivate editing
  if (!editable) {
    return reduction.setIn(['appState', 'edit', 'active'], map({
      row: active.get('row') === -1 ? -1 : 0,
      col: -1,
      page: null,
      item: null,
      value: null,
      originalValue: null
    }));
  }

  newReduction = newReduction.setIn(
    ['appState', 'edit', 'active'],
    editable.set('originalValue', editable.get('value'))
  );
  return newReduction;
};

export const rChangeEditable = (reduction, value) => {
  return reduction.setIn(['appState', 'edit', 'active', 'value'], value);
};

