/**
 * Overview data methods
 */

const overview = require('./overview');
const updateBalance = require('./updateBalance');

async function routeGet(req, res) {
    const data = await overview.getData(req.db, req.user);

    await req.db.end();

    return res.json({
        error: false,
        data
    });
}

function routePost(req, res) {
    return updateBalance.updateData(req, res);
}

function routePut(req, res) {
    return updateBalance.updateData(req, res, false);
}

module.exports = {
    routeGet,
    routePost,
    routePut
};

