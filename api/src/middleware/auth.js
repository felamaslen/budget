async function checkAuthToken(db, token) {
    // validate authentication token against the database
    const [userResult] = await db.select('uid', 'name').from('users')
        .where('api_key', '=', token);

    if (!userResult) {
        return null;
    }

    const { uid, name } = userResult;

    return { uid, name };
}

function authMiddleware(config, db) {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(401)
                .json({ errorMessage: config.msg.errorNotAuthorized });
        }

        const token = req.headers.authorization;

        const authStatus = await checkAuthToken(db, token);

        if (!authStatus) {
            res.status(401)
                .json({ errorMessage: config.msg.errorBadAuthorization });
        }

        req.user = authStatus;

        return next();
    };
}

module.exports = {
    checkAuthToken,
    authMiddleware
};

