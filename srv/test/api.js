/**
 * API tests
 */

'use strict';

require('dotenv').config();
process.env.IP_BAN_TIME = 0.5;
process.env.IP_BAN_LIMIT = 2;
process.env.IP_BAN_TRIES = 2;

const config = require('../config.js');

const expect = require('chai').expect;
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const request = require('request-promise-native');
const requestJson = require('request-json');
const MongoClient = require('mongodb').MongoClient;

// use testing database
config.mongoUri = process.env.MONGO_URI_TEST;

const api = require('../api.js');
const apiPort = parseInt(process.env.PORT_WDS, 10) + 2;

const user = require('../user.js');

describe('Backend API', () => {
  before(done => {
    // connect to the database
    if (this.db) {
      return done();
    }
    return MongoClient.connect(config.mongoUri, (err, db) => {
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
    this.url = `http://localhost:${apiPort}/`;
    this.api = requestJson.createClient(this.url);
  });

  it('should connect to the database', () => {
    expect(this.db).to.be.ok;
  });

  it('should handle GET requests like ?t=some/task', done => {
    this.api.get('?t=foo/bar', (err, res, result) => {
      if (err) {
        throw err;
      }
      expect(result.url).to.be.equal('/foo/bar');
      done();
    });
  });
  it('should handle POST requests like ?t=some/task', done => {
    this.api.post('?t=bar/baz', {}, (err, res, result) => {
      if (err) {
        throw err;
      }
      expect(result.url).to.be.equal('/bar/baz');
      done();
    });
  });

  describe('user login', () => {
    before(done => {
      // create a test user
      this.token = user.generateToken(1234);
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
    before(done => {
      this.db.collection('ipBan')
        .drop()
        .then(() => done())
        .catch(() => done());
    });
    it('should have a method for adding users');

    const loginRequestOptions = (url, bad) => {
      return {
        method: 'POST',
        uri: `${url}login`,
        form: {
          pin: bad ? 1000 : 1234
        },
        json: true,
        resolveWithFullResponse: true,
        simple: false
      };
    };

    const badLoginResponseTest = res => {
      expect(res.statusCode).to.be.equal(403);
      expect(res.body).to.deep.equal({
        error: true,
        errorMessage: config.msg.errorLoginBad
      });
      return Promise.resolve(res);
    };

    const bannedResponseTest = res => {
      expect(res.body).to.be.deep.equal({
        error: true,
        errorMessage: config.msg.errorIpBanned
      });
      return Promise.resolve(res);
    };

    const goodLoginResponseTest = res => {
      expect(res.body.error).to.be.equal(false);
      return Promise.resolve(res);
    };

    it('should handle bad logins', done => {
      const badLogin = loginRequestOptions(this.url, true);

      request(badLogin)
        .then(badLoginResponseTest)
        .then(() => done())
        .catch(err => {
          throw err;
        });
    });

    it('should throttle bad logins', done => {
      const badLogin = loginRequestOptions(this.url, true);
      const goodLogin = loginRequestOptions(this.url, false);

      request(badLogin)
        .then(badLoginResponseTest)
        .then(() => {
          // make another bad login, to trigger the automatic throttler
          return request(badLogin);
        })
        .then(badLoginResponseTest)
        .then(() => {
          // make a good login; we should be banned at this point
          return request(goodLogin);
        })
        .then(bannedResponseTest)
        .then(() => {
          // wait for the ban to expire, then test that we're not banned
          // by making another good login
          setTimeout(() => {
            request(goodLogin)
              .then(res => {
                goodLoginResponseTest(res);
                done();
              })
              .catch(err => {
                throw err;
              });
          }, 800);
        })
        .catch(err => {
          throw err;
        });
    });

    describe('good login', () => {
      let goodLoginResult = null;

      before(done => {
        const goodLogin = loginRequestOptions(this.url, false);
        request(goodLogin)
          // .then(goodLoginResponseTest)
          .then(res => {
            goodLoginResult = res.body;
            done();
          })
          .catch(err => {
            throw err;
          });
      });

      it('should return an error status of false', () => {
        expect(goodLoginResult.error).to.be.equal(false);
      });
      it('should return a token', () => {
        expect(goodLoginResult.api_key).to.be.a('string').of.length(40); // sha-1 length
      });
      it('should return a uid', () => {
        expect(goodLoginResult.uid).to.be.a('number');
      });
      it('should return a name', () => {
        expect(goodLoginResult.name).to.be.a('string').of.length.greaterThan(0);
      });
    });

    // clean up data
    after(() => {
      this.db.collection('users').drop();
      this.db.collection('ipBan').drop();
    });
  });

  describe('data methods', () => {
    before(done => {
      let testData;
      try {
        testData = require('./apiTestData.json');
      }
      catch (err) {
        throw new Error('Please put some test data in srv/test/apiTestData.json. ' +
                        'You can get this data by running the API endpoint `data/all`.');
      }

      this.db.collection('bills')
        .insertMany(
          testData.data.bills.data.map(row => {
            return {
              item: row.i,
              cost: row.c,
              date: row.d,
              uid: 1
            };
          })
          .concat([
            {
              item: 'Should not see this',
              cost: 100,
              date: [2017, 6, 1],
              uid: 2
            }
          ]),
          err => {
            if (err) {
              throw err;
            }
            done();
          }
        );
    });

    describe('overview', () => {
      it('should require authentication');
      it('should return valid data');
      it('should update data');
    });

    describe('analysis', () => {
      it('should require authentication');
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

    describe('funds', () => {
      it('should require authentication');
      it('should get data without history');
      it('should get data with history');
      it('should get data with history limited by period');

      it('should insert data');

      it('should scrape price data');
      it('should scrape holdings data');
    });

    describe('income', () => {
      it('should require authentication');
      it('should get data');
      it('should insert data');
    });
    describe('bills', () => {
      it('should require authentication', done => {
        this.api.get('data/bills', (err, res, body) => {
          expect(err).to.not.be.ok;
          expect(res.statusCode).to.be.equal(403); // haven't provided authentication token
          expect(body.error).to.be.equal(true);
          expect(body.errorText).to.be.equal(config.msg.errorNotAuthorized);
          done();
        });
      });
      it('should get data');
      it('should insert data');
    });
    describe('food', () => {
      it('should require authentication');
      it('should get data');
      it('should insert data');
    });
    describe('general', () => {
      it('should require authentication');
      it('should get data');
      it('should insert data');
    });
    describe('holiday', () => {
      it('should require authentication');
      it('should get data');
      it('should insert data');
    });
    describe('social', () => {
      it('should require authentication');
      it('should get data');
      it('should insert data');
    });

    describe('search', () => {
      it('should require authentication');
      it('should get data');
    });

    describe('all', () => {
      it('should require authentication');
      it('should get all data');
    });

    after(()=> {
      // clean up data
      this.db.collection('funds').drop();
      this.db.collection('income').drop();
      this.db.collection('bills').drop();
      this.db.collection('food').drop();
      this.db.collection('general').drop();
      this.db.collection('holiday').drop();
      this.db.collection('social').drop();
    });
  });

  after(done => {
    this.db.close(done);
  });
  after(done => {
    this.server.close(done);
  });
});

