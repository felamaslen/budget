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
                    value: 45616.5,
                    gain: 0.0137,
                    gainAbs: 617,
                    dayGain: 0.0032,
                    dayGainAbs: 144
                })],
                [1, map({
                    value: 87797.5098,
                    gain: -0.0245,
                    gainAbs: -2202,
                    dayGain: 0.0154,
                    dayGainAbs: 1330
                })],
                [5, map({
                    value: 217366.518,
                    gain: 0.0868,
                    gainAbs: 17367,
                    dayGain: 0.0051,
                    dayGainAbs: 1095
                })]
            ]);

            expect(gains.toJS()).to.deep.equal(expectedResult.toJS());
        });
    });
});

