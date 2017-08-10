/**
 * API tests
 */

require('dotenv').config();
const expect = require('chai').expect;
const express = require('express');
const http = require('http');
const request = require('request');

const api = require('../api.js');
const apiPort = parseInt(process.env.PORT_WDS, 10) + 2;

describe('Backend API', () => {
  before(() => {
    const app = express();
    app.use('/', api);
    this.server = http.createServer(app).listen(apiPort);
    this.url = `http://localhost:${apiPort}`;
  });

  it('should handle requests like ?t=some/task', done => {
    request.get(`${this.url}/?t=foo/bar`, (err, res, body) => {
      expect(res.request.uri.href).to.be.equal(`${this.url}/foo/bar`);
      done();
    });
  });

  describe('user login', () => {
    it('should handle bad logins');
    it('should throttle bad logins');
    describe('good login', () => {
      it('should return an error status of false');
      it('should return a token');
      it('should return a uid');
      it('should return a name');
    });
  });

  describe('data methods:', () => {
    describe('overview', () => {
      it('should require authentication');
      it('should return valid data');
      it('should expose an update data method');
    });

    describe('analysis', () => {
      it('should be handled');
      it('should paginate');
      describe('time period', () => {
        it('should filter by year');
        it('should filter by month');
        it('should filter by week');
      });
      describe('category', () => {
        it('should filter by category');
        it('should filter by shop');
      });
      describe('deep filter', () => {
        it('should filter by table');
      });
    });
  });

  after(done => {
    this.server.close(done);
  });
});


