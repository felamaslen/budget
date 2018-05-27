const md5 = require('md5');
const { DateTime } = require('luxon');

function getMaxAge(now, period, length) {
    const validPeriods = ['year', 'month'];

    if (!(validPeriods.includes(period) && length > 0)) {
        return 0;
    }

    return now.plus({ [period]: -length });
}

function getNumResultsQuery(db, user, salt, minTime) {
    return db.select(db.raw('COUNT(1) AS numResults'))
        .from(qb1 => qb1.select('c.cid')
            .from('funds as f')
            .innerJoin('fund_hash as fh', 'fh.hash', db.raw('MD5(CONCAT(f.item, ?))', salt))
            .innerJoin('fund_cache as fc', 'fc.fid', 'fh.fid')
            .innerJoin('fund_cache_time as c', 'c.cid', 'fc.cid')
            .where('f.uid', '=', user.uid)
            .where('c.done', '=', true)
            .where('c.time', '>', minTime)
            .groupBy('c.cid')
            .as('results')
        );
}

function getAllHistoryForFundsQuery(db, user, salt, numResults, numDisplay, minTime) {
    return db.select()
        .from(qb1 => qb1.select(
            'id', 'time', 'price', 'cNum', db.raw('FLOOR(cNum % (? / ?)) AS period', [numResults, numDisplay])
        )
            .from(qb2 => qb2.select(
                'id',
                'time',
                'price',
                db.raw(
                    '(CASE prices.cid WHEN @lastCid THEN @cNum ELSE @cNum := @cNum + 1 END) AS cNum'
                ),
                db.raw('@lastCid := prices.cid AS lastCid')
            )
                .from(qb3 => qb3.select(
                    'c.cid',
                    'c.time',
                    db.raw('GROUP_CONCAT(f.id ORDER BY f.date DESC) AS id'),
                    db.raw('GROUP_CONCAT(fc.price ORDER BY f.date DESC) AS price')
                )
                    .from(qb4 => qb4.distinct('funds.id', 'funds.item', db.raw('MIN(date) AS date'))
                        .from('funds')
                        .innerJoin('funds_transactions', 'funds_transactions.fundId', 'funds.id')
                        .where('uid', '=', user.uid)
                        .groupBy('funds.id')
                        .as('f')
                    )
                    .innerJoin('fund_hash AS fh', 'fh.hash', db.raw('MD5(CONCAT(f.item, ?))', salt))
                    .innerJoin('fund_cache AS fc', 'fh.fid', 'fc.fid')
                    .innerJoin('fund_cache_time AS c', 'c.cid', 'fc.cid')
                    .where('c.done', '=', true)
                    .where('c.time', '>', minTime)
                    .groupBy('c.cid')
                    .orderBy('time')
                    .as('prices')
                )
                .join(qb3 => qb3.select(db.raw('@cNum := -1'), db.raw('@lastCid := 0'))
                    .as('counter')
                )
                .as('ranked')
            )
            .as('results')
        )
        .where('period', '=', 0)
        .orWhere('cNum', '=', numResults - 1)
        .orWhere('cNum', '=', numResults - 2);
}

function processFundHistory(queryResult) {
    // return a map of fund holding IDs to historical prices
    const keyMap = queryResult
        .reduce(({ rowIds, data }, { id, price }, rowKey) => {
            const [thisRowIds, rowPrices] = [id, price].map(item => item.split(',').map(Number));

            const newData = thisRowIds.reduce(({ idMap, startIndex }, fundId, idKey) => {
                if (!(fundId in idMap)) {
                    return {
                        idMap: { ...idMap, [fundId]: [rowPrices[idKey]] },
                        startIndex: { ...startIndex, [fundId]: rowKey }
                    };
                }

                // if (for e.g.) we buy a holding, sell it, then buy some more at a later date,
                // there should be a number of zeroes between the last sell and buy
                const numZeroes = rowIds
                    .reduce(({ num, found }, lastResult) => {
                        if (found || lastResult.includes(fundId)) {
                            return { num, found: true };
                        }

                        return { num: num + 1, found: false };

                    }, { num: 0, found: false })
                    .num;

                const zeroes = new Array(numZeroes).fill(0);

                return {
                    idMap: {
                        ...idMap,
                        [fundId]: [...idMap[fundId], ...zeroes, rowPrices[idKey]]
                    },
                    startIndex
                };

            }, data);

            return { rowIds: [thisRowIds, ...rowIds], data: newData };

        }, { rowIds: [], data: { idMap: {}, startIndex: {} } })
        .data;

    const unixTimes = queryResult.map(({ time }) => Math.round(DateTime.fromJSDate(time).ts / 1000));

    const startTime = unixTimes[0];

    const times = unixTimes.map(time => time - startTime);

    return { ...keyMap, startTime, times };
}

function fundHash(fundName, salt) {
    return md5(`${fundName}${salt}`);
}

async function getFundHistoryMappedToFundIds(db, user, now, params) {
    const { period, length, numDisplay, salt } = params;

    const minTime = getMaxAge(now, period, length);
    const minTimeSQL = minTime.toSQL({ includeOffset: false });

    const rows = await getNumResultsQuery(db, user, salt, minTimeSQL);
    let [{ numResults }] = rows;
    numResults = Number(numResults);

    if (!isNaN(numResults) && numResults > 2) {
        const fundHistory = await getAllHistoryForFundsQuery(
            db, user, salt, numResults, numDisplay, minTimeSQL);

        return processFundHistory(fundHistory);
    }

    return { idMap: {}, startIndex: {}, startTime: Math.round(minTime.ts / 1000), times: [] };
}

module.exports = {
    getMaxAge,
    getNumResultsQuery,
    getAllHistoryForFundsQuery,
    processFundHistory,
    fundHash,
    getFundHistoryMappedToFundIds
};

