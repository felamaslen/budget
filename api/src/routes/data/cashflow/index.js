/**
 * Overview data methods
 */

const overview = require('./overview');

async function routeGet(req, res) {
    const data = await overview.getData(req.db, req.user);

    await req.db.end();

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

module.exports = {
    routeGet,
    routePost,
    routePut
};

