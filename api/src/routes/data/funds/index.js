const listCommon = require('../list.common');

async function routeGet(req, res) {
    const columnMap = {
        item: 'i',
        transactions: 't',
        cost: 'c'
    };

    const data = await listCommon.getResults(
        req.db, req.user, new Date(), 'funds', columnMap
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
    routeGet,
    routePost,
    routePut,
    routeDelete
};

