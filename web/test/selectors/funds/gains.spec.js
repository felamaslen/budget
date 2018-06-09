import { expect } from 'chai';
import { Map as map } from 'immutable';
import { testRows, testPrices, testStartTime, testCacheTimes } from '../../test_data/testFunds';
import * as S from '../../../src/selectors/funds/gains';

describe('Funds/gains selectors', () => {
    describe('getRowGains', () => {
        it('should return the correct values', () => {
            const testCache = map({
                startTime: testStartTime,
                cacheTimes: testCacheTimes,
                prices: testPrices
            });

            const gains = S.getRowGains(testRows, testCache);

            const expectedResult = map([
                [10, map({
                    value: 399098.2,
                    gain: -0.0023,
                    gainAbs: -902,
                    dayGain: 0.0075,
                    dayGainAbs: 2989
                })],
                [3, map({
                    value: 50300,
                    gain: 0.1178,
                    gainAbs: 5300
                })],
                [1, map({
                    value: 80760,
                    gain: -0.1027,
                    gainAbs: -9240
                })],
                [5, map({
                    value: 265622,
                    gain: 0.3281,
                    gainAbs: 65622
                })]
            ]);

            expect(gains.toJS()).to.deep.equal(expectedResult.toJS());
        });
    });
});

