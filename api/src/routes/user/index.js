/**
 * User methods
 */

const { Router } = require('express');
const sha1 = require('sha1');

function userPinHash(pin, salt) {
    return sha1(`${pin}${salt}`);
}

function generateToken(config, pin) {
    // just return the same hashed value as stored in the database
    // in the future, this should generate a time-based token based on
    // usernames / passwords
    return userPinHash(pin, config.userHashSalt);
}

async function checkAuthToken(db, token) {
    // validate authentication token against the database
    const user = await db.select('uid', 'name')
        .from('users')
        .where('api_key', '=', token);

    if (!user) {
        return null;
    }

    const { uid, name } = user;

    return { uid, name };
}

function processLoginRequest(config, req) {
    const ip = req.headers && req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const pin = Number(req.body.pin);
    const hash = userPinHash(pin, config.userHashSalt);

    const token = generateToken(config, pin);

    return { ip, hash, token };
}

function findUser(db, hash) {
    return db.select('uid', 'name', 'api_key')
        .from('users')
        .where('api_key', '=', hash);
}

async function getIpLog(db, ip) {
    const result = await db.select('time', 'count')
        .from('ip_login_req')
        .where('ip', '=', ip);

    if (result) {
        return result;
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

async function loginBanPreCheck(config, db, hash, ip) {
    // ban IPs which try to brute force
    const [user, log] = [await findUser(db, hash), await getIpLog(db, ip)];

    const now = Date.now() / 1000;

    const logExpired = now - log.time > config.user.banLimit;
    const banExpired = now - log.time > config.user.banTime;

    const banned = !banExpired && log.count >= config.user.banTries;

    if (user && log.count > 0 && (!banned || banExpired)) {
        // good login attempt; ban expired so remove log
        await removeIpLog(db, ip);
    }

    if (!user) {
        // handle a bad login attempt
        const newCount = getNewBadLoginCount(log.count, banned, logExpired, banExpired);

        await updateIpLog(db, ip, now, newCount);
    }

    return { user, banned };
}

function handleLoginStatus(config, req, res, loginStatus, token) {
    if (loginStatus.banned) {
        // IP is banned
        return res.status(401)
            .json({ errorMessage: config.msg.errorIpBanned });
    }

    if (loginStatus.user) {
        // logged in
        return res.json({
            apiKey: token,
            uid: loginStatus.user.uid,
            name: loginStatus.user.name
        });
    }

    // not logged in
    return res.status(401)
        .json({ errorMessage: config.msg.errorLoginBad });
}

function login(config, db) {
    return async (req, res) => {
        try {
            const { ip, hash, token } = processLoginRequest(config, req);

            const loginStatus = await loginBanPreCheck(config, db, hash, ip);

            handleLoginStatus(config, req, res, loginStatus, token);
        }
        catch (err) {
            res.status(500)
                .json({
                    error: true,
                    errorMessage: `${config.msg.errorServerDb}: ${err.stack}`
                });
        }
    };
}

function handler(config, db) {
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
    router.post('/login', login(config, db));

    return router;
}

module.exports = {
    userPinHash,
    generateToken,
    checkAuthToken,
    processLoginRequest,
    findUser,
    getIpLog,
    removeIpLog,
    updateIpLog,
    getNewBadLoginCount,
    loginBanPreCheck,
    handleLoginStatus,
    login,
    handler
};

