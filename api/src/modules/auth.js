const jwt = require('jwt-simple');
const passport = require('passport');
const { DateTime } = require('luxon');
const { Strategy, ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcrypt');

function getStrategy(config, db) {
    const params = {
        secretOrKey: process.env.USER_TOKEN_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true
    };

    return new Strategy(params, async (req, payload, done) => {
        const { uid } = payload;

        const user = await db.select('name')
            .from('users')
            .where('uid', '=', uid);

        if (!user.length) {
            return done(null, false, {
                message: 'User was deleted since last login'
            });
        }

        return done(null, { uid, ...user[0] });
    });
}

function genToken(user) {
    const { uid } = user;

    const expires = DateTime.local().plus({ days: 30 });

    const token = jwt.encode({
        exp: expires.ts / 1000,
        uid
    }, process.env.USER_TOKEN_SECRET);

    return {
        apiKey: `Bearer ${token}`,
        expires: expires.toISO(),
        uid
    };
}

async function getUsersToCheck(db, uid) {
    if (uid) {
        const { pinHash } = await db.select('name', 'pin_hash as pinHash')
            .from('users')
            .where('uid', '=', uid);

        return [{ uid, name, pinHash }];
    }

    const rows = await db.select('uid as userId', 'name', 'pin_hash as pinHash')
        .from('users');

    return rows.map(({ userId, name, pinHash }) => ({ uid: userId, name, pinHash }));
}

function checkValidUser(specificUid, pin) {
    return ({ uid, pinHash, ...user }) => {
        const userId = specificUid || uid;

        return new Promise((resolve, reject) => {
            bcrypt.compare(pin, pinHash, (err, res) => {
                if (err) {
                    return reject(err);
                }

                if (!res) {
                    return resolve(null);
                }

                return resolve({ uid: userId, ...user });
            });
        });
    };
}

async function checkLoggedIn(db, uid, pin) {
    const usersToCheck = await getUsersToCheck(db, uid, pin);

    if (!usersToCheck.length) {
        if (uid) {
            throw new Error('User does not exist');
        }

        throw new Error('There are no users in the database');
    }

    const status = await Promise.all(usersToCheck.map(checkValidUser(uid, String(pin))));

    const validStatus = status.filter(valid => valid);

    if (!validStatus.length) {
        throw new Error('Invalid PIN');
    }

    return validStatus[0];
}

function authMiddleware() {
    return (req, res, next) => {
        passport.authenticate('jwt', {
            session: false, failWithError: true
        }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                if (info.name === 'TokenExpiredError') {
                    return res.status(401)
                        .json({ errorMessage: 'Token expired' });
                }

                return res.status(401).json({ errorMessage: info.message });
            }

            req.user = user;

            return next();
        })(req, res, next);
    };
}

function generateUserPin(defaultPin = null) {
    const charNotUniqueEnough = (chars, char) =>
        chars.filter(item => item === char).length > 1;

    const pinRaw = defaultPin || new Array(4).fill(0)
        .reduce(chars => {
            let nextChar = null;
            do {
                nextChar = 1 + Math.floor(Math.random() * 9);
            } while (charNotUniqueEnough(chars, nextChar));

            return [...chars, nextChar];
        }, [])
        .join('');

    return new Promise((resolve, reject) => {
        bcrypt.hash(pinRaw, 10, (err, pinHash) => {
            if (err) {
                return reject(err);
            }

            return resolve({ pinRaw, pinHash });
        });
    });
}

module.exports = {
    getStrategy,
    genToken,
    checkLoggedIn,
    authMiddleware,
    generateUserPin
};

