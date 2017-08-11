/**
 * API endpoints for backend
 */

require('dotenv').config();
const config = require('./config');

const router = require('express').Router();

const user = require('./user');

// define api methods here
function apiPostLogin(req, res, db) {
  const pin = parseInt(req.body.pin, 10);
  const pinHashed = user.hash(pin, config.userHashSalt);

  let error = false;

  return db.collection('users')
    .findOne({
      pinHashed
    })
    .then(result => {
      if (!result) {
        // bad login
        res.status(403).json({
          error: true,
          errorMessage: config.msg.errorLoginBad
        });
        return;
      }

      const error = false;
      const apiKey = result.pinHashed;
      const uid = result.uid;
      const name = result.name;

      res.json({
        error,
        api_key: apiKey,
        uid,
        name
      });
    })
    .catch(err => {
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

