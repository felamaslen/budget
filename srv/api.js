/**
 * API endpoints for backend
 */

require('dotenv').config();
const config = require('./config.js');

const Router = require('express').Router;
const router = new Router();

const user = require('./user.js');
const data = require('./data.js');

function api(db) {
  router.use((req, res, next) => {
    // redirect requests like ?t=foo/bar to foo/bar
    if (req.query.t) {
      req.url = `/${req.query.t}`;
      req.query.old = true;
    }

    next();
  });

  router.post('/login', (req, res) => user.apiPostLogin(req, res, db));

  router.get('/data/*', (req, res, next) => {
    const basicAuthToken = req.authorization;
    user
      .checkAuthToken(basicAuthToken, db)
      .then(status => {
        if (status) {
          return next();
        }
        return res.status(403).json({
          error: true,
          errorText: config.msg.errorNotAuthorized
        });
      })
      .catch(err => {
        throw new Error(err);
      });
  });
  router.get('/data/bills', new data.ApiDataGetBills(db).run);

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

