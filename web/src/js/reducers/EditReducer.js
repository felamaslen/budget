/**
 * Carries out actions for the editable framework
 */

import { List as list, Map as map } from 'immutable';
import buildMessage from '../messageBuilder';
import { EF_SERVER_ADD_REQUESTED } from '../constants/effects';
import { rGetOverviewRows } from '../reducers/data/overview';
import {
  LIST_PAGES, LIST_COLS_PAGES, ERROR_LEVEL_WARN, ERROR_LEVEL_ERROR
} from '../misc/const';
import { ERROR_MSG_BAD_DATA, ERROR_MSG_API_FAILED } from '../misc/config';
import { getNullEditable } from '../misc/data.jsx';
import { rErrorMessageOpen } from './ErrorReducer';

const applyEditsOverview = (reduction, item) => {
  // update the balance for a row and recalculate overview data
  const value = item.get('value');
  const row = item.get('row');
  const newData = reduction.getIn(['appState', 'pages', 0, 'data'])
  .setIn(['cost', 'balance', row], value);

  return reduction.setIn(['appState', 'pages', 0, 'data'], newData)
  .setIn(['appState', 'pages', 0, 'rows'], rGetOverviewRows(newData));
};

const sortByDate = (reduction, pageIndex) => {
  return reduction.setIn(
    ['appState', 'pages', pageIndex, 'rows'],
    reduction.getIn(['appState', 'pages', pageIndex, 'rows']).sort((a, b) => {
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
  newReduction = sortByDate(newReduction, pageIndex);

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
    return reduction.setIn(['appState', 'edit', 'active'], getNullEditable(pageIndex));
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

export const rAddListItem = (reduction, items) => {
  if (reduction.getIn(['appState', 'loadingApi'])) {
    return reduction;
  }

  // validate items
  const active = reduction.getIn(['appState', 'edit', 'active']);
  let activeItem = null;
  let activeValue = null;
  if (active && active.get('row') === -1) {
    activeItem = active.get('item');
    activeValue = active.get('value');
  }

  const theItems = items.map(column => {
    const item = column.props.item;
    const value = item === activeItem ? activeValue : column.props.value;

    return { item, value };
  });

  const valid = theItems.reduce((a, b) => {
    const thisValid = b.item === 'item' ? b.value.length > 0 : true; // others are self-validating
    return thisValid ? a : false;
  }, true);

  if (!valid) {
    return rErrorMessageOpen(reduction, map({
      level: ERROR_LEVEL_WARN,
      text: ERROR_MSG_BAD_DATA
    }));
  }

  const item = {};
  theItems.forEach(thisItem => {
    item[thisItem.item] = thisItem.value.toString();
  });

  const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
  const pageIndex = reduction.getIn(['appState', 'currentPageIndex']);
  const req = { apiKey, item, theItems, pageIndex };

  return rActivateEditable(reduction, null)
  .setIn(['appState', 'edit', 'add'], list([]))
  .setIn(['appState', 'loadingApi'], true)
  .set('effects', reduction.get('effects').push(buildMessage(EF_SERVER_ADD_REQUESTED, req)));
};

export const rHandleServerAdd = (reduction, response) => {
  // handle the response from adding an item to a list page
  let newReduction = reduction.setIn(['appState', 'loadingApi'], false);
  if (response.response.data.error) {
    return rErrorMessageOpen(newReduction, map({
      level: ERROR_LEVEL_ERROR,
      text: `${ERROR_MSG_API_FAILED}: ${response.response.data.errorText}`
    }));
  }
  const pageIndex = response.pageIndex;
  const item = response.item;
  const id = response.response.data.id;
  const newTotal = response.response.data.total;

  newReduction = newReduction.setIn(['appState', 'pages', pageIndex, 'data', 'total'], newTotal);

  const cols = list(item.map(thisItem => thisItem.value));

  newReduction = newReduction.setIn(
    ['appState', 'pages', pageIndex, 'rows'],
    reduction.getIn(['appState', 'pages', pageIndex, 'rows']).push(map({ id, cols })));

  newReduction = newReduction.setIn(
    ['appState', 'pages', pageIndex, 'data', 'numRows'],
    newReduction.getIn(['appState', 'pages', pageIndex, 'rows']).size);

  newReduction = sortByDate(newReduction, pageIndex);

  return newReduction;
};

