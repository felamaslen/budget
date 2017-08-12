/**
 * API tests
 */

'use strict';

require('dotenv').config();
process.env.IP_BAN_TIME = 0.5;
process.env.IP_BAN_LIMIT = 2;
process.env.IP_BAN_TRIES = 2;
process.env.MONGO_URI = process.env.MONGO_URI_TEST;
process.env.PORT = parseInt(process.env.PORT_WDS, 10) + 2;
process.env.DEBUG = false;

const config = require('../config.js');

const expect = require('chai').expect;
require('it-each')();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const request = require('request-promise-native');
const MongoClient = require('mongodb').MongoClient;

const serverApp = require('../server.js');

const user = require('../user.js');

describe('Backend API', () => {
  before(done => {
    // run the server with test environment variables (e.g. database)
    serverApp().then(server => {
      this.db = server.db;
      this.url = `http://localhost:${server.port}/`;
      done();
    });
  });

  it('should handle GET requests like ?t=some/task', done => {
    const taskParameterTestGet = {
      url: `${this.url}api?t=foo/bar`,
      json: true,
      simple: false
    };

    request(taskParameterTestGet)
      .then(result => {
        expect(result.url).to.be.equal('/foo/bar');
        done();
      })
      .catch(err => {
        throw err;
      });
  });
  it('should handle POST requests like ?t=some/task', done => {
    const taskParameterTestPost = {
      method: 'POST',
      url: `${this.url}api?t=bar/baz`,
      form: {},
      json: true,
      simple: false
    };

    request(taskParameterTestPost)
      .then(result => {
        expect(result.url).to.be.equal('/bar/baz');
        done();
      })
      .catch(err => {
        throw err;
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
        url: `${url}api/login`,
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
    before(() => {
      // fill the database with test data
      try {
        this.testData = require('./apiTestData.json');
      }
      catch (err) {
        throw new Error('Please put some test data in srv/test/apiTestData.json. ' +
                        'You can get this data by running the API endpoint `data/all`.');
      }

      const dataTables = [
        ['income', { d: 'date', i: 'item', c: 'cost' }],
        ['bills', { d: 'date', i: 'item', c: 'cost' }],
        ['food', { d: 'date', i: 'item', c: 'cost', k: 'category', s: 'shop' }],
        ['general', { d: 'date', i: 'item', c: 'cost', k: 'category', s: 'shop' }],
        ['holiday', { d: 'date', i: 'item', c: 'cost', h: 'holiday', s: 'shop' }],
        ['social', { d: 'date', i: 'item', c: 'cost', y: 'society', s: 'shop' }]
      ];

      const dataInsertPromises = dataTables.map(table => {
        const tableName = table[0];
        const columns = table[1];

        const testDataInsert = this.testData.data[tableName].data
          .slice(0, 10)
          .map(row => {
            const doc = {};

            for (const shortName in columns) {
              const dbColumnName = columns[shortName];

              doc[dbColumnName] = row[shortName];
            }

            return doc;
          });

        const promise = new Promise((resolve, reject) => {
          this.db.collection(tableName).insertMany(testDataInsert, err => {
            if (err) {
              throw err;
            }
            resolve();
          });
        });

        return promise;
      });

      return Promise.all(dataInsertPromises);
    });

    const dataRequest = (url, type, authToken, path, handleError) => {
      const options = {
        url: `${url}api/data/${type}`,
        json: true,
        resolveWithFullResponse: true,
        simple: !handleError
      };

      if (authToken) {
        options.headers = {
          Authorization: authToken
        };
      }

      if (path) {
        options.url += path;
      }

      return options;
    };

    const authTestTypes = [
      { type: 'overview' },
      { type: 'analysis' },
      { type: 'funds' },
      { type: 'income' },
      { type: 'bills' },
      { type: 'food' },
      { type: 'general' },
      { type: 'holiday' },
      { type: 'social' },
      { type: 'search' }
    ];

    it.each(authTestTypes, '%s should require authentication', ['type'], (element, next) => {
      request(dataRequest(this.url, element, null, null, true))
        .then(res => {
          expect(res.statusCode).to.be.equal(403); // haven't provided authentication token
          expect(res.body.error).to.be.equal(true);
          expect(res.body.errorText).to.be.equal(config.msg.errorNotAuthorized);
          next();
        })
        .catch(err => {
          throw err;
        });
    });

    describe('overview', () => {
      it('should return valid data');
      it('should update data');
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

    describe('funds', () => {
      it('should get data without history');
      it('should get data with history');
      it('should get data with history limited by period');

      it('should insert data');

      it('should scrape price data');
      it('should scrape holdings data');
    });

    describe('income', () => {
      it('should get data', done => {
        request(dataRequest(this.url, 'income', this.token))
          .then(result => {
            console.log('testData', this.testData);
            expect(result.data.total).to.be.a('number');
            expect(result.data.data).to.be.an('array').of.length.greaterThan(0);
            expect(result.data.data[0].I).to.be.a('number'); // id
            expect(result.data.data[0].i).to.be.a('string'); // item
            expect(result.data.data[0].c).to.be.a('number'); // cost
            expect(result.data.data[0].d).to.be.an('array').lengthOf(3); // date
            done();
          })
          .catch(err => {
            throw err;
          });
      });
      it('should insert data');
    });
    describe('bills', () => {
      it('should get data');
      it('should insert data');
    });
    describe('food', () => {
      it('should get data');
      it('should insert data');
    });
    describe('general', () => {
      it('should get data');
      it('should insert data');
    });
    describe('holiday', () => {
      it('should get data');
      it('should insert data');
    });
    describe('social', () => {
      it('should get data');
      it('should insert data');
    });

    describe('search', () => {
      it('should get data');
    });

    describe('all', () => {
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
});

