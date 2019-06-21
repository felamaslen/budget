const { DateTime } = require('luxon');

function getNow(config) {
    return DateTime.local().setZone(config.timeZone);
}

module.exports = {
    getNow
};
