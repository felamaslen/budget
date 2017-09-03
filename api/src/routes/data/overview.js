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

function getFundValue(year, month, transactions, prices) {
    const unitsToDate = transactions.reduce((sum, item) => {
        if (year > item.date[0] || year === item.date[0] && month >= item.date[1]) {
            return sum + item.units;
        }

        return sum;
    }, 0);

    const pricesToDate = prices.filter(price => {
        return year > price.date[0] || year === price.date[0] && month >= price.date[1];
    });

    if (!pricesToDate.length) {
        // there is no accurate price cached, so revert to the cost of the fund
        // (neglecting growth)
        const costToDate = transactions.reduce((sum, item) => {
            if (year > item.date[0] || year === item.date[0] && month >= item.date[1]) {
                return sum + item.cost;
            }

            return sum;
        }, 0);

        return costToDate;
    }

    // it is assumed that prices is ordered by date descending
    // we want the latest price, which will be the first item
    return pricesToDate[0].value * unitsToDate;
}

function handler(req, res) {
    return res.end('Overview data not done');
}

module.exports = {
    getStartYearMonth,
    getEndYearMonth,
    getYearMonths,
    getFundValue,
    handler
};

