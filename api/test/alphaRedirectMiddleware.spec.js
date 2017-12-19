/**
 * Specification for alpha-api backwards compatibility
 */

require('dotenv').config();
const expect = require('chai').expect;

const alpha = require('../src/alphaRedirectMiddleware');

describe('Redirect middleware', () => {
    describe('getYearMonthDateFromSplit', () => {
        it('should return a ymd object from a comma separated array', () => {
            expect(alpha.getYearMonthDateFromSplit('2016,7,5')).to.deep.equal({
                year: 2016,
                month: 7,
                date: 5
            });
        });
    });

    describe('replaceDateInBody', () => {
        it('should replace the date in an old-style body', () => {
            const oldBody = { date: '2016,7,5', item: 'foo' };
            const result = alpha.replaceDateInBody(oldBody);
            const expectedResult = { year: 2016, month: 7, date: 5, item: 'foo' };

            expect(result).to.deep.equal(expectedResult);
        });
        it('should handle null data', () => {
            expect(alpha.replaceDateInBody({ foo: 'bar' })).to.deep.equal({ foo: 'bar' });
            expect(alpha.replaceDateInBody({ foo: 'bar', date: NaN })).to.equal(null);
            expect(alpha.replaceDateInBody({ date: null })).to.equal(null);
        });
    });

    describe('getNewBodyFunds', () => {
        it('should process transactions data', () => {
            const transactions = [
                { 'u': 10, 'c': 20, 'd': '2016,6,7' },
                { 'u': 11, 'c': 25, 'd': '2017,9,29' }
            ];

            const oldBody = {
                item: 'foo',
                transactions: JSON.stringify(transactions)
            };

            const result = alpha.getNewBodyFunds(oldBody);
            const expectedResult = {
                item: 'foo',
                transactions: [
                    { year: 2016, month: 6, date: 7, units: 10, cost: 20 },
                    { year: 2017, month: 9, date: 29, units: 11, cost: 25 }
                ]
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('getNewMethodBodyFromOld', () => {
        it('should map get -> get', () => {
            expect(alpha.getNewMethodBodyFromOld('get', {}, ['data', 'overview']))
                .to.deep.equal({
                    method: 'get',
                    body: {}
                });
        });

        it('should map post -> post', () => {
            ['funds', 'income', 'food', 'general', 'holiday', 'social'].forEach(category => {
                expect(alpha.getNewMethodBodyFromOld('post', {
                    date: '2016,5,1', item: 'foo'
                }, ['add', category]))
                    .to.deep.equal({
                        method: 'post',
                        body: { year: 2016, month: 5, date: 1, item: 'foo' }
                    });
            });
        });

        it('should map post -> delete', () => {
            ['funds', 'income', 'food', 'general', 'holiday', 'social'].forEach(category => {
                expect(alpha.getNewMethodBodyFromOld('post', {
                    id: 100
                }, ['delete', category]))
                    .to.deep.equal({
                        method: 'delete',
                        body: { id: 100 }
                    });
            });
        });

        it('should map post -> put', () => {
            ['funds', 'income', 'food', 'general', 'holiday', 'social'].forEach(category => {
                expect(alpha.getNewMethodBodyFromOld('post', {
                    date: '2016,5,1', item: 'foo'
                }, ['update', category]))
                    .to.deep.equal({
                        method: 'put',
                        body: { year: 2016, month: 5, date: 1, item: 'foo' }
                    });
            });
        });
    });

    describe('getNewTaskFromOld', () => {
        it('should handle user routes', () => {
            expect(alpha.getNewTaskFromOld(['login'])).to.deep.equal(['user', 'login']);
        });
        it('should handle data routes', () => {
            expect(alpha.getNewTaskFromOld(['update', 'foo'])).to.deep.equal(['data', 'foo']);
            expect(alpha.getNewTaskFromOld(['add', 'foo'])).to.deep.equal(['data', 'foo']);
            expect(alpha.getNewTaskFromOld(['delete', 'foo'])).to.deep.equal(['data', 'foo']);
        });
        it('should return the task for unknown routes', () => {
            expect(alpha.getNewTaskFromOld(['foo', 'bar'])).to.deep.equal(['foo', 'bar']);
        });
    });

    describe('getNewQueryFromOld', () => {
        it('should handle funds query', () => {
            expect(alpha.getNewQueryFromOld({
                period: 'year1'
            }, ['data', 'funds']))
                .to.deep.equal({ period: 'year', length: '1', history: 'false' });

            expect(alpha.getNewQueryFromOld({
                period: 'month3',
                history: ''
            }, ['data', 'funds']))
                .to.deep.equal({ period: 'month', length: '3', history: 'true' });

            expect(alpha.getNewQueryFromOld({
                period: 'month3',
                history: 'false'
            }, ['data', 'funds']))
                .to.deep.equal({ period: 'month', length: '3', history: 'false' });
        });
    });
});

