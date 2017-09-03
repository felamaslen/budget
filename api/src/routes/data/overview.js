/**
 * Overview data methods
 */

const config = require('../../config')();

function getStartYearMonth(options) {
    let startMonth = (options.now.getMonth() + 1 - options.pastMonths + 11) % 12 + 1;
    let startYear = options.now.getFullYear() - Math.max(
        0, Math.ceil((options.pastMonths - options.now.getMonth()) / 12)
    );

    if (startYear < config.data.overview.startYear ||
        startYear === config.data.overview.startYear && startMonth < config.data.overview.startMonth
    ) {
        startMonth = config.data.overview.startMonth;
        startYear = config.data.overview.startYear;
    }

    return { startYear, startMonth };
}

function getEndYearMonth(options) {
    const endMonth = (options.now.getMonth() + options.futureMonths) % 12 + 1;
    const endYear = options.now.getFullYear() + Math.floor(
        (options.futureMonths + options.now.getMonth() + 1) / 12
    );

    return { endYear, endMonth };
}

function getYearMonths(options) {
    const { startYear, startMonth } = getStartYearMonth(options);
    const { endYear, endMonth } = getEndYearMonth(options);

    const numMonths = 12 * (endYear - startYear) + endMonth - startMonth + 1;

    const yearMonths = new Array(numMonths)
        .fill(0)
        .map((item, key) => {
            const year = startYear + Math.ceil((key + startMonth - 12) / 12);
            const month = (startMonth + key - 1) % 12 + 1;

            return [year, month];
        });

    return yearMonths;
}

function handler(req, res) {
    return res.end('Overview data not done');
}

module.exports = {
    getStartYearMonth,
    getEndYearMonth,
    getYearMonths,
    handler
};

