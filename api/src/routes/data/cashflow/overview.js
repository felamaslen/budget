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

    return new Array(numMonths).fill(0)
        .map((item, key) => {
            const year = common.yearAddMonth(startYear, startMonth, key);
            const month = common.monthAdd(startMonth, key);

            return [year, month];
        });
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

    const pricesToDate = prices.filter(price => year > price.year ||
        (year === price.year && month >= price.month)
    );

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
    const [rows] = await db.raw(`
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
    `, [config.data.funds.salt, user.uid]);

    return rows;
}

function processFundPrices(queryResult) {
    if (typeof queryResult === 'string') {
        return {};
    }

    return queryResult
        .map(item => {
            const ids = item.id.split(',').map(id => Number(id));
            const prices = item.price.split(',').map(price => Number(price));

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

function queryFundTransactions(db, user) {
    return db.select('id', 'transactions')
        .from('funds')
        .where('uid', '=', user.uid);
}

function processFundTransactions(queryResult) {
    if (typeof queryResult === 'string') {
        return {};
    }

    return queryResult.reduce((rest, { id, transactions }) => {
        try {
            const items = JSON.parse(transactions)
                .map(transaction => {
                    return {
                        date: transaction.d,
                        units: transaction.u,
                        cost: transaction.c
                    };
                });

            return { ...rest, [id]: items };
        }
        catch (err) {
            return { ...rest, [id]: [] };
        }

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
        .map(([year, month]) => {
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
    const dates = yearMonths.map(([year, month]) => `'${year}-${month}-1'`);

    const dateRanges = dates.slice(0, -1)
        .map((startOfMonth, index) => ([
            `DATE(${startOfMonth})`,
            `DATE_ADD(${dates[index + 1]}, INTERVAL -1 DAY)`
        ]));

    const union = dateRanges.slice(1)
        .reduce((last, [startDate, endDate]) => {
            return `${last}
            UNION SELECT ${startDate}, ${endDate}`;

        }, `SELECT ${dateRanges[0][0]} AS startDate, ${dateRanges[0][1]} AS endDate`);

    const [rows] = await db.raw(`
    SELECT SUM(cost) AS monthCost
    FROM (${union}) dates
    LEFT JOIN ${category} AS list ON uid = ? AND list.date >= dates.startDate
        AND list.date <= dates.endDate
    GROUP BY dates.startDate
    `, user.uid);

    return rows;
}

async function getMonthlyValues(db, user, yearMonths, category, old) {
    if (category === 'funds') {
        const transactionsQuery = await queryFundTransactions(db, user);
        const fundTransactions = processFundTransactions(transactionsQuery);

        const pricesQuery = await queryFundPrices(db, user);
        const fundPrices = processFundPrices(pricesQuery);

        return getMonthlyTotalFundValues(yearMonths, old, fundTransactions, fundPrices);
    }

    const result = await getMonthlyValuesQuery(db, user, yearMonths, category);

    if (!result) {
        return [];
    }

    return result.map(item => item.monthCost || 0);
}

function getMonthlyBalanceQuery(db, user) {
    return db.select('date', 'balance')
        .from('balance')
        .where('uid', '=', user.uid)
        .orderBy('date');
}

function getMonthlyBalance(queryResult, yearMonths) {
    if (typeof queryResult === 'string') {
        return { balance: yearMonths.map(() => 0), old: [] };
    }

    const balance = yearMonths
        .map(([year, month]) => {
            const value = queryResult
                .filter(result => result.year === year && result.month === month)
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
                return { ...red, values: [result.balance] };
            }

            const gapSinceLast = 12 * (result.year - last.year) + result.month - last.month - 1;

            if (gapSinceLast > 0) {
                return {
                    ...red,
                    values: [
                        ...last.values,
                        ...new Array(gapSinceLast).fill(0),
                        result.balance
                    ]
                };
            }

            return { ...red, values: [...last.values, result.balance] };
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

function getTargets({ balance, old }, futureMonths) {
    const periods = [
        { last: 3, months: 12, tag: '1y' },
        { last: 6, months: 36, tag: '3y' },
        { last: 12, months: 60, tag: '5y' }
    ];

    const values = [...old, ...balance.slice(0, -futureMonths)].reverse();

    if (values.length < 2) {
        return [];
    }

    const saved = values
        .slice(0, values.length - 1)
        .map((value, key) => value - values[key + 1]);

    const current = values[0];

    return periods.map(({ last, months, tag }) => {
        const valuesToAverage = saved.slice(0, last);

        const average = valuesToAverage.reduce((sum, value) => sum + value, 0) /
            valuesToAverage.length;

        return { tag, value: Math.round(current + average * months) };
    });
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

    const targets = getTargets(balance, futureMonths);

    return {
        startYearMonth: yearMonths[0],
        endYearMonth: yearMonths[yearMonths.length - 1],
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth() + 1,
        futureMonths,
        targets,
        cost: { ...monthCost, ...balance }
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
    getTargets,
    getData
};

