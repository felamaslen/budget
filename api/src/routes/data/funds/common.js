const md5 = require('md5');
const { DateTime } = require('luxon');

function getMaxAge(now, period, length) {
    const validPeriods = ['year', 'month'];

    if (!(validPeriods.includes(period) && length > 0)) {
        return 0;
    }

    return now.plus({ [period]: -length });
}

const withFundHash = (db, salt) => db.raw('md5(f.item || ?)', salt);

function getNumResultsQuery(db, user, salt, minTime) {
    return db.select(db.raw('COUNT(1)::integer AS count'))
        .from(qb1 => qb1.select('c.cid')
            .from('funds as f')
            .innerJoin('fund_hash as fh', 'fh.hash', withFundHash(db, salt))
            .innerJoin('fund_cache as fc', 'fc.fid', 'fh.fid')
            .innerJoin('fund_cache_time as c', 'c.cid', 'fc.cid')
            .where('f.uid', '=', user.uid)
            .where('c.done', '=', true)
            .where('c.time', '>', minTime)
            .groupBy('c.cid')
            .as('results')
        );
}

const getAllHistoryForFundsQuery = (db, user, salt, numResults, numDisplay, minTime) => db.select()
    .from(qb1 => qb1.select(
        'id',
        'time',
        'price',
        'row_num',
        db.raw('floor(row_num % ?) as period', Math.ceil(numResults / numDisplay))
    )
        .from(qb2 => qb2.select(
            'c.cid',
            'c.time',
            db.raw('array_agg(f.id order by f.date desc) as id'),
            db.raw('array_agg(fc.price order by f.date desc) as price'),
            db.raw('row_number() over (order by time) as row_num')
        )
            .from(qb3 => qb3.distinct(
                'f.id',
                'f.item',
                db.raw('min(ft.date) as date')
            )
                .from('funds as f')
                .innerJoin('funds_transactions as ft', 'ft.fund_id', 'f.id')
                .where('uid', '=', user.uid)
                .groupBy('f.id')
                .as('f')
            )
            .innerJoin('fund_hash as fh', 'fh.hash', withFundHash(db, salt))
            .innerJoin('fund_cache as fc', 'fc.fid', 'fh.fid')
            .innerJoin('fund_cache_time as c', 'c.cid', 'fc.cid')
            .where('c.done', '=', true)
            .where('c.time', '>', minTime)
            .groupBy('c.cid')
            .orderBy('time')
            .as('prices')
        )
        .as('results')
    )
    .where('period', '=', 0)
    .orWhere('row_num', '=', numResults - 1)
    .orWhere('row_num', '=', numResults);

function processFundHistory(queryResult) {
    // return a map of fund holding IDs to historical prices
    const keyMap = queryResult
        .reduce(({ rowIds, data }, { id, price }, rowKey) => {
            const newData = id.reduce(({ idMap, startIndex }, fundId, idKey) => {
                if (!(fundId in idMap)) {
                    return {
                        idMap: { ...idMap, [fundId]: [price[idKey]] },
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
                        [fundId]: [...idMap[fundId], ...zeroes, price[idKey]]
                    },
                    startIndex
                };

            }, data);

            return { rowIds: [id, ...rowIds], data: newData };

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

    const [{ count: numResults }] = await getNumResultsQuery(db, user, salt, minTimeSQL);
    if (numResults > 2) {
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

