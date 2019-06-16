const { unflatten } = require('flat');

function mapInternalToExternal(map) {
    return dbResult => unflatten(map.reduce((items, { internal, external }) => {
        if (internal in items) {
            const { [internal]: value, ...rest } = items;

            return { ...rest, [external]: value };
        }

        return items;
    }, dbResult));
}

function mapExternalToInternal(map) {
    return jsObject => map.reduce((items, { internal, external }) => {
        const keys = external.split('.');
        const deepValue = keys.reduce((obj, key) => obj && obj[key], jsObject);

        if (typeof deepValue !== 'undefined') {
            const { [keys[0]]: discard, ...rest } = items;

            return { ...rest, [internal]: deepValue };
        }

        return items;
    }, jsObject);
}

module.exports = {
    mapInternalToExternal,
    mapExternalToInternal
};
