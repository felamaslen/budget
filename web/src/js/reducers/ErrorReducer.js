/*
 * Carries out actions for the error messages component
 */

import { ERROR_MESSAGE_DELAY, ERROR_CLOSE_TIME } from '../misc/config';

export const rErrorMessageOpen = (reduction, msg) => {
  const errorMsg = reduction.getIn(['appState', 'errorMsg']);
  const item = msg.set('id', errorMsg.size)
  .set('time', new Date().getTime());

  return reduction.setIn(['appState', 'errorMsg'], errorMsg.push(item));
};
export const rErrorMessageClose = (reduction, msgId) => {
  return reduction.setIn(
    ['appState', 'errorMsg'], reduction.getIn(['appState', 'errorMsg']).map(msg => {
      if (msg.get('id') === msgId) {
        return msg.set('closed', true);
      }
      return msg;
    }));
};
export const rErrorMessageRemove = (reduction, msgId) => {
  return reduction.setIn(
    ['appState', 'errorMsg'], reduction.getIn(['appState', 'errorMsg']).filter(
      msg => msg.get('id') !== msgId
    ));
};

export const rErrorMessageClearOld = reduction => {
  // automatically clear any messages which are older than the timeout period
  const msgs = reduction.getIn(['appState', 'errorMsg']);
  const now = new Date().getTime();
  let newReduction = reduction;

  msgs.forEach((msg, key) => {
    const closed = msg.get('closed');
    const age = now - msg.get('time');
    if (!closed) {
      // check if we need to close it
      if (age >= ERROR_MESSAGE_DELAY) {
        newReduction = newReduction.setIn(
          ['appState', 'errorMsg', key, 'closed'], true
        ).setIn(
          ['appState', 'errorMsg', key, 'time'], now
        );
      }
    }
    else {
      // check if we need to delete it
      if (age > ERROR_CLOSE_TIME) {
        newReduction = rErrorMessageRemove(newReduction, msg.get('id'));
      }
    }
  });

  return newReduction;
};

