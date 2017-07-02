/**
 * Carries out actions for the editable framework
 */

import { List as list, Map as map } from 'immutable';
import buildMessage from '../messageBuilder';
import { EF_SERVER_ADD_REQUESTED, EF_SUGGESTIONS_REQUESTED } from '../constants/effects';
import { rGetOverviewRows, rCalculateOverview, rProcessDataOverview } from './data/overview';
import { getGainComparisons, addPriceHistory } from './data/funds';
import {
  PAGES, LIST_PAGES, LIST_COLS_PAGES, ERROR_LEVEL_WARN, ERROR_LEVEL_ERROR
} from '../misc/const';
import {
  ERROR_MSG_BAD_DATA, ERROR_MSG_API_FAILED, ERROR_MSG_BUG_INVALID_ITEM
} from '../misc/config';
import { YMD } from '../misc/date';
import {
  uuid, getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages
} from '../misc/data';
import { rErrorMessageOpen } from './ErrorReducer';

const recalculateFundProfits = (reduction, pageIndex) => {
  const transactionsKey = LIST_COLS_PAGES[pageIndex].indexOf('transactions');
  const history = reduction.getIn(['appState', 'pages', pageIndex, 'history']);
  const oldRows = reduction.getIn(['appState', 'pages', pageIndex, 'rows']);
  const newRows = getGainComparisons(oldRows.map(row => {
    return addPriceHistory(pageIndex, row, history, row.getIn(['cols', transactionsKey]));
  }));
  return reduction.setIn(['appState', 'pages', pageIndex, 'rows'], newRows);
};

const overviewKey = PAGES.indexOf('overview');
const applyEditsOverview = (reduction, item) => {
  // update the balance for a row and recalculate overview data
  const value = item.get('value');
  const row = item.get('row');

  const newCost = reduction
  .getIn(['appState', 'pages', overviewKey, 'data', 'cost'])
  .setIn(['balance', row], value);

  const startYearMonth = reduction.getIn(['appState', 'pages', overviewKey, 'data', 'startYearMonth']);
  const endYearMonth = reduction.getIn(['appState', 'pages', overviewKey, 'data', 'endYearMonth']);
  const currentYearMonth = reduction.getIn(['appState', 'pages', overviewKey, 'data', 'currentYearMonth']);
  const futureMonths = reduction.getIn(['appState', 'pages', overviewKey, 'data', 'futureMonths']);

  const newData = rProcessDataOverview(
    newCost, startYearMonth, endYearMonth, currentYearMonth, futureMonths);

  return reduction.setIn(['appState', 'pages', overviewKey, 'data'], newData)
  .setIn(['appState', 'pages', overviewKey, 'rows'], rGetOverviewRows(newData));
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

  // recalculate total if the cost has changed
  if (item.get('item') === 'cost') {
    newReduction = newReduction.setIn(
      ['appState', 'pages', pageIndex, 'data', 'total'],
      newReduction.getIn(['appState', 'pages', pageIndex, 'data', 'total']) +
        item.get('value') - item.get('originalValue')
    );
  }

  // recalculate fund profits / losses if transactions have changed
  if (PAGES[pageIndex] === 'funds' && item.get('item') === 'transactions') {
    newReduction = recalculateFundProfits(newReduction, pageIndex);
  }

  // sort rows by date
  const sortedRows = sortRowsByDate(
    newReduction.getIn(['appState', 'pages', pageIndex, 'rows']), pageIndex);
  const weeklyData = addWeeklyAverages(
    newReduction.getIn(['appState', 'pages', pageIndex, 'data']), sortedRows, pageIndex);

  newReduction = newReduction.setIn(['appState', 'pages', pageIndex, 'rows'], sortedRows)
  .setIn(['appState', 'pages', pageIndex, 'data'], weeklyData);

  // recalculate overview data if the cost or date changed
  if (reduction.getIn(['appState', 'pagesLoaded', overviewKey])) {
    if (item.get('item') === 'cost') {
      const dateKey = LIST_COLS_PAGES[pageIndex].indexOf('date');
      const date = newReduction.getIn(
        ['appState', 'pages', pageIndex, 'rows', item.get('row'), 'cols', dateKey]);

      newReduction = rCalculateOverview(
        newReduction, pageIndex, date, date, item.get('value'), item.get('originalValue'));
    }
    else if (item.get('item') === 'date') {
      const costKey = LIST_COLS_PAGES[pageIndex].indexOf('cost');
      const cost = newRow.getIn(['cols', costKey]);

      newReduction = rCalculateOverview(
        newReduction, pageIndex, item.get('value'), item.get('originalValue'), cost, cost);
    }
  }

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

export const rActivateEditable = (reduction, editable, cancel) => {
  const active = reduction.getIn(['appState', 'edit', 'active']);
  const queue = reduction.getIn(['appState', 'edit', 'queue']);
  const pageIndex = reduction.getIn(['appState', 'currentPageIndex']);
  let newReduction = reduction
  .setIn(['appState', 'edit', 'addBtnFocus'], false)
  .setIn(['appState', 'edit', 'suggestions', 'list'], list.of())
  .setIn(['appState', 'edit', 'suggestions', 'active'], -1)
  .setIn(['appState', 'edit', 'suggestions', 'loading'], false)
  .setIn(['appState', 'edit', 'suggestions', 'reqId'], null);

  // confirm the previous item's edits
  if (active && active.get('value') !== active.get('originalValue')) {
    if (cancel) {
      // revert to previous state
      newReduction = applyEdits(newReduction, active.set('value', active.get('originalValue')));
    }
    else {
      if (active.get('row') > -1) {
        // add last item to queue for saving on API
        newReduction = newReduction.setIn(['appState', 'edit', 'queue'], queue.push(active));
      }

      // append the changes of the last item to the UI
      newReduction = applyEdits(newReduction, active, pageIndex);
    }
  }

  // can pass null to deactivate editing
  if (!editable) {
    return newReduction.setIn(['appState', 'edit', 'active'], getNullEditable(pageIndex));
  }

  return newReduction.setIn(
    ['appState', 'edit', 'active'],
    editable.set('originalValue', editable.get('value'))
  );
};

export const rChangeEditable = (reduction, value) => {
  return reduction.setIn(['appState', 'edit', 'active', 'value'], value);
};

export const rDeleteListItem = (reduction, item) => {
  let newReduction = reduction;

  const pageIndex = item.pageIndex;
  const id = reduction.getIn(['appState', 'pages', pageIndex, 'rows', item.key, 'id']);
  const dateKey = LIST_COLS_PAGES[pageIndex].indexOf('date');
  const costKey = LIST_COLS_PAGES[pageIndex].indexOf('cost');
  const itemCost = reduction.getIn(['appState', 'pages', pageIndex, 'rows', item.key, 'cols', costKey]);

  // recalculate total
  newReduction = newReduction.setIn(
    ['appState', 'pages', pageIndex, 'data', 'total'],
    newReduction.getIn(['appState', 'pages', pageIndex, 'data', 'total']) - itemCost
  );
  // sort rows and recalculate weekly data
  const sortedRows = sortRowsByDate(
    newReduction.getIn(['appState', 'pages', pageIndex, 'rows']).splice(item.key, 1), pageIndex);
  const weeklyData = addWeeklyAverages(
    newReduction.getIn(['appState', 'pages', pageIndex, 'data']), sortedRows, pageIndex);

  // recalculate overview data
  if (reduction.getIn(['appState', 'pagesLoaded', overviewKey])) {
    const date = reduction.getIn(['appState', 'pages', pageIndex, 'rows', item.key, 'cols', dateKey]);
    newReduction = rCalculateOverview(newReduction, pageIndex, date, date, 0, itemCost);
  }

  newReduction = newReduction.setIn(
    ['appState', 'edit', 'queueDelete'],
    reduction.getIn(['appState', 'edit', 'queueDelete']).push({ pageIndex, id })
  )
  .setIn(['appState', 'pages', pageIndex, 'rows'], sortedRows)
  .setIn(['appState', 'pages', pageIndex, 'data'], weeklyData);

  // recalculate fund profits / losses
  if (PAGES[pageIndex] === 'funds') {
    newReduction = recalculateFundProfits(newReduction, pageIndex);
  }

  return newReduction;
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
  .setIn(['appState', 'edit', 'add'], list.of())
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

  const cols = list(item.map(thisItem => thisItem.value));

  // update total and push new item to the data store list, then sort by date
  const sortedRows = sortRowsByDate(
    reduction.getIn(['appState', 'pages', pageIndex, 'rows']).push(map({ id, cols })), pageIndex);
  const weeklyData = addWeeklyAverages(
    reduction.getIn(['appState', 'pages', pageIndex, 'data']), sortedRows, pageIndex);

  newReduction = newReduction
  .setIn(['appState', 'pages', pageIndex, 'rows'], sortedRows)
  .setIn(['appState', 'pages', pageIndex, 'data'], weeklyData)
  .setIn(['appState', 'pages', pageIndex, 'data', 'total'], newTotal)
  .setIn(
    ['appState', 'pages', pageIndex, 'data', 'numRows'],
    newReduction.getIn(['appState', 'pages', pageIndex, 'data', 'numRows']) + 1
  );

  // recalculate overview data
  if (reduction.getIn(['appState', 'pagesLoaded', overviewKey])) {
    const costItem = item.find(thisItem => thisItem.item === 'cost');
    const dateItem = item.find(thisItem => thisItem.item === 'date');
    if (typeof costItem === 'undefined' || typeof dateItem === 'undefined') {
      return rErrorMessageOpen(newReduction, map({
        level: ERROR_LEVEL_WARN,
        text: ERROR_MSG_BUG_INVALID_ITEM
      }));
    }
    newReduction = rCalculateOverview(
      newReduction, pageIndex, dateItem.value, dateItem.value, costItem.value, 0);
  }

  if (reduction.getIn(['appState', 'currentPageIndex']) !== pageIndex) {
    return newReduction;
  }

  // go back to the add form to add a new item
  const now = new YMD();
  return newReduction.setIn(['appState', 'edit', 'add'], getAddDefaultValues(pageIndex))
  .setIn(['appState', 'edit', 'active'], map({
    row: -1,
    col: 0,
    pageIndex,
    id: null,
    item: 'date',
    value: now,
    originalValue: now
  })).setIn(['appState', 'edit', 'addBtnFocus'], false);
};

export const rHandleSuggestions = (reduction, obj) => {
  const newReduction = reduction
  .setIn(['appState', 'edit', 'suggestions', 'loading'], false)
  .setIn(['appState', 'edit', 'suggestions', 'active'], -1);

  if (!obj || reduction.getIn(
    ['appState', 'edit', 'suggestions', 'reqId']
  ) !== obj.reqId) {
    // null object (clear), or changed input while suggestions were loading
    return newReduction
    .setIn(['appState', 'edit', 'suggestions', 'list'], list.of())
    .setIn(['appState', 'edit', 'suggestions', 'reqId'], null);
  }
  return newReduction.setIn(['appState', 'edit', 'suggestions', 'list'], obj.items);
};

export const rRequestSuggestions = (reduction, value) => {
  if (reduction.getIn(['appState', 'edit', 'suggestions', 'loading'])) {
    return reduction;
  }
  if (!value.length) {
    return rHandleSuggestions(reduction, null);
  }

  const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);

  const active = reduction.getIn(['appState', 'edit', 'active']);
  const page = PAGES[active.get('pageIndex')];
  const column = active.get('item');

  const reqId = uuid(); // for keeping track of EditItem requests

  const req = { reqId, apiKey, page, column, value };
  return reduction.set('effects', reduction.get('effects').push(
    buildMessage(EF_SUGGESTIONS_REQUESTED, req)
  ))
  .setIn(['appState', 'edit', 'suggestions', 'loading'], true)
  .setIn(['appState', 'edit', 'suggestions', 'reqId'], reqId);
};

const rFundTransactions = (reduction, row, col, callback) => {
  const pageIndex = PAGES.indexOf('funds');
  const transactions = callback(reduction.getIn(
    row > -1
    ? ['appState', 'pages', pageIndex, 'rows', row, 'cols', col]
    : ['appState', 'edit', 'add', col]
  ));

  if (row > -1) {
    return reduction.setIn(
      ['appState', 'pages', pageIndex, 'rows', row, 'cols', col], transactions
    ).setIn(
      ['appState', 'edit', 'active', 'value'], transactions
    );
  }

  return reduction.setIn(
    ['appState', 'edit', 'add', col], transactions
  );
};

export const rChangeFundTransactions = (reduction, item) => {
  return rFundTransactions(reduction,
    item.row, item.col, transactions => transactions.setIn([item.key, item.column], item.value));
};

export const rAddFundTransactions = (reduction, item) => {
  return rFundTransactions(reduction,
    item.row, item.col, transactions => transactions.push(item));
};

export const rRemoveFundTransactions = (reduction, item) => {
  return rFundTransactions(reduction,
    item.row, item.col, transactions => transactions.remove(item.key));
};

