/**
 * Overview data methods
 */

/* eslint max-lines: [1, 500] */

const config = require('../../config')();

function getStartYearMonth(options) {
    let startMonth = (((options.now.getMonth() + 1 - options.pastMonths) % 12 + 11) % 12) + 1;
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

async function getMonthlyValuesQuery(db, user, yearMonths, category) {
    const subUnion = yearMonths
        .slice(1)
        .map(item => `SELECT ${item[0]}, ${item[1]}`)
        .reduce((red, item, key) => {
            if (key > 0) {
                return `${red} UNION ${item}`;
            }

            return ` UNION ${item}`;
        }, '');

    const union = `SELECT ${yearMonths[0][0]} AS year, ${yearMonths[0][1]} AS month${subUnion}`;

    const result = await db.query(`
    SELECT SUM(cost) AS monthCost FROM (${union}) AS dates
    LEFT JOIN \`${category}\` AS list
    ON uid = ? AND list.year = dates.year AND list.month = dates.month
    GROUP BY dates.year, dates.month
    `, user.uid);

    return result;
}

async function getMonthlyValues(db, user, yearMonths, category) {
    if (category === 'funds') {
        const transactionsQuery = await queryFundTransactions(db, user);
        const fundTransactions = processFundTransactions(transactionsQuery);

        const pricesQuery = await queryFundPrices(db, user);
        const fundPrices = processFundPrices(pricesQuery);

        return getMonthlyTotalFundValues(yearMonths, fundTransactions, fundPrices);
    }

    const queryResult = await getMonthlyValuesQuery(db, user, yearMonths, category);

    return queryResult
        .map(item => item.monthCost || 0);
}

async function getMonthlyBalanceQuery(db, user) {
    const result = await db.query(`
    SELECT year, month, balance
    FROM balance
    WHERE uid = ?
    ORDER BY year, month
    `, user.uid);

    return result;
}

function getMonthlyBalance(queryResult, yearMonths) {
    const balance = yearMonths
        .map(item => {
            const value = queryResult
                .filter(result => result.year === item[0] && result.month === item[1])
                .map(result => result.balance);

            return value.length
                ? value[0]
                : 0;
        });

    const oldRed = queryResult
        .filter(result => {
            return result.year < yearMonths[0][0] ||
                result.year === yearMonths[0][0] && result.month < yearMonths[0][1];
        })
        .reduce((last, result) => {
            const numZeroesAfter = Math.max(
                0,
                12 * (yearMonths[0][0] - result.year) + yearMonths[0][1] - result.month - 1
            );

            const red = {
                year: result.year,
                month: result.month,
                numZeroesAfter
            };

            if (!last.values.length) {
                return Object.assign({}, red, { values: [result.balance] });
            }

            const gapSinceLast = 12 * (result.year - last.year) + result.month - last.month - 1;

            if (gapSinceLast > 0) {
                return Object.assign({}, red, {
                    values: last.values
                        .concat(new Array(gapSinceLast).fill(0))
                        .concat([result.balance])
                });
            }

            return Object.assign({}, red, { values: last.values.concat([result.balance]) });
        }, { numZeroesAfter: 0, values: [] });

    const old = oldRed.values.concat(new Array(oldRed.numZeroesAfter).fill(0));

    return { balance, old };
}

async function getMonthlyCategoryValues(db, user, yearMonths, categories) {
    const promises = categories.map(
        category => getMonthlyValues(db, user, yearMonths, category)
    );

    const results = await Promise.all(promises);

    return results
        .reduce((obj, result, key) => {
            obj[categories[key]] = result;

            return obj;
        }, {});
}

async function handler(req, res) {
    const yearMonths = getYearMonths({
        now: new Date(),
        pastMonths: config.data.overview.numLast,
        futureMonths: config.data.overview.numFuture,
        startYear: config.data.overview.startYear,
        startMonth: config.data.overview.startMonth
    });

    const monthCost = await getMonthlyCategoryValues(
        req.db, req.user, yearMonths, config.data.listCategories
    );

    return res.json({
        error: false,
        data: {
            cost: monthCost
        }
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
    getMonthlyValuesQuery,
    getMonthlyValues,
    getMonthlyBalanceQuery,
    getMonthlyBalance,
    getMonthlyCategoryValues,
    handler
};

