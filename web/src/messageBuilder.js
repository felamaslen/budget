/*
 * Builds actions for communicating between the views and store,
 * with possible side effects
 */

function buildMessage(type, payload) {
    return { type, payload };
}

export default (type, payload, effect = null) => {
    if (effect) {
        return {
            ...buildMessage(type, payload),
            effect: buildMessage(effect, payload)
        };
    }

    return buildMessage(type, payload);
};

