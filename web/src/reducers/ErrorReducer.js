/*
 * Carries out actions for the error messages component
 */

import { Map as map } from 'immutable';
import { ERROR_LEVEL_ERROR } from '../misc/const';

export function rErrorMessageOpen(reduction, msg) {
    const theMessage = typeof msg === 'string'
        ? map({ level: ERROR_LEVEL_ERROR, text: msg })
        : msg;

    const errorMsg = reduction.getIn(['errorMsg']);

    const item = theMessage
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


