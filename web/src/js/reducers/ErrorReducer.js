/*
 * Carries out actions for the error messages component
 */

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

