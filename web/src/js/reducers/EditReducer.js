/**
 * Carries out actions for the editable framework
 */

import { Map as map } from 'immutable';

export const rActivateEditable = (reduction, editable) => {
  let newReduction = reduction;
  const active = reduction.getIn(['appState', 'edit', 'active']);
  const queue = reduction.getIn(['appState', 'edit', 'queue']);

  // confirm the previous item's edits
  if (active && active.get('value') !== active.get('originalValue')) {
    newReduction = newReduction.setIn(['appState', 'edit', 'queue'], queue.push(active));
  }

  // can pass null to deactivate editing
  if (!editable) {
    if (active.get('row') === -1) {
      return reduction;
    }
    return reduction.setIn(['appState', 'edit', 'active'], map({
      row: 0,
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

