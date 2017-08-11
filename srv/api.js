/**
 * API endpoints for backend
 */

require('dotenv').config();
const config = require('./config.js');

const router = require('express').Router();

const user = require('./user.js');

// define api methods here
function apiPostLogin(req, res, db) {
  // ban IPs which try to brute force
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const banTime = process.env.IP_BAN_TIME * 1000;
  const banLimit = process.env.IP_BAN_LIMIT * 1000;

  const pin = parseInt(req.body.pin, 10);
  const pinHashed = user.hash(pin, config.userHashSalt);

  const findUser = db.collection('users').findOne({ pinHashed });
  const findIpLog = db.collection('ipBan').findOne({ ip });

  return Promise
    .all([findUser, findIpLog])
    .then(result => {
      const user = result[0];
      const log = result[1];

      const logExpired = !log || new Date().getTime() - log.time > banLimit;
      const banned = !logExpired && log.count >= process.env.IP_BAN_TRIES;

      if (banned) {
        const banExpired = new Date().getTime() - log.time > banTime;
        if (!banExpired) {
          res.status(403).json({
            error: true,
            errorMessage: config.msg.errorIpBanned
          });
          return;
        }
        db.collection('ipBan').remove({ ip });
      }

      const loggedIn = !!user;
      if (loggedIn) {
        const error = false;
        const apiKey = user.pinHashed;
        const uid = user.uid;
        const name = user.name;

        res.json({
          error,
          api_key: apiKey,
          uid,
          name
        });
        return;
      }

      const newCount = !logExpired && !banned
        ? log.count + 1
        : 1;

      db.collection('ipBan').update({ ip }, {
        ip,
        time: new Date().getTime(),
        count: newCount
      }, { upsert: true });

      res.status(403).json({
        error: true,
        errorMessage: config.msg.errorLoginBad
      });
    })
    .catch(err => {
      if (config.debug) {
        console.log('Error:', err);
      }
      res.status(500).json({
        error: true,
        errorMessage: config.msg.errorServerDb
      });
    });
}

function api(db) {
  router.use((req, res, next) => {
    // redirect requests like ?t=foo/bar to foo/bar
    if (req.query.t) {
      req.url = `/${req.query.t}`;
      req.query.old = true;
    }

    next();
  });

  router.post('/login', (req, res) => apiPostLogin(req, res, db));

  router.use((req, res) => {
    // catch-all api endpoint
    const response = {
      error: true,
      errorMessage: config.msg.unknownApiEndpoint,
      url: req.url
    };
    res.status(400).json(response);
  });

  return router;
}

module.exports = api;

