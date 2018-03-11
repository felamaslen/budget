/**
 * User route
 */

const { Router } = require('express');
const joi = require('joi');
const { DateTime } = require('luxon');
const { checkLoggedIn, genToken } = require('../../modules/auth');

const errorStatus = (err, code) => {
    const res = new Error(err.message);
    res.statusCode = code;

    return res;
};

async function attemptLogin(db, req) {
    const { error, value: { uid, pin } } = joi.validate(req.body, joi.object().keys({
        uid: joi.number().integer(),
        pin: joi.number().integer()
            .min(1000)
            .max(9999)
            .required()
    }));

    if (error) {
        throw errorStatus(error, 400);
    }

    try {
        const { name, uid: userId } = await checkLoggedIn(db, uid, pin);

        return { name, ...genToken({ uid: userId, pin }) };
    }
    catch (err) {
        return { name: null, uid: null, apiKey: null };
    }
}

async function getIpLog(db, ip) {
    const result = await db.select('time', 'count')
        .from('ip_login_req')
        .where('ip', '=', ip);

    if (result && result.length) {
        return result[0];
    }

    return { time: 0, count: 0 };
}

function removeIpLog(db, ip) {
    return db('ip_login_req').where('ip', '=', ip)
        .del();
}

function updateIpLog(db, ip, time, count) {
    return db.raw(`
    INSERT INTO ip_login_req (ip, time, count)
    VALUES(?, ?, ?)
    ON DUPLICATE KEY UPDATE time = ?, count = ?
    `, [ip, time, count, time, count]);
}

function getNewBadLoginCount(oldCount, banned, logExpired, banExpired) {
    // this is run on a bad login attempt
    // increment or reset the ban counter as necessary
    if (banned) {
        if (banExpired) {
            return 1;
        }

        return oldCount;
    }

    if (logExpired) {
        return 1;
    }

    return oldCount + 1;
}

async function loginBanCheck(config, db, logger, loggedIn, ip) {
    // ban IPs which try to brute force
    const { time, count } = await getIpLog(db, ip);

    const now = DateTime.local();
    const lastLogTime = DateTime.fromJSDate(time);

    const logExpired = now - lastLogTime > config.user.banLimit;
    const banExpired = now - lastLogTime > config.user.banTime;

    const banned = !banExpired && count >= config.user.banTries;

    if (loggedIn && count > 0 && (!banned || banExpired)) {
        // good login attempt; ban expired so remove log
        await removeIpLog(db, ip);
    }

    if (!loggedIn) {
        // handle a bad login attempt
        const newCount = getNewBadLoginCount(count, banned, logExpired, banExpired);

        await updateIpLog(db, ip, now.toSQL({ includeOffset: false }), newCount);
    }

    if (banned) {
        throw errorStatus(new Error(config.msg.errorIpBanned), 401);
    }
}

function login(config, db, logger) {
    return async (req, res) => {
        try {
            const response = await attemptLogin(db, req);

            const loggedIn = Boolean(response.uid);

            const ip = req.headers && req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            await loginBanCheck(config, db, logger, loggedIn, ip);

            if (loggedIn) {
                return res.json(response);
            }

            return res.status(401)
                .json({ errorMessage: config.msg.errorLoginBad });
        }
        catch (err) {
            const statusCode = err.statusCode || 500;

            return res.status(statusCode)
                .json({ errorMessage: err.message });
        }
    };
}

function handler(config, db, logger) {
    const router = new Router();

    /**
     * @swagger
     * /user/login:
     *     post:
     *         summary: Get an API key for logging in
     *         tags:
     *             - Authentication
     *         operationId: login
     *         description: |
     *             Log in to the app
     *         produces:
     *         - application/json
     *         consumes:
     *         - application/json
     *         parameters:
     *         - in: body
     *           name: authRequest
     *           description: The PIN of the user to retrieve an API key for
     *           schema:
     *              type: object
     *              required:
     *              - pin
     *              properties:
     *                  pin:
     *                      type: integer
     *         responses:
     *             200:
     *                 description: successful login
     *                 schema:
     *                     type: object
     *                     properties:
     *                         error:
     *                             type: boolean
     *                             example: false
     *                         apiKey:
     *                             type: string
     *                             example: f1d2d2f924e986ac86fdf7b36c94bcdf32beec15
     *                         uid:
     *                             type: number
     *                             example: 1
     *                         name:
     *                             type: string
     *                             example: user1
     *             401:
     *                 description: unsuccessful login
     *                 schema:
     *                     type: object
     *                     properties:
     *                         error:
     *                             type: boolean
     *                             example: true
     *                         errorText:
     *                             type: string
     *                             example: Bad PIN
     */
    router.post('/login', login(config, db, logger));

    return router;
}

module.exports = {
    getNewBadLoginCount,
    loginBanCheck,
    login,
    handler
};

