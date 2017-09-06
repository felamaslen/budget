const md5 = require('md5');

const config = require('../../../config')();
const listCommon = require('../list.common');

function getLatestCachedPricesQuery(db) {
    return db.query(`
    SELECT fh.hash, GROUP_CONCAT(fc.price ORDER BY ct.time DESC) AS prices
    FROM fund_cache_time ct
    INNER JOIN fund_cache fc ON fc.cid = ct.cid
    INNER JOIN fund_hash fh ON fh.fid = fc.fid
    GROUP BY fc.fid
    `);
}

function getLatestCachedPrices(queryResult) {
    return queryResult
        .reduce((obj, item) => {
            const price = item.prices
                .split(',')
                .slice(-1)
                .map(value => parseFloat(value, 10));

            obj[item.hash] = price.length
                ? price[0]
                : 0;

            return obj;
        }, {});
}

function fundHash(fundName) {
    return md5(`${fundName}${config.data.fundSalt}`);
}

async function routeGet(req, res) {
    const columnMap = {
        item: 'i',
        transactions: 't',
        cost: 'c'
    };

    const cachedPricesQuery = await getLatestCachedPricesQuery(req.db);
    const cachedPrices = getLatestCachedPrices(cachedPricesQuery);

    const addData = row => {
        row.tr = row.t
            ? JSON.parse(row.t)
            : [];

        Reflect.deleteProperty(row, 't');

        const hash = fundHash(row.i);
        row.pr = cachedPrices[hash] || 0;

        return row;
    }


    const data = await listCommon.getResults(
        req.db, req.user, new Date(), 'funds', columnMap, addData
    );

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
    getLatestCachedPricesQuery,
    getLatestCachedPrices,
    fundHash,
    routeGet,
    routePost,
    routePut,
    routeDelete
};

