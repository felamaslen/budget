/*
 * Carries out actions for the error messages component
 */

export function rErrorMessageOpen(reduction, message) {
    const errorMsg = reduction.getIn(['errorMsg']);

    const item = message
        .set('time', new Date().getTime());

    return reduction.setIn(['errorMsg'], errorMsg.push(item));
}
export function rErrorMessageClose(reduction, msgId) {
    return reduction.setIn(['errorMsg'], reduction
        .getIn(['errorMsg'])
        .map(msg => {
            if (msg.get('id') === msgId) {
                return msg.set('closed', true);
            }

            return msg;
        })
    );
}
export function rErrorMessageRemove(reduction, msgId) {
    return reduction.setIn(['errorMsg'], reduction
        .getIn(['errorMsg'])
        .filter(msg => msg.get('id') !== msgId)
    );
}


