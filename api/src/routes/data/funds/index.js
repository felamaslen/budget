const md5 = require('md5');

const config = require('../../../config')();
const listCommon = require('../list.common');

function getMaxAge(now, period, length) {
    const periodMap = {
        year: 365.25,
        month: 365.25 / 12
    };

    if (!(period in periodMap) || length < 1) {
        return 0;
    }

    const minTimestamp = Math.floor(now.getTime() / 1000) -
        (86400 * Math.round(periodMap[period] * length));

    return minTimestamp;
}

function getNumResultsQuery(db, user, salt, minTimestamp) {
    return db.query(`
    SELECT COUNT(*) AS numResults FROM (
        SELECT c.cid
        FROM funds AS f
        LEFT JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, ?))
        LEFT JOIN fund_cache fc ON fh.fid = fc.fid
        LEFT JOIN fund_cache_time c ON c.cid = fc.cid AND c.done = 1
            AND c.time > ${minTimestamp}
        WHERE f.uid = ?
        GROUP BY c.cid
    ) results`, salt, user.uid);
}

function getAllHistoryForFundsQuery(
    db, user, salt, numResults, numDisplay, minTimestamp
) {
    return db.query(`
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
                    GROUP_CONCAT(f.id
                        ORDER BY f.year DESC, f.month DESC, f.date DESC
                    ) AS id,
                    GROUP_CONCAT(fc.price
                        ORDER BY f.year DESC, f.month DESC, f.date DESC
                    ) AS price
                FROM (
                    SELECT DISTINCT id, year, month, date, item
                    FROM funds
                    WHERE uid = ?
                ) f
                INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, ?))
                INNER JOIN fund_cache fc ON fh.fid = fc.fid
                INNER JOIN fund_cache_time c ON c.done = 1 AND c.cid = fc.cid
                    AND c.time > ${minTimestamp}
                GROUP BY c.cid
                ORDER BY time
            ) prices
            JOIN (
                SELECT @cNum := -1, @lastCid := 0
            ) counter
        ) ranked
    ) results
    WHERE period = 0 OR cNum = ?
    `, numResults, numDisplay, user.uid, salt, numResults - 1);
}

function processFundHistory(queryResult) {
    // return a map of fund holding IDs to historical prices
    const idMap = queryResult
        .reduce((map, row, rowKey) => {
            const rowIds = row.id
                .split(',')
                .map(id => parseInt(id, 10));

            const rowPrices = row.price
                .split(',')
                .map(price => parseFloat(price, 10));

            rowIds.forEach((id, idKey) => {
                if (!(id in map)) {
                    map[id] = new Array(rowKey).fill(0);
                }
                map[id].push(rowPrices[idKey]);
            });

            return map;
        }, {});

    let startTime = null;

    const times = queryResult
        .map(row => {
            const time = row.time;
            if (startTime === null) {
                startTime = time;
            }
            const timeDiff = time - startTime;

            return timeDiff;
        });

    return { idMap, startTime, times };
}

function fundHash(fundName, salt) {
    return md5(`${fundName}${salt}`);
}

async function getFundHistoryMappedToFundIds(
    db, user, now, period, length, numDisplay, salt
) {
    const minTimestamp = getMaxAge(now, period, length);

    const numResultsQuery = await getNumResultsQuery(db, user, salt, minTimestamp);
    const numResults = parseInt(numResultsQuery[0].numResults, 10);

    let fundHistory = { idMap: {}, startTime: 0, times: [] };

    if (!isNaN(numResults)) {
        fundHistory = await getAllHistoryForFundsQuery(
            db, user, salt, numResults, numDisplay, minTimestamp
        );
    }

    return processFundHistory(fundHistory);
}

function postProcessListRow(row, pricesIdMap = null) {
    // transactions
    row.tr = row.t
        ? JSON.parse(row.t)
        : [];

    Reflect.deleteProperty(row, 't');

    if (pricesIdMap) {
        row.pr = pricesIdMap[row.I] || [];
    }

    return row;
}

async function routeGet(req, res) {
    const now = new Date();

    const columnMap = {
        item: 'i',
        transactions: 't',
        cost: 'c'
    };

    let addData = row => postProcessListRow(row);

    const getPriceHistory = 'history' in req.query &&
        req.query.history !== 'false';
    let priceHistory = null;

    if (getPriceHistory) {
        let period = null;
        let length = null;
        if (['year', 'month'].indexOf(req.query.period) > -1 &&
            !isNaN(parseInt(req.query.length, 10))) {

            period = req.query.period;
            length = parseInt(req.query.length, 10);
        }

        priceHistory = await getFundHistoryMappedToFundIds(
            req.db,
            req.user,
            now,
            period,
            length,
            config.data.funds.historyResolution,
            config.data.funds.salt
        );

        addData = row => {
            return postProcessListRow(row, priceHistory.idMap);
        }
    }

    const data = await listCommon.getResults(
        req.db, req.user, now, 'funds', columnMap, addData
    );

    if (getPriceHistory) {
        data.startTime = priceHistory.startTime;
        data.cacheTimes = priceHistory.times;
    }

    return res.json({
        error: false,
        data
    });
}

async function routePost(req, res) {
    return res.end('not done yet');
}

async function routePut(req, res) {
    return res.end('not done yet');
}

async function routeDelete(req, res) {
    return res.end('not done yet');
}

module.exports = {
    getMaxAge,
    getNumResultsQuery,
    getAllHistoryForFundsQuery,
    processFundHistory,
    fundHash,
    getFundHistoryMappedToFundIds,
    routeGet,
    routePost,
    routePut,
    routeDelete
};

