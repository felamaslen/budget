/**
 * Spec for API config file
 */

/* eslint no-unused-expressions: 0 */
require('dotenv').config();

const expect = require('chai').expect;
require('it-each')({ testPerIteration: true });

const config = require('~api/src/config')();

describe('Config', () => {
    it('should define debug', () => {
        expect(config.debug).to.be.oneOf([true, false]);
    });

    it('should define MySQL connection URI', () => {
        expect(config.mysqlUri).to.match(/^mysql:\/\/\w+:\w+@\w+(\.\w+)*(:[0-9]+)?\/\w+$/);
    });

    it('should define Web URL', () => {
        expect(config.webUrl).to.match(/^https?:\/\/\w+(\.\w+)*(:[0-9]+)?(\/(\w|\.)*)*$/);
    });

    describe('user', () => {
        it('should be defined', () => {
            expect(config.user).to.be.an('object');
        });
        it('should define user hash salt', () => {
            expect(config.user.hashSalt).to.be.a('string').lengthOf.greaterThan(5);
        });
        it.each([
            { item: 'banTime' },
            { item: 'banLimit' },
            { item: 'banTries' }
        ], 'should define %s', ['item'], elem => {

            expect(config.user[elem.item]).to.be.a('number').greaterThan(0);
        });
    });

    describe('messages', () => {
        it('should be defined', () => {
            expect(config.msg).to.be.an('object');
        });

        it.each([
            { item: 'unknownApiEndpoint' },
            { item: 'errorServerDb' },
            { item: 'errorLoginBad' },
            { item: 'errorIpBanned' },
            { item: 'errorNotAuthorized' }
        ], 'should define %s', ['item'], elem => {

            expect(config.msg[elem.item]).to.be.a('string').lengthOf.greaterThan(0);
        });
    });

    describe('data', () => {
        it('should be defined', () => {
            expect(config.data).to.be.an('object');
        });

        it('should define listCategories', () => {
            expect(config.data.listCategories).to.deep.equal([
                'funds',
                'income',
                'bills',
                'food',
                'general',
                'holiday',
                'social'
            ]);
        });

        describe('funds', () => {
            it('should be defined', () => {
                expect(config.data.funds).to.be.an('object');
            });
            it('should define salt', () => {
                expect(config.data.funds.salt).to.be.a('string').lengthOf.greaterThan(0);
            });
            it('should define resolution', () => {
                expect(config.data.funds.historyResolution)
                    .to.be.a('number').greaterThan(0);
            });
            it('should define stocks api key', () => {
                expect(config.data.funds.stocksApiKey).to.be.a('string');
            });
        });

        describe('overview', () => {
            it('should be defined', () => {
                expect(config.data.overview).to.be.an('object');
            });

            it('should define numLast', () => {
                expect(config.data.overview.numLast).to.be.a('number');
            });

            it('should define numFuture', () => {
                expect(config.data.overview.numFuture).to.be.a('number');
            });

            it('should define startYear', () => {
                expect(config.data.overview.startYear).to.be.a('number');
            });

            it('should define startMonth', () => {
                expect(config.data.overview.startMonth).to.be.a('number');
            });
        });
    });

    it('should define an Open Exchange Rates API key', () => {
        expect(config).to.have.property('openExchangeRatesApiKey');
        expect(config.openExchangeRatesApiKey).to.be.a('string');
    });
});
