/**
 * Retrieve and process cash flow data, month-by-month
 */

const { DateTime } = require('luxon');
const joi = require('joi');
const { transactionListSchema } = require('../../../schema');

const getYearMonth = time => ([time.year, time.month]);

function getStartTime(options) {
    const { now, startYear, startMonth, pastMonths } = options;

    const startTime = now.plus({ months: -pastMonths });
    const minStartTime = DateTime.fromObject({ year: startYear, month: startMonth + 1 });

    if (startTime > minStartTime) {
        return startTime;
    }

    return minStartTime;
}

function getMonths(options) {
    const startTime = getStartTime(options);

    const { now, futureMonths } = options;

    const numMonths = futureMonths + 1 + Math.round(now.diff(startTime).as('months'));

    return new Array(numMonths).fill(0)
        .map((item, key) => startTime.plus({ months: key })
            .endOf('month')
        );
}

function mapOldToYearMonths(months, old) {
    return old.map((value, key) => months[0].plus({ months: key - old.length }));
}

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
    return rows
        .map(({ id, time, price }) => {
            // normalise dates to the end of the month and split values
            const ids = id.split(',').map(item => Number(item));
            const prices = price.split(',').map(item => Number(item));

            return { ids, prices, date: DateTime.fromJSDate(time).endOf('month') };
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

            const items = value.map(({ date, ...item }) => ({
                ...item, date: DateTime.fromJSDate(date).endOf('month')
            }));

            return { ...rest, [id]: items };
        }
        catch (err) {
            return { ...rest, [id]: [] };
        }

    }, {});
}

function getMonthlyTotalFundValues(months, old, fundTransactions, fundPrices) {
    const transactionsIds = Object.keys(fundTransactions);
    const pricesIds = Object.keys(fundPrices);

    const idsWithPricesAndTransactions = pricesIds.filter(id => transactionsIds.includes(id));

    // get as many old fund values as there are old balance items
    const oldMonths = mapOldToYearMonths(months, old);

    const allMonths = [...oldMonths, ...months];

    const funds = allMonths.map(date => Math.round(idsWithPricesAndTransactions
        .map(id => getFundValue(date, fundTransactions[id], fundPrices[id]))
        .reduce((sum, value) => sum + value, 0)
    ));

    const fundChanges = allMonths.map(monthDate => transactionsIds.reduce(
        (status, id) => status ||
            Boolean(fundTransactions[id].find(({ date }) => date.hasSame(monthDate, 'month'))),
        false
    ) >> 0);

    return { funds, fundChanges };
}

function getMonthlyValuesQueryDateUnion(months) {
    const firstStart = months[0].startOf('month')
        .toISODate();
    const firstEnd = months[0].toISODate();

    return months
        .slice(1)
        .map(date => ({
            start: `DATE('${date.startOf('month')
                .toISODate()}')`,
            end: `DATE('${date.toISODate()}')`
        }))
        .reduce(
            (last, { start, end }) => `${last} UNION SELECT ${start}, ${end}`,
            `SELECT DATE('${firstStart}') AS startDate, DATE('${firstEnd}') AS endDate`
        );
}

function getMonthlyValuesQuery(db, user, union, category) {
    return db.select(db.raw('SUM(cost) AS monthCost'))
        .from(db.raw(`(${union}) dates`))
        .joinRaw(`LEFT JOIN ${category} ON uid = ?
            AND date >= dates.startDate
            AND date <= dates.endDate`, user.uid)
        .groupBy('dates.startDate');
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

    return { [category]: result.map(({ monthCost }) => Number(monthCost) || 0) };
}

function getMonthlyBalanceRows(db, user) {
    return db.select('date', 'value')
        .from('balance')
        .where('uid', '=', user.uid)
        .orderBy('date');
}

function getMonthlyBalance(rows, months) {
    const balance = months.map(month => {
        const row = rows.find(({ date }) => DateTime.fromJSDate(date)
            .hasSame(month, 'month')
        );

        if (row) {
            return row.value;
        }

        return 0;
    });

    const { numZeroesAfter: zeroesSinceLastOld, values: oldValues } = rows
        .map(({ date, ...row }) => ({ date: DateTime.fromJSDate(date).endOf('month'), ...row }))
        .filter(({ date }) => date < months[0])
        .reduce(({ values, ...last }, { date, value }) => {
            const numZeroesAfter = Math.max(0, Math.round(date.diff(months[0]).as('months')));

            const rest = { date, numZeroesAfter };

            if (!values.length) {
                return { ...rest, values: [value] };
            }

            const gapSinceLast = Math.round(date.diff(last.date).as('months')) - 1;
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

async function getMonthlyCategoryValues(config, db, user, months, old) {
    const categories = config.data.listCategories;

    const union = getMonthlyValuesQueryDateUnion(months);

    const promises = categories.map(category =>
        getMonthlyValues(config, db, user, months, union, category, old));

    const results = await Promise.all(promises);

    return results.reduce((items, result) => ({ ...items, ...result }), {});
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
    const now = DateTime.local();

    const {
        startYear, startMonth, numLast: pastMonths, numFuture: futureMonths
    } = config.data.overview;

    const months = getMonths({ now, startYear, startMonth, pastMonths, futureMonths });

    const balanceRows = await getMonthlyBalanceRows(db, user);
    const balance = getMonthlyBalance(balanceRows, months);

    const monthCost = await getMonthlyCategoryValues(config, db, user, months, balance.old);

    const targets = getTargets(balance, futureMonths);

    const [currentYear, currentMonth] = getYearMonth(now);

    return {
        startYearMonth: getYearMonth(months[0]),
        endYearMonth: getYearMonth(months[months.length - 1]),
        currentYear,
        currentMonth,
        futureMonths,
        targets,
        cost: { ...monthCost, ...balance }
    };
}

module.exports = {
    getStartTime,
    getMonths,
    mapOldToYearMonths,
    getFundValue,
    queryFundPrices,
    processFundPrices,
    queryFundTransactions,
    processFundTransactions,
    getMonthlyTotalFundValues,
    getMonthlyValuesQuery,
    getMonthlyValues,
    getMonthlyBalance,
    getMonthlyCategoryValues,
    getTargets,
    getData
};

