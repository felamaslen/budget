/**
 * API endpoints for backend
 */

const api = require('express').Router();

api.use((req, res, next) => {
  // redirect requests like ?t=foo/bar to foo/bar
  if (req.query.t) {
    return res.redirect(req.query.t);
  }

  next();
});

api.use((req, res) => {
  res.status(400).send('Unknown API endpoint');
});

module.exports = api;

