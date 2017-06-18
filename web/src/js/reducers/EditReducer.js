/**
 * Carries out actions for the editable framework
 */

import { Map as map } from 'immutable';
import { rGetOverviewRows } from '../reducers/data/overview';
import { LIST_PAGES, LIST_COLS_PAGES } from '../misc/const';

const applyEditsOverview = (reduction, item) => {
  // update the balance for a row and recalculate overview data
  const value = item.get('value');
  const row = item.get('row');
  const newData = reduction.getIn(['appState', 'pages', 0, 'data'])
  .setIn(['cost', 'balance', row], value);

  return reduction.setIn(['appState', 'pages', 0, 'data'], newData)
  .setIn(['appState', 'pages', 0, 'rows'], rGetOverviewRows(newData));
};

const applyEditsList = (reduction, item, pageIndex) => {
  // update list data in the UI
  if (item.get('row') === -1) {
    // add-item
    return reduction.setIn(['appState', 'edit', 'add', item.get('col')], item.get('value'));
  }

  // update row
  const newRow = reduction.getIn(
    ['appState', 'pages', pageIndex, 'rows', item.get('row')])
    .setIn(['cols', item.get('col')], item.get('value'));

  let newReduction = reduction.setIn(
    ['appState', 'pages', pageIndex, 'rows', item.get('row')], newRow);

  // recalculate total
  const costKey = LIST_COLS_PAGES[pageIndex].indexOf('cost');
  const newTotal = newReduction.getIn(['appState', 'pages', pageIndex, 'rows']).reduce((a, b) => {
    return a + b.getIn(['cols', costKey]);
  }, 0);

  newReduction = newReduction.setIn(['appState', 'pages', pageIndex, 'data', 'total'], newTotal);

  // sort rows by date
  newReduction = newReduction.setIn(
    ['appState', 'pages', pageIndex, 'rows'],
    newReduction.getIn(['appState', 'pages', pageIndex, 'rows']).sort((a, b) => {
      if (a.getIn(['cols', 0]).isAfter(b.getIn(['cols', 0]))) {
        return -1;
      }
      if (b.getIn(['cols', 0]).isAfter(a.getIn(['cols', 0]))) {
        return 1;
      }
      if (a.get('id') > b.get('id')) {
        return -1;
      }
      return 1;
    })
  );

  return newReduction;
};

/**
 * applyEdits: apply editItem edits to UI (API handled separately)
 * @param {Record} reduction: reduction to modify and return
 * @param {map} item: edit item
 * @param {integer} pageIndex: index of the page on which edits are being done
 * @returns {Record} modified reduction
 */
const applyEdits = (reduction, item, pageIndex) => {
  if (pageIndex === 0) {
    return applyEditsOverview(reduction, item);
  }
  if (LIST_PAGES.indexOf(pageIndex) > -1) {
    return applyEditsList(reduction, item, pageIndex);
  }
  return reduction;
};

export const rActivateEditable = (reduction, editable) => {
  let newReduction = reduction;
  const active = reduction.getIn(['appState', 'edit', 'active']);
  const queue = reduction.getIn(['appState', 'edit', 'queue']);
  const pageIndex = reduction.getIn(['appState', 'currentPageIndex']);

  // confirm the previous item's edits
  if (active && active.get('value') !== active.get('originalValue')) {
    if (active.get('row') > -1) {
      // add last item to queue for saving on API
      newReduction = newReduction.setIn(['appState', 'edit', 'queue'], queue.push(active));
    }

    // append the changes of the last item to the UI
    newReduction = applyEdits(newReduction, active, pageIndex);
  }

  // can pass null to deactivate editing
  if (!editable) {
    return reduction.setIn(['appState', 'edit', 'active'], map({
      row: active.get('row') === -1 ? -1 : 0,
      col: -1,
      pageIndex: null,
      id: null,
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

