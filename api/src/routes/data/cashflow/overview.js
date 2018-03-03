/**
 * Retrieve and process cash flow data, month-by-month
 */

const joi = require('joi');
const { monthAdd, yearAddMonth } = require('../../../common');
const { transactionListSchema } = require('../../../schema');

function getStartYearMonthDisplay(options) {
    const { now, startYear, startMonth, pastMonths } = options;

    let startMonthDisplay = monthAdd(now.getMonth() + 1, -pastMonths);

    let startYearDisplay = yearAddMonth(
        now.getFullYear(), now.getMonth() + 1, -pastMonths, -Infinity, 0
    );

    if (startYearDisplay < startYear ||
        (startYearDisplay === startYear && startMonthDisplay < startMonth)
    ) {
        startMonthDisplay = startMonth;
        startYearDisplay = startYear;
    }

    return { startYear: startYearDisplay, startMonth: startMonthDisplay };
}

function getEndYearMonthDisplay(options) {
    const { now, futureMonths } = options;

    const endMonth = monthAdd(now.getMonth() + 1, futureMonths);

    const endYear = yearAddMonth(now.getFullYear(), now.getMonth() + 1, futureMonths);

    return { endYear, endMonth };
}

function getYearMonths(options) {
    const { startYear, startMonth } = getStartYearMonthDisplay(options);
    const { endYear, endMonth } = getEndYearMonthDisplay(options);

    const numMonths = 12 * (endYear - startYear) + endMonth - startMonth + 1;

    return new Array(numMonths).fill(0)
        .map((item, key) => {
            const year = yearAddMonth(startYear, startMonth, key);
            const month = monthAdd(startMonth, key);

            return [year, month];
        });
}

function mapOldToYearMonths(yearMonths, old) {
    return old
        .map((oldBalanceValue, key) => {
            const year = yearAddMonth(yearMonths[0][0], yearMonths[0][1], key - old.length);
            const month = monthAdd(yearMonths[0][1], key - old.length);

            return [year, month];
        });
}

const startOfMonth = date => new Date(date.getFullYear(), date.getMonth(), 1);

function getFundValue(monthDate, transactions, prices) {
    const unitsToDate = transactions.reduce((sum, { date, units }) =>
        sum + ((date <= monthDate) >> 0) * units, 0);

    const latestPrice = prices.find(({ date }) => date <= monthDate);

    if (latestPrice) {
        return latestPrice.value * unitsToDate;
    }

    // there is no accurate price cached, so revert to the cost of the fund
    // (neglecting growth)
    return transactions.reduce((sum, { date, cost }) =>
        sum + ((date <= monthDate) >> 0) * cost, 0);
}

function queryFundPrices(config, db, user) {
    return db.select(
        'fund_cache_time.time',
        db.raw('GROUP_CONCAT(funds.id) AS id'),
        db.raw('GROUP_CONCAT(fund_cache.price) AS price')
    )
        .from('fund_cache')
        .innerJoin('fund_hash', 'fund_hash.fid', 'fund_cache.fid')
        .innerJoin('fund_cache_time', 'fund_cache_time.cid', 'fund_cache.cid')
        .innerJoin('funds', 'funds.uid', user.uid)
        .whereRaw('MD5(CONCAT(funds.item, ?)) = fund_hash.hash', config.data.funds.salt)
        .andWhere('fund_cache_time.done', '=', true)
        .groupBy('fund_cache_time.cid')
        .orderBy('fund_cache_time.time', 'desc');
}

function processFundPrices(rows) {
    if (!rows) {
        return {};
    }

    return rows
        .map(({ id, time, price }) => {
            // normalise dates to the beginning of the month and split values
            const ids = id.split(',').map(item => Number(item));
            const prices = price.split(',').map(item => Number(item));

            return { ids, prices, date: startOfMonth(time) };
        })
        .reduce((lastReduction, { date, ids, prices }) => {
            // filter out duplicate year/months
            // note that integrity is guaranteed by ordering by time in the query

            const { lastDate, items } = lastReduction;

            if (lastDate > date) {
                return { lastDate: date, items: [...items, { date, ids, prices }] };
            }

            return lastReduction;

        }, { lastDate: Infinity, items: [] })
        .items
        .reduce((result, { date, ids, prices }) => {
            return ids.reduce((last, id, key) => {
                const fundPrice = { date, value: prices[key] };

                if (id in last) {
                    return { ...last, [id]: [...last[id], fundPrice] };
                }

                return { ...last, [id]: [fundPrice] };

            }, result);

        }, {});
}

function queryFundTransactions(db, user) {
    return db.select('id', 'transactions')
        .from('funds')
        .where('uid', '=', user.uid);
}

function processFundTransactions(rows) {
    if (!rows) {
        return {};
    }

    return rows.reduce((rest, { id, transactions }) => {
        try {
            const { error, value } = joi.validate(JSON.parse(transactions), transactionListSchema);

            if (error) {
                throw error;
            }

            const items = value.map(({ date, ...item }) => ({ ...item, date: startOfMonth(date) }));

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

    const idsWithPricesAndTransactions = pricesIds.filter(id => transactionsIds.includes(id));

    // get as many old fund values as there are old balance items
    const oldYearMonths = mapOldToYearMonths(yearMonths, old);

    return [...oldYearMonths, ...yearMonths]
        .map(([year, month]) => new Date(year, month - 1, 1))
        .map(date => Math.round(idsWithPricesAndTransactions
            .map(id => getFundValue(date, fundTransactions[id], fundPrices[id]))
            .reduce((sum, value) => sum + value, 0)
        ));
}

function getMonthlyValuesQueryDateUnion(yearMonths) {
    const [nextYear, nextMonth] = [
        yearAddMonth(...yearMonths[yearMonths.length - 1], 1),
        monthAdd(yearMonths[yearMonths.length - 1][1], 1)
    ];

    const dates = [
        ...yearMonths.map(([year, month]) => `'${year}-${month}-1'`),
        `${nextYear}-${nextMonth}-1`
    ];

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

    return union;
}

async function getMonthlyValuesQuery(db, user, union, category) {
    const [rows] = await db.raw(`
    SELECT SUM(cost) AS monthCost
    FROM (${union}) dates
    LEFT JOIN ${category} AS list ON uid = ? AND list.date >= dates.startDate
        AND list.date <= dates.endDate
    GROUP BY dates.startDate
    `, user.uid);

    return rows;
}

async function getMonthlyValues(config, db, user, yearMonths, union, category, old) {
    if (category === 'funds') {
        const transactionsQuery = await queryFundTransactions(db, user);
        const fundTransactions = processFundTransactions(transactionsQuery);

        const pricesQuery = await queryFundPrices(config, db, user);
        const fundPrices = processFundPrices(pricesQuery);

        return getMonthlyTotalFundValues(yearMonths, old, fundTransactions, fundPrices);
    }

    const result = await getMonthlyValuesQuery(db, user, union, category);

    if (!result) {
        return [];
    }

    return result.map(({ monthCost }) => Number(monthCost) || 0);
}

async function getMonthlyBalanceQuery(db, user) {
    const rows = await db.select('date', 'balance')
        .from('balance')
        .where('uid', '=', user.uid)
        .orderBy('date');

    return rows.map(({ date, balance }) => ({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        balance
    }));
}

function getMonthlyBalance(queryResult, yearMonths) {
    if (!queryResult) {
        return { balance: yearMonths.map(() => 0), old: [] };
    }

    const balance = yearMonths
        .map(([year, month]) => {
            const row = queryResult.find(result => result.year === year && result.month === month);

            if (row) {
                return row.balance;
            }

            return 0;
        });

    const [firstYear, firstMonth] = yearMonths[0];

    const { numZeroesAfter: zeroesSinceLastOld, values: oldValues } = queryResult
        .filter(({ year, month }) => year < firstYear ||
            (year === firstYear && month < firstMonth)
        )
        .reduce(({ values, ...last }, { year, month, balance: value }) => {
            const numZeroesAfter = Math.max(0, 12 * (firstYear - year) + firstMonth - month - 1);

            const rest = { year, month, numZeroesAfter };

            if (!values.length) {
                return { ...rest, values: [value] };
            }

            const gapSinceLast = 12 * (year - last.year) + month - last.month - 1;

            if (gapSinceLast > 0) {
                return {
                    ...rest,
                    values: [...values, ...new Array(gapSinceLast).fill(0), value]
                };
            }

            return { ...rest, values: [...values, value] };

        }, { numZeroesAfter: 0, values: [] });

    const old = zeroesSinceLastOld
        ? [...oldValues, new Array(zeroesSinceLastOld).fill(0)]
        : oldValues;

    return { balance, old };
}

async function getMonthlyCategoryValues(config, db, user, yearMonths, old) {
    const categories = config.data.listCategories;

    const union = getMonthlyValuesQueryDateUnion(yearMonths);

    const promises = categories.map(category =>
        getMonthlyValues(config, db, user, yearMonths, union, category, old));

    const results = await Promise.all(promises);

    return results.reduce((items, result, key) => ({
        ...items,
        [categories[key]]: result
    }), {});
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

        const average = valuesToAverage.reduce((sum, value) => sum + value, 0) / valuesToAverage.length;

        return { tag, value: Math.round(current + average * months) };
    });
}

async function getData(config, db, user) {
    const now = new Date();
    const { startYear, startMonth, numLast: pastMonths, numFuture: futureMonths } = config.data.overview;

    const yearMonths = getYearMonths({
        now,
        startYear,
        startMonth,
        pastMonths,
        futureMonths
    });

    const balanceQuery = await getMonthlyBalanceQuery(db, user);
    const balance = getMonthlyBalance(balanceQuery, yearMonths);

    const monthCost = await getMonthlyCategoryValues(config, db, user, yearMonths, balance.old);

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
    getStartYearMonthDisplay,
    getEndYearMonthDisplay,
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

