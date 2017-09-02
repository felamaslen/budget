/**
 * User methods
 */

const sha1 = require('sha1');

const config = require('../../config')();
const Database = require('../../db');

function userPinHash(pin, salt) {
    return sha1(`${pin}${salt}`);
}

function generateToken(pin) {
    // just return the same hashed value as stored in the database
    // in the future, this should generate a time-based token based on
    // usernames / passwords
    return userPinHash(pin, config.userHashSalt);
}

async function checkAuthToken(db, token) {
    // validate authentication token against the database
    const userResult = await db.query(`
    SELECT uid, user AS name
    FROM users
    WHERE api_key = ?
    `, token);

    if (!userResult) {
        return null;
    }

    return { uid: userResult.uid, name: userResult.name };
}

function processLoginRequest(req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const pin = parseInt(req.body.pin, 10);
    const hash = userPinHash(pin, config.userHashSalt);

    const token = generateToken(pin);

    return { ip, hash, token };
}

function findUser(db, hash) {
    return db.query(`
    SELECT uid, user, api_key
    FROM users
    WHERE api_key = ?
    LIMIT 1
    `, hash);
}

function getIpLog(db, ip) {
    return db.query(`
    SELECT time, count
    FROM ip_login_req
    WHERE ip = ?
    LIMIT 1
    `, ip
    );
}

function removeIpLog(db, ip) {
    return db.query(`
    DELETE FROM ip_login_req
    WHERE ip = ?
    `, ip);
}

function updateIpLog(db, ip, time, count) {
    return db.query(`
    INSERT INTO ip_login_req (ip, time, count)
    VALUES(?, ?, ?)
    ON DUPLICATE KEY UPDATE time = ?, count = ?
    `, ip, time, count, time, count);
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

async function loginBanPreCheck(db, hash, ip) {
    // ban IPs which try to brute force
    const result = [await findUser(db, hash), await getIpLog(db, ip)];

    const user = result[0][0] || null;
    const log = result[1][0] || { count: 0, time: 0 };


    const now = new Date().getTime();

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

function handleLoginStatus(res, loginStatus, token) {
    if (loginStatus.banned) {
        // IP is banned
        return res
            .status(401)
            .json({
                error: true,
                errorMessage: config.msg.errorIpBanned
            });
    }

    if (loginStatus.user) {
        // logged in
        return res.json({
            error: false,
            'api_key': token,
            uid: loginStatus.user.uid,
            name: loginStatus.user.name
        });
    }

    // not logged in
    return res
        .status(401)
        .json({
            error: true,
            errorMessage: config.msg.errorLoginBad
        });
}

async function login(req, res) {
    const db = await Database.getConnection(res);

    try {
        const { ip, hash, token } = processLoginRequest(req);

        const loginStatus = await loginBanPreCheck(db, hash, ip);

        handleLoginStatus(res, loginStatus, token);
    }
    catch (err) {
        res
            .status(500)
            .json({
                error: true,
                errorMessage: `${config.msg.errorServerDb}: ${err}`
            });
    }
    finally {
        await db.end(res);
    }
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
    login
};

