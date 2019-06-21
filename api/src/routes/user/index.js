/**
 * User route
 */

const { Router } = require('express');
const joi = require('joi');
const { DateTime } = require('luxon');
const { checkLoggedIn, genToken } = require('../../modules/auth');
const { clientError, catchAsyncErrors } = require('../../modules/error-handling');

async function attemptLogin(config, db, req) {
    const { error, value } = joi.validate(req.body, joi.object().keys({
        pin: joi.number().integer()
            .min(1000)
            .max(9999)
            .required()
    }));

    if (error) {
        throw clientError(error.message);
    }

    const { pin } = value;

    const { name, uid } = await checkLoggedIn(config, db, pin);

    return { name, uid, ...genToken({ uid, pin }) };
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
    ON CONFLICT (ip) DO UPDATE
        SET time = excluded.time
        ,count = excluded.count
    `, [ip, time, count]);
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
        throw clientError(config.msg.errorIpBanned, 401);
    }
}

function login(config, db, logger) {
    return catchAsyncErrors(async (req, res) => {
        const ip = req.headers && req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        let loginErr = null;
        let response = null;

        try {
            response = await attemptLogin(config, db, req);
        } catch (err) {
            if (err.status === 401) {
                loginErr = err;
            } else {
                throw err;
            }
        }

        const loggedIn = !loginErr;
        await loginBanCheck(config, db, logger, loggedIn, ip);

        if (loginErr) {
            throw loginErr;
        }

        res.json(response);

    });
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

