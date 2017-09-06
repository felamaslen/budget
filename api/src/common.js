/**
 * Common methods / functions
 */

const config = require('./config')();

function monthLength(year, month) {
    // month is 1-indexed here
    if (month === 2) {
        // february may be a leap year
        const yearIsLeap = year % 4 === 0 && (year % 400 === 0 || year % 100 !== 0);
        if (yearIsLeap) {
            return 29;
        }

        return 28;
    }

    if (month < 8) {
        return 30 + (month % 2);
    }

    return 30 + ((month - 1) % 2);
}

function monthAdd(referenceMonth, monthDifference) {
    // note that `referenceMonth` is 1-indexed, and this function returns
    // a 1-index month
    return (((referenceMonth + monthDifference) % 12 + 11) % 12) + 1;
}

function yearAddMonth(
    referenceYear, referenceMonth, monthDifference, min = -Infinity, max = Infinity
) {
    return referenceYear + Math.min(max, Math.max(min, Math.floor(
        (referenceMonth - 1 + monthDifference) / 12
    )));
}

function getBeginningOfWeek(date) {
    return new Date(date.getTime() - 86400 * 1000 * date.getDay());
}

function strip(string) {
    return string
        .replace(/\s+/g, ' ');
}

function getErrorStatus(err) {
    let statusCode = 400;
    const errorMessage = err.message;

    if (err.message === config.errorServerDb) {
        statusCode = 500;
    }

    return { statusCode, errorMessage };
}

module.exports = {
    monthLength,
    monthAdd,
    yearAddMonth,
    getBeginningOfWeek,
    strip,
    getErrorStatus
};

