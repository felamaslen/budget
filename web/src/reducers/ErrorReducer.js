/*
 * Carries out actions for the error messages component
 */

import { Map as map } from 'immutable';
import { ERROR_MESSAGE_DELAY } from '../misc/config';
import { ERROR_CLOSE_TIME, ERROR_LEVEL_ERROR } from '../misc/const';

export function rErrorMessageOpen(reduction, msg) {
    const theMessage = typeof msg === 'string'
        ? map({ level: ERROR_LEVEL_ERROR, text: msg })
        : msg;

    const errorMsg = reduction.getIn(['errorMsg']);
    const item = theMessage.set('id', errorMsg.size)
        .set('time', new Date().getTime());

    return reduction.setIn(['errorMsg'], errorMsg.push(item));
}
export function rErrorMessageClose(reduction, msgId) {
    return reduction.setIn(
        ['errorMsg'], reduction.getIn(['errorMsg']).map(msg => {
            if (msg.get('id') === msgId) {
                return msg.set('closed', true);
            }

            return msg;
        }));
}
export function rErrorMessageRemove(reduction, msgId) {
    return reduction.setIn(
        ['errorMsg'], reduction.getIn(['errorMsg']).filter(
            msg => msg.get('id') !== msgId
        ));
}

export function rErrorMessageClearOld(reduction) {
    // automatically clear any messages which are older than the timeout period
    const msgs = reduction.getIn(['errorMsg']);
    const now = new Date().getTime();
    let newReduction = reduction;

    msgs.forEach((msg, key) => {
        const closed = msg.get('closed');
        const age = now - msg.get('time');
        if (!closed) {
            // check if we need to close it
            if (age >= ERROR_MESSAGE_DELAY) {
                newReduction = newReduction.setIn(
                    ['errorMsg', key, 'closed'], true
                ).setIn(
                    ['errorMsg', key, 'time'], now
                );
            }
        }
        else if (age > ERROR_CLOSE_TIME) {
            // check if we need to delete it
            newReduction = rErrorMessageRemove(newReduction, msg.get('id'));
        }
    });

    return newReduction;
}

