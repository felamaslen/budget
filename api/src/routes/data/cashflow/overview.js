/**
 * Retrieve and process cash flow data, month-by-month
 */

/* eslint max-lines: [1, 500] */

const config = require('../../../config')();
const common = require('../../../common');

function getStartYearMonth(options) {
    let startMonth = common.monthAdd(options.now.getMonth() + 1, -options.pastMonths);

    let startYear = common.yearAddMonth(
        options.now.getFullYear(), options.now.getMonth() + 1, -options.pastMonths, -Infinity, 0
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
    const endMonth = common.monthAdd(options.now.getMonth() + 1, options.futureMonths);

    const endYear = common.yearAddMonth(
        options.now.getFullYear(), options.now.getMonth() + 1, options.futureMonths
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
            const year = common.yearAddMonth(startYear, startMonth, key);
            const month = common.monthAdd(startMonth, key);

            return [year, month];
        });

    return yearMonths;
}

function mapOldToYearMonths(yearMonths, old) {
    return old
        .map((oldBalanceValue, key) => {
            const year = common.yearAddMonth(yearMonths[0][0], yearMonths[0][1], key - old.length);
            const month = common.monthAdd(yearMonths[0][1], key - old.length);

            return [year, month];
        });
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
    `, config.data.funds.salt, user.uid);

    return result;
}

function processFundPrices(queryResult) {
    if (typeof queryResult === 'string') {
        return {};
    }

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
            if (!items.length) {
                return [item];
            }

            if (item.year !== items[items.length - 1].year ||
                item.month !== items[items.length - 1].month) {

                items.push(item);
            }

            return items;
        }, [])
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
    if (typeof queryResult === 'string') {
        return {};
    }

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

function getMonthlyTotalFundValues(yearMonths, old, fundTransactions, fundPrices) {
    const transactionsIds = Object.keys(fundTransactions);
    const pricesIds = Object.keys(fundPrices);

    const idsWithPricesAndTransactions = pricesIds
        .filter(id => transactionsIds.indexOf(id) !== -1);

    // get as many old fund values as there are old balance items
    const oldYearMonths = mapOldToYearMonths(yearMonths, old);

    return oldYearMonths
        .concat(yearMonths)
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

async function getMonthlyValues(db, user, yearMonths, category, old) {
    if (category === 'funds') {
        const transactionsQuery = await queryFundTransactions(db, user);
        const fundTransactions = processFundTransactions(transactionsQuery);

        const pricesQuery = await queryFundPrices(db, user);
        const fundPrices = processFundPrices(pricesQuery);

        return getMonthlyTotalFundValues(yearMonths, old, fundTransactions, fundPrices);
    }

    const queryResult = await getMonthlyValuesQuery(db, user, yearMonths, category);

    if (typeof queryResult === 'string') {
        return [];
    }

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
    if (typeof queryResult === 'string') {
        return { balance: yearMonths.map(() => 0), old: [] };
    }

    const balance = yearMonths
        .map(item => {
            const value = queryResult
                .filter(result => result.year === item[0] && result.month === item[1])
                .map(result => result.balance);

            if (value.length) {
                return value[0];
            }

            return 0;
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

async function getMonthlyCategoryValues(db, user, yearMonths, categories, old) {
    const promises = categories.map(
        category => getMonthlyValues(db, user, yearMonths, category, old)
    );

    const results = await Promise.all(promises);

    return results
        .reduce((obj, result, key) => {
            obj[categories[key]] = result;

            return obj;
        }, {});
}

async function getData(db, user) {
    const now = new Date();
    const futureMonths = config.data.overview.numFuture;
    const startYear = config.data.overview.startYear;
    const startMonth = config.data.overview.startMonth;

    const yearMonths = getYearMonths({
        now,
        pastMonths: config.data.overview.numLast,
        futureMonths,
        startYear,
        startMonth
    });

    const balanceQuery = await getMonthlyBalanceQuery(db, user);
    const balance = getMonthlyBalance(balanceQuery, yearMonths);

    const monthCost = await getMonthlyCategoryValues(
        db, user, yearMonths, config.data.listCategories, balance.old
    );

    return {
        startYearMonth: yearMonths[0],
        endYearMonth: yearMonths[yearMonths.length - 1],
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth() + 1,
        futureMonths,
        cost: Object.assign({}, monthCost, balance)
    };
}

module.exports = {
    getStartYearMonth,
    getEndYearMonth,
    getYearMonths,
    mapOldToYearMonths,
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
    getData
};
