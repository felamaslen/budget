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

async function endUnauthorized(req, res, errorMessage, throwErr) {
    await req.db.end();

    const responseEnd = res
        .status(401)
        .json({
            error: true,
            errorMessage
        })
        .end();

    if (throwErr) {
        throw new Error(errorMessage);
    }

    return responseEnd;
}

async function authMiddleware(req, res, next) {
    const throwErr = !next;

    if (!req.headers.authorization) {
        return endUnauthorized(req, res, config.msg.errorNotAuthorized, throwErr);
    }

    const token = req.headers.authorization;

    const authStatus = await checkAuthToken(req.db, token);

    if (!authStatus) {
        return endUnauthorized(req, res, config.msg.errorBadAuthorization, throwErr);
    }

    req.user = authStatus;

    if (throwErr) {
        return true;
    }

    return next();
}

module.exports = {
    checkAuthToken,
    endUnauthorized,
    authMiddleware
};

