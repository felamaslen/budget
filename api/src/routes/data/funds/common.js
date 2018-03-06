const md5 = require('md5');
const moment = require('moment');

function getMaxAge(now, period, length) {
    const validPeriods = ['year', 'month'];

    if (!(validPeriods.includes(period) && length > 0)) {
        return 0;
    }

    return now.clone().add(-length, period)
        .format('YYYY-MM-DD HH:mm:ss');
}

function getNumResultsQuery(db, user, salt, minTime) {
    return db.raw(`
    SELECT COUNT(*) AS numResults FROM (
        SELECT c.cid
        FROM funds AS f
        INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, ?))
        INNER JOIN fund_cache fc ON fh.fid = fc.fid
        INNER JOIN fund_cache_time c ON c.cid = fc.cid
        WHERE f.uid = ? AND c.done = 1 AND c.time > ?
        GROUP BY c.cid
    ) results`, [salt, user.uid, minTime]);
}

function getAllHistoryForFundsQuery(db, user, salt, numResults, numDisplay, minTime) {
    return db.raw(`
    SELECT * FROM (
        SELECT id, time, price, cNum, FLOOR(cNum % (? / ?)) AS period FROM (
            SELECT id, time, price, (
                CASE prices.cid
                    WHEN @lastCid THEN @cNum
                    ELSE @cNum := @cNum + 1
                END
            ) AS cNum,
            @lastCid := prices.cid AS last_cid
            FROM (
                SELECT
                    c.cid,
                    c.time,
                    GROUP_CONCAT(f.id ORDER BY f.date DESC) AS id,
                    GROUP_CONCAT(fc.price ORDER BY f.date DESC) AS price
                FROM (
                    SELECT DISTINCT id, date, item
                    FROM funds
                    WHERE uid = ?
                ) f
                INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, ?))
                INNER JOIN fund_cache fc ON fh.fid = fc.fid
                INNER JOIN fund_cache_time c ON c.cid = fc.cid
                WHERE c.done = 1 AND c.time > ?
                GROUP BY c.cid
                ORDER BY time
            ) prices
            JOIN (
                SELECT @cNum := -1, @lastCid := 0
            ) counter
        ) ranked
    ) results
    WHERE period = 0 OR cNum = ?
    `, [numResults, numDisplay, user.uid, salt, minTime, numResults - 1]);
}

function processFundHistory(queryResult) {
    // return a map of fund holding IDs to historical prices
    const keyMap = queryResult
        .reduce(({ rowIds, data }, { id, price }, rowKey) => {
            const [thisRowIds, rowPrices] = [id, price].map(item =>
                item.split(',')
                    .map(value => Number(value))
            );

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

    const unixTimes = queryResult.map(({ time }) => moment(time).unix());

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

    const [rows] = await getNumResultsQuery(db, user, salt, minTime);
    let [{ numResults }] = rows;
    numResults = Number(numResults);

    if (!isNaN(numResults) && numResults > 2) {
        const [fundHistory] = await getAllHistoryForFundsQuery(
            db, user, salt, numResults, numDisplay, minTime);

        return processFundHistory(fundHistory);
    }

    return { idMap: {}, startIndex: {}, startTime: minTime, times: [] };
}

module.exports = {
    getMaxAge,
    getNumResultsQuery,
    getAllHistoryForFundsQuery,
    processFundHistory,
    fundHash,
    getFundHistoryMappedToFundIds
};

