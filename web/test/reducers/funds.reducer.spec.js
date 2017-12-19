import { Map as map, List as list } from 'immutable';

import chai from 'chai';

const expect = chai.expect;

import { testRows, testLines, testStartTime, testCacheTimes }
    from '../test_data/testFunds';

import * as rFunds from '../../src/reducers/funds.reducer';
import { GRAPH_FUNDS_MODE_ROI } from '../../src/misc/const';

const pageIndex = 2;

describe('funds', () => {
    describe('getFundsCachedValueAgeText', () => {
        it('should return the expected string', () => {
            const now = new Date();

            expect(rFunds.getFundsCachedValueAgeText(
                now.getTime() / 1000 - 4000, list([0, 100, 400]), now
            ))
                .to.equal('1 hour ago');
        });
    });
    describe('getFundsCachedValue', () => {
        it('should return the correct value', () => {
            const now = new Date();
            const startTime = testStartTime;
            const cacheTimes = testCacheTimes;

            const expectedValue = 399098.2;

            expect(rFunds.getFundsCachedValue(
                testRows, startTime, cacheTimes, now, pageIndex
            ).get('value'))
                .to.equal(expectedValue);
        });
    });
    describe('getFundColor', () => {
        it('should be tested');
    });
    describe('getRowsWithPrices', () => {
        it('should be tested');
    });
    describe('getRowGains', () => {
        it('should be tested');
    });
    describe('getGains', () => {
        it('should return the correct values', () => {
            const expectedResult = list([
                map({
                    value: 399098.2,
                    gain: -0.0023,
                    gainAbs: -902,
                    dayGain: 0.0075,
                    dayGainAbs: 2989,
                    color: [255, 235, 235]
                }),
                map({
                    value: 45616.5,
                    gain: 0.0137,
                    gainAbs: 617,
                    dayGain: 0.0032,
                    dayGainAbs: 144,
                    color: [215, 251, 218]
                }),
                map({
                    value: 87797.5098,
                    gain: -0.0245,
                    gainAbs: -2202,
                    dayGain: 0.0148,
                    dayGainAbs: 1330,
                    color: [255, 44, 44]
                }),
                map({
                    value: 217366.518,
                    gain: 0.0868,
                    gainAbs: 17367,
                    dayGain: 0.0055,
                    dayGainAbs: 1095,
                    color: [0, 230, 18]
                })
            ]);

            const startTime = testStartTime;
            const cacheTimes = testCacheTimes;

            const gains = rFunds.getGains(testRows, startTime, cacheTimes, pageIndex)
                .map(item => item.get('gain'));

            expect(gains.toJS()).to.deep.equal(expectedResult.toJS());
        });
    });
    describe('getRowHistory', () => {
        it('should be tested');
    });
    describe('getExtraRowProps', () => {
        it('should be tested');
    });
    describe('zoomFundLines', () => {
        it('should be tested');
    });
    describe('getOverallAbsolute', () => {
        it('should sum prices and return a line', () => {
            const prices = list([
                list([100, 102, 103]),
                list([0, 400, 399, 380, 386])
            ]);

            const units = list([
                list([10, 10, 11]),
                list([0, 34, 34, 34, 28])
            ]);

            const result = rFunds.getOverallAbsolute(prices, units);

            const expectedResult = [
                100 * 10 + 0 * 0,
                102 * 10 + 400 * 34,
                103 * 11 + 399 * 34,
                380 * 34,
                386 * 28
            ];

            expect(result.toJS()).to.deep.equal(expectedResult);
        });
    });
    describe('getFundLineAbsolute', () => {
        it('should be tested');
    });
    describe('getOverallROI', () => {
        it('should get the correct values and return a line', () => {
            const prices = list([
                list([100, 102, 103]),
                list([0, 400, 399, 380, 386])
            ]);

            const units = list([
                list([10, 10, 11]),
                list([0, 34, 34, 34, 28])
            ]);

            const costs = list([
                list([1000, 1000, 1200]),
                list([0, 14000, 14000, 14000, 10800])
            ]);

            const result = rFunds.getOverallROI(prices, units, costs);

            const expectedResult = [
                0,
                -100 * 380 / 15000,
                -100 * 501 / 15200,
                -100 * 1080 / 14000,
                100 * 8 / 10800
            ];

            expect(result.toJS()).to.deep.equal(expectedResult);
        });
    });
    describe('getFundLineROI', () => {
        it('should be tested');
    });
    describe('getFundLinePrice', () => {
        it('should be tested');
    });
    describe('getOverallLine', () => {
        it('should be tested');
    });
    describe('getFundLine', () => {
        it('should be tested');
    });
    describe('getFundLineProcessed', () => {
        it('should be tested');
    });
    describe('getFundLines', () => {
        it('should be tested');
    });
    describe('getFormattedHistory', () => {
        it('should return expected data', () => {
            const mode = GRAPH_FUNDS_MODE_ROI;
            const startTime = testStartTime;
            const cacheTimes = testCacheTimes;

            const result = rFunds.getFormattedHistory(
                testRows, mode, pageIndex, startTime, cacheTimes, list([null, null])
            );

            expect(result.get('fundItems').toJS()).to.deep.equal([
                {
                    item: 'Overall',
                    enabled: true,
                    color: [0, 0, 0]
                },
                {
                    item: 'some fund 1',
                    enabled: true,
                    color: [255, 0, 86]
                },
                {
                    item: 'some fund 2',
                    enabled: false,
                    color: [158, 0, 142]
                },
                {
                    item: 'some fund 3',
                    enabled: false,
                    color: [14, 76, 161]
                },
                {
                    item: 'test fund 4',
                    enabled: false,
                    color: [0, 95, 57]
                }
            ]);

            const lines = result.get('fundLines').map(item => item.get('line'));

            expect(lines.toJS()).to.deep.equal(testLines);
        });
    });
});

