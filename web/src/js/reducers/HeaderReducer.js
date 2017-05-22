/*
 * Carries out actions for the Form component
 */

/**
 * Log out of the system
 * @param {Record} reduction application state
 * @returns {Record} modified reduction
 */
export const rLogout = reduction => {
  return reduction.setIn(['appState', 'user', 'uid'], 0)
  .setIn(['appState', 'user', 'name'], null)
  .setIn(['appState', 'user', 'apiKey'], null);
};

