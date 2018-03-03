/**
 * Common methods / functions
 */

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

class ErrorBadRequest extends Error {
    constructor(message, code = 400) {
        super(message);

        this.statusCode = code;
    }
}

module.exports = {
    monthLength,
    monthAdd,
    yearAddMonth,
    ErrorBadRequest
};

