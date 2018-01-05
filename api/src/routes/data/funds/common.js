const md5 = require('md5');

const common = require('../../../common');
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
        INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, ?))
        INNER JOIN fund_cache fc ON fh.fid = fc.fid
        INNER JOIN fund_cache_time c ON c.cid = fc.cid AND c.done = 1
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
    const keyMap = queryResult
        .reduce(({ rowIds, data }, row, rowKey) => {
            const thisRowIds = row.id
                .split(',')
                .map(id => Number(id));

            const rowPrices = row.price
                .split(',')
                .map(price => Number(price));

            const newData = thisRowIds.reduce(({ idMap, startIndex }, id, idKey) => {
                if (!(id in idMap)) {
                    return {
                        idMap: { ...idMap, [id]: [rowPrices[idKey]] },
                        startIndex: { ...startIndex, [id]: rowKey }
                    };
                }

                // if (for e.g.) we buy a holding, sell it, then buy some more at a later date,
                // there should be a number of zeroes between the last sell and buy
                const numZeroes = rowIds
                    .reduce(({ num, found }, lastResult) => {
                        if (found || lastResult.indexOf(id) !== -1) {
                            return { num, found: true };
                        }

                        return { num: num + 1, found: false };
                    }, { num: 0, found: false })
                    .num;

                const zeroes = new Array(numZeroes).fill(0);

                return {
                    idMap: {
                        ...idMap,
                        [id]: [...idMap[id], ...zeroes, rowPrices[idKey]]
                    },
                    startIndex
                };

            }, data);

            return { rowIds: [thisRowIds, ...rowIds], data: newData };

        }, { rowIds: [], data: { idMap: {}, startIndex: {} } })
        .data;

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

    return { ...keyMap, startTime, times };
}

function fundHash(fundName, salt) {
    return md5(`${fundName}${salt}`);
}

async function getFundHistoryMappedToFundIds(db, user, now, {
    period, length, numDisplay, salt
}) {
    const minTimestamp = getMaxAge(now, period, length);

    const numResultsQuery = await getNumResultsQuery(db, user, salt, minTimestamp);
    const numResults = Number(numResultsQuery[0].numResults);

    if (!isNaN(numResults) && numResults > 2) {
        const fundHistory = await getAllHistoryForFundsQuery(
            db, user, salt, numResults, numDisplay, minTimestamp
        );

        return processFundHistory(fundHistory);
    }

    return { idMap: {}, startIndex: {}, startTime: minTimestamp, times: [] };
}

function validateTransactions(transactions) {
    if (!Array.isArray(transactions)) {
        throw new common.ErrorBadRequest('transactions must be an array');
    }

    return transactions.map(transaction => {
        const validTransaction = {};

        ['cost', 'units'].forEach(item => {
            if (!(item in transaction)) {
                throw new common.ErrorBadRequest(
                    `transactions must have ${item}`
                );
            }

            const value = parseFloat(transaction[item], 10);
            if (isNaN(value)) {
                throw new common.ErrorBadRequest(
                    `transactions ${item} must be numerical`
                );
            }

            const key = item.substring(0, 1);
            validTransaction[key] = value;
        });

        const { year, month, date } = listCommon.validateDate(transaction);

        // eslint-disable-next-line id-length
        validTransaction.d = [year, month, date];

        return validTransaction;
    });
}

function validateExtraData(data, allRequired = true) {
    const haveTransactions = 'transactions' in data;

    if (allRequired && !haveTransactions) {
        throw new common.ErrorBadRequest('didn\'t provide transactions data');
    }

    const result = {};

    if (haveTransactions) {
        const validTransactions = validateTransactions(data.transactions);

        result.transactions = JSON.stringify(validTransactions);
    }

    return result;
}

function validateInsertData(data) {
    const validData = listCommon.validateInsertData(data);

    return { ...validData, ...validateExtraData(data, true) };
}

function validateUpdateData(data) {
    const validData = listCommon.validateUpdateData(data);

    validData.values = { ...validData.values, ...validateExtraData(data, false) };

    return validData;
}

module.exports = {
    getMaxAge,
    getNumResultsQuery,
    getAllHistoryForFundsQuery,
    processFundHistory,
    fundHash,
    getFundHistoryMappedToFundIds,
    validateTransactions,
    validateExtraData,
    validateInsertData,
    validateUpdateData
};

