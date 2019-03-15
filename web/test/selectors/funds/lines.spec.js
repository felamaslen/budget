/* eslint-disable newline-per-chained-call */
import { List as list } from 'immutable';
import { expect } from 'chai';
import * as S from '~client/selectors/funds/lines';

describe('Funds/lines selectors', () => {
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

            const result = S.getOverallAbsolute(prices, units);

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
                list([0, 400, 399, 380, 386]),
                list([30, 31, 29, 0, 31])
            ]);

            const units = list([
                list([10, 10, 11]),
                list([0, 34, 34, 34, 28]),
                list([10, 10, 10, 10, 10])
            ]);

            const costs = list([
                list([1000, 1000, 1200]),
                list([0, 14000, 14000, 14000, 10800]),
                list([300, 300, 300, 300, 300])
            ]);

            const result = S.getOverallROI(prices, units, costs);

            const expectedResult = [
                0,
                100 * ((102 * 10 + 400 * 34 + 31 * 10) - (1000 + 14000 + 300)) / (1000 + 14000 + 300),
                100 * ((103 * 11 + 399 * 34 + 29 * 10) - (1200 + 14000 + 300)) / (1200 + 14000 + 300),
                100 * ((380 * 34) - (14000)) / 14000,
                100 * ((386 * 28 + 31 * 10) - (10800 + 300)) / (10800 + 300)
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
});

