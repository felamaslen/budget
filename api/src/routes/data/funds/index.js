const listCommon = require('../list.common');

function getLatestCachedValues(db) {
    return db.query(`
    SELECT fh.hash, GROUP_CONCAT(fc.price ORDER BY ct.time DESC) AS prices
    FROM fund_cache_time ct
    INNER JOIN fund_cache fc ON fc.cid = ct.cid
    INNER JOIN fund_hash fh ON fh.fid = fc.fid
    GROUP BY fc.fid
    `);
}

function addData(row) {
    row.t = row.t
        ? JSON.parse(row.t)
        : [];

    return row;
}

async function routeGet(req, res) {
    const columnMap = {
        item: 'i',
        transactions: 't',
        cost: 'c'
    };

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
    getLatestCachedValues,
    routeGet,
    routePost,
    routePut,
    routeDelete
};

