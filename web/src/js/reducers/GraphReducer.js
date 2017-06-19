/*
 * Carries out actions for the graph components
 */

export const rToggleShowAll = reduction => {
  return reduction.setIn(
    ['appState', 'showAllBalanceGraph'],
    !reduction.getIn(['appState', 'showAllBalanceGraph']));
};

