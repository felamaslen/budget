/*
 * Carries out actions for the error messages component
 */

import { uuid } from '../misc/data';

export function rErrorMessageOpen(reduction, message) {
    return reduction.set('errorMsg', reduction
        .get('errorMsg')
        .push(message.set('id', uuid()))
    );
}
export function rErrorMessageClose(reduction, msgId) {
    return reduction.set('errorMsg', reduction
        .get('errorMsg')
        .map(msg => {
            if (msg.get('id') === msgId) {
                return msg.set('closed', true);
            }

            return msg;
        })
    );
}
export function rErrorMessageRemove(reduction, msgId) {
    return reduction.set('errorMsg', reduction
        .get('errorMsg')
        .filter(msg => msg.get('id') !== msgId)
    );
}
