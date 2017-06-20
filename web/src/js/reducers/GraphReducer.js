/*
 * Carries out actions for the graph components
 */

import { PAGES } from '../misc/const';
import { getFormattedHistory } from './data/funds';

const pageIndexFunds = PAGES.indexOf('funds');

export const rToggleShowAll = reduction => {
  return reduction.setIn(
    ['appState', 'other', 'showAllBalanceGraph'],
    !reduction.getIn(['appState', 'other', 'showAllBalanceGraph']));
};

export const rToggleFundItemGraph = (reduction, key) => {
  return reduction.setIn(
    ['appState', 'pages', pageIndexFunds, 'rows', key, 'historyPopout'],
    !reduction.getIn(['appState', 'pages', pageIndexFunds, 'rows', key, 'historyPopout'])
  );
};

export const rToggleFundsGraphMode = reduction => {
  const newMode = (reduction.getIn(['appState', 'other', 'graphFunds', 'mode']) + 1) % 3;
  return getFormattedHistory(
    reduction.setIn(['appState', 'other', 'graphFunds', 'mode'], newMode),
    pageIndexFunds,
    reduction.getIn(['appState', 'pages', pageIndexFunds, 'history'])
  );
};

