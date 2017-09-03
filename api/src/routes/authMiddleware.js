const config = require('../config')();
const user = require('./user');

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

    const authStatus = await user.checkAuthToken(req.db, token);

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

module.exports = authMiddleware;

