/**
 * Common methods / functions
 */

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

module.exports = {
    monthAdd,
    yearAddMonth
};

