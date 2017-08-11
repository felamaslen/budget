/**
 * API tests
 */

require('dotenv').config();
const config = require('../config');

const expect = require('chai').expect;
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const request = require('request');
const MongoClient = require('mongodb').MongoClient;

// use testing database
config.mongoUri = process.env.MONGO_URI_TEST;

const api = require('../api.js');
const apiPort = parseInt(process.env.PORT_WDS, 10) + 2;

const user = require('../user');

describe('Backend API', () => {
  before(done => {
    // connect to the database
    if (this.db) {
      return done();
    }
    MongoClient.connect(config.mongoUri, (err, db) => {
      expect(err).to.be.equal(null);
      this.db = db;
      done();
    });
  });

  before(() => {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/', api(this.db));
    this.server = http.createServer(app).listen(apiPort);
    this.url = `http://localhost:${apiPort}`;
  });

  it('should connect to the database', () => {
      expect(this.db).to.be.ok;
  });

  it('should handle GET requests like ?t=some/task', done => {
    request.get(`${this.url}/?t=foo/bar`, (err, res, body) => {
      const result = JSON.parse(body);
      expect(result.url).to.be.equal('/foo/bar');
      done();
    });
  });
  it('should handle POST requests like ?t=some/task', done => {
    request.post(`${this.url}/?t=bar/baz`, (err, res, body) => {
      const result = JSON.parse(body);
      expect(result.url).to.be.equal('/bar/baz');
      done();
    });
  });

  describe('user login', () => {
    before(done => {
      // create a test user
      this.db.collection('users')
        .insert({
          uid: 1,
          email: 'someone@example.com',
          name: 'Some Person',
          pinHashed: user.hash(1234, config.userHashSalt)
        })
        .then(() => {
          done();
        });
    });
    it('should have a method for adding users');

    it('should handle bad logins', done => {
      request.post(`${this.url}/login`, { form: { pin: 1000 } }, (err, res, body) => {
        expect(res.statusCode).to.be.equal(403);
        expect(JSON.parse(body).error).to.be.equal(true);
        done();
      });
    });

    it('should throttle bad logins');

    describe('good login', () => {
      before(done => {
        request.post(`${this.url}/login`, { form: { pin: 1234 } }, (err, res, body) => {
          expect(err).to.be.equal(null);
          this.goodLoginResult = JSON.parse(body);
          done();
        });
      });

      it('should return an error status of false', () => {
        expect(this.goodLoginResult.error).to.be.equal(false);
      });
      it('should return a token', () => {
        expect(this.goodLoginResult.api_key).to.be.a('string').of.length(40); // sha-1 length
      });
      it('should return a uid', () => {
        expect(this.goodLoginResult.uid).to.be.a('number');
      });
      it('should return a name', () => {
        expect(this.goodLoginResult.name).to.be.a('string').of.length.greaterThan(0);
      });
    });

    after(() => {
      // clean up data
      this.db.collection('users').drop();
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
    this.db.close(done);
  });
  after(done => {
    this.server.close(done);
  });
});


