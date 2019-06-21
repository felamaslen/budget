const jwt = require('jwt-simple');
const passport = require('passport');
const { DateTime } = require('luxon');
const { Strategy, ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcrypt');

const { clientError } = require('./error-handling');

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

function checkValidUser(pin) {
    const stringPin = String(pin);

    return (last, { pinHash, ...user }) => last.then(async previous => {
        if (previous) {
            return previous;
        }

        const validUser = await new Promise((resolve, reject) => {
            bcrypt.compare(stringPin, pinHash, (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (!res) {
                    return resolve(null);
                }

                return resolve(user);
            });
        });

        return validUser;
    });
}

async function checkLoggedIn(config, db, pin) {
    const users = await db.select('name', 'pin_hash as pinHash')
        .from('users');

    const validUser = await users.reduce(checkValidUser(pin), Promise.resolve(null));
    if (!validUser) {
        throw clientError(config.msg.errorLoginBad, 401);
    }

    return validUser;
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

