/*
 * Carries out actions for the error messages component
 */

export function rErrorMessageOpen(state, { message, msgId }) {
    return state.set('errorMsg', state
        .get('errorMsg')
        .push(message.set('id', msgId))
    );
}
export function rErrorMessageClose(state, { msgId }) {
    return state.set('errorMsg', state
        .get('errorMsg')
        .map(msg => {
            if (msg.get('id') === msgId) {
                return msg.set('closed', true);
            }

            return msg;
        })
    );
}
export function rErrorMessageRemove(state, { msgId }) {
    return state.set('errorMsg', state
        .get('errorMsg')
        .filter(msg => msg.get('id') !== msgId)
    );
}

