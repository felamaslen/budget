/*
 * Carries out actions for the graph components
 */

import { PAGES } from '../misc/const';

export const rToggleShowAll = reduction => {
  return reduction.setIn(
    ['appState', 'showAllBalanceGraph'],
    !reduction.getIn(['appState', 'showAllBalanceGraph']));
};

export const rToggleFundItemGraph = (reduction, key) => {
  const pageIndex = PAGES.indexOf('funds');
  return reduction.setIn(
    ['appState', 'pages', pageIndex, 'rows', key, 'historyPopout'],
    !reduction.getIn(['appState', 'pages', pageIndex, 'rows', key, 'historyPopout'])
  );
};

