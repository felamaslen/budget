const config = require('./config')();

async function checkAuthToken(db, token) {
    // validate authentication token against the database
    const userResult = await db.query(`
    SELECT uid, user AS name
    FROM users
    WHERE api_key = ?
    LIMIT 1
    `, token);

    if (!userResult || !userResult.length) {
        return null;
    }

    return { uid: userResult[0].uid, name: userResult[0].name };
}

async function authMiddleware(req, res, next) {
    if (!req.headers.authorization) {
        return res
            .status(401)
            .json({
                error: true,
                errorMessage: config.msg.errorNotAuthorized
            })
            .end();
    }

    const token = req.headers.authorization;

    const authStatus = await checkAuthToken(req.db, token);

    if (!authStatus) {
        await req.db.end();

        return res
            .status(401)
            .json({
                error: true,
                errorMessage: config.msg.errorBadAuthorization
            })
            .end();
    }

    req.user = authStatus;

    return next();
}

module.exports = {
    authMiddleware,
    checkAuthToken
};

