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
        return year > price.year || year === price.year && month >= price.month;
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

async function queryFundPrices(db, user) {
    const result = await db.query(`
    SELECT
        ft.time,
        GROUP_CONCAT(f.id) AS id,
        GROUP_CONCAT(fc.price) AS price
    FROM fund_cache fc
    INNER JOIN fund_hash fh ON fh.fid = fc.fid
    INNER JOIN fund_cache_time ft ON ft.cid = fc.cid AND ft.done = 1
    INNER JOIN funds f ON MD5(CONCAT(f.item, ?)) = fh.hash AND f.uid = ?
    GROUP BY ft.cid
    ORDER BY ft.time DESC
    `, config.data.fundSalt, user.uid);

    return result;
}

function processFundPrices(queryResult) {
    return queryResult
        .map(item => {
            const ids = item.id.split(',').map(id => parseInt(id, 10));
            const prices = item.price.split(',').map(price => parseFloat(price, 10));

            const dateTime = new Date(item.time * 1000);
            const year = dateTime.getFullYear();
            const month = dateTime.getMonth() + 1;

            return { ids, prices, year, month };
        })
        .reduce((items, item) => {
            if (!items) {
                return [item];
            }

            if (item.year !== items[items.length - 1].year ||
                item.month !== items[items.length - 1].month) {

                items.push(item);
            }

            return items;
        }, null)
        .reduce((obj, item) => {
            item.ids.forEach((id, key) => {
                const itemObj = {
                    year: item.year,
                    month: item.month,
                    value: item.prices[key]
                };

                if (id in obj) {
                    obj[id].push(itemObj);
                }
                else {
                    obj[id] = [itemObj];
                }
            });

            return obj;
        }, {});
}

async function queryFundTransactions(db, user) {
    const result = await db.query(`
    SELECT id, transactions FROM funds WHERE uid = ?
    `, user.uid);

    return result;
}

function processFundTransactions(queryResult) {
    return queryResult
        .reduce((obj, item) => {
            let transactions = [];

            try {
                transactions = JSON.parse(item.transactions)
                    .map(transaction => {
                        return {
                            date: transaction.d,
                            units: transaction.u,
                            cost: transaction.c
                        };
                    });
            }
            catch (err) {
                // invalid JSON stored in database - why?
            }
            finally {
                obj[item.id] = transactions;
            }

            return obj;
        }, {});
}

function handler(req, res) {
    return res.end('Overview data not done');
}

function getMonthlyTotalFundValues(yearMonths, fundTransactions, fundPrices) {
    const transactionsIds = Object.keys(fundTransactions);
    const pricesIds = Object.keys(fundPrices);

    const idsWithPricesAndTransactions = pricesIds
        .filter(id => transactionsIds.indexOf(id) !== -1);

    return yearMonths
        .map(yearMonth => {
            const year = yearMonth[0];
            const month = yearMonth[1];

            const totalFundsValue = idsWithPricesAndTransactions
                .map(id => {
                    const value = getFundValue(year, month, fundTransactions[id], fundPrices[id]);

                    return value;
                })
                .reduce((sum, value) => sum + value, 0);

            return Math.round(totalFundsValue);
        });
}

module.exports = {
    getStartYearMonth,
    getEndYearMonth,
    getYearMonths,
    getFundValue,
    queryFundPrices,
    processFundPrices,
    queryFundTransactions,
    processFundTransactions,
    getMonthlyTotalFundValues,
    handler
};

