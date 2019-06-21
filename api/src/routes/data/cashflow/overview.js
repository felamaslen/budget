/**
 * Retrieve and process cash flow data, month-by-month
 */

const { DateTime } = require('luxon');
const { getNow } = require('../../../modules/time');

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
        db.raw('ARRAY_AGG(funds.id) AS ids'),
        db.raw('ARRAY_AGG(fund_cache.price) AS prices')
    )
        .from('funds')
        .innerJoin(
            'fund_hash',
            'fund_hash.hash',
            db.raw(`MD5(funds.item || ?)`, config.data.funds.salt)
        )
        .innerJoin('fund_cache', 'fund_cache.fid', 'fund_hash.fid')
        .innerJoin('fund_cache_time', 'fund_cache_time.cid', 'fund_cache.cid')
        .where('funds.uid', '=', user.uid)
        .andWhere('fund_cache_time.done', '=', true)
        .groupBy('fund_cache_time.cid')
        .orderBy('fund_cache_time.time', 'desc');
}

function processFundPrices(rows) {
    return rows
        .map(({ ids, time, prices }) => ({
            ids,
            prices,
            date: DateTime.fromJSDate(time).endOf('month')
        }))
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
    return db.select('funds.id', 'date', 'units', 'cost')
        .from('funds')
        .innerJoin('funds_transactions', 'funds_transactions.fund_id', 'funds.id')
        .where('uid', '=', user.uid);
}

function processFundTransactions(rows) {
    return rows.reduce((items, { id, date: dateRaw, units, cost }) => {
        const date = DateTime.fromJSDate(dateRaw).endOf('month');

        if (id in items) {
            items[id].push({ date, units, cost });

            return items;
        }

        return { ...items, [id]: [{ date, units, cost }] };

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

    const fundChanges = months.map(monthDate => transactionsIds.reduce(
        (status, id) => status && !(fundTransactions[id].find(({ date }) =>
            date.hasSame(monthDate, 'month'))), true) >> 0);

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
            `SELECT DATE('${firstStart}') AS start_date, DATE('${firstEnd}') AS end_date`
        );
}

function getMonthlyValuesQuery(db, user, union, category) {
    return db.select(db.raw('SUM(cost)::integer AS month_cost'))
        .from(db.raw(`(${union}) dates`))
        .leftJoin(`${category} as list_data`, qb1 => qb1
            .on('list_data.uid', '=', db.raw(`'${user.uid}'`))
            .on('date', '>=', 'dates.start_date')
            .on('date', '<=', 'dates.end_date')
        )
        .groupBy('dates.start_date')
        .orderBy('dates.start_date');
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

    return { [category]: result.map(({ 'month_cost': monthCost }) => Number(monthCost) || 0) };
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

async function getData(config, db, user) {
    const now = getNow(config);

    const {
        startYear, startMonth, numLast: pastMonths, numFuture: futureMonths
    } = config.data.overview;

    const months = getMonths({ now, startYear, startMonth, pastMonths, futureMonths });

    const balanceRows = await getMonthlyBalanceRows(db, user);
    const balance = getMonthlyBalance(balanceRows, months);

    const monthCost = await getMonthlyCategoryValues(config, db, user, months, balance.old);

    const [currentYear, currentMonth] = getYearMonth(now);

    return {
        startYearMonth: getYearMonth(months[0]),
        endYearMonth: getYearMonth(months[months.length - 1]),
        currentYear,
        currentMonth,
        futureMonths,
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
    getData
};

