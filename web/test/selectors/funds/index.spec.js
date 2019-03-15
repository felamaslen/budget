/* eslint-disable newline-per-chained-call */
import { fromJS, List as list } from 'immutable';
import { DateTime } from 'luxon';
import { expect } from 'chai';
import * as S from '~client/selectors/funds';
import { testRows, testPrices, testStartTime, testCacheTimes } from '../../test_data/testFunds';

describe('Funds selectors', () => {
    describe('getFundsCachedValueAgeText', () => {
        it('should return the expected string', () => {
            const now = DateTime.fromISO('2018-06-03');

            expect(S.getFundsCachedValueAgeText(now.ts / 1000 - 4000, list([0, 100, 400]), now))
                .to.equal('1 hour ago');
        });
    });

    describe('getFundsCachedValue', () => {
        it('should get an age text and value', () => {
            const state = fromJS({
                now: DateTime.fromISO('2017-09-01T19:01Z'),
                pages: {
                    funds: {
                        rows: testRows,
                        cache: {
                            period1: {
                                startTime: testStartTime,
                                cacheTimes: testCacheTimes,
                                prices: testPrices
                            }
                        }
                    }
                },
                other: {
                    graphFunds: {
                        period: 'period1'
                    }
                }
            });

            const expectedValue = 399098.2;
            const expectedAgeText = '2 hours ago';

            expect(S.getFundsCachedValue(state).toJS())
                .to.deep.equal({ value: expectedValue, ageText: expectedAgeText });
        });
    });

    describe('getProcessedFundsRows', () => {
        it('should set gain, prices, sold and class information on each fund row', () => {
            const state = fromJS({
                now: DateTime.fromISO('2017-09-01T19:01Z'),
                pages: {
                    funds: {
                        rows: testRows,
                        cache: {
                            period1: {
                                startTime: testStartTime,
                                cacheTimes: testCacheTimes,
                                prices: testPrices
                            }
                        }
                    }
                },
                other: {
                    graphFunds: {
                        period: 'period1'
                    }
                }
            });

            const result = S.getProcessedFundsRows(state);

            expect(result.get(10).delete('cols').delete('prices').toJS()).to.deep.equal({
                className: '',
                sold: false,
                gain: {
                    color: [255, 250, 250],
                    dayGain: 0.0075,
                    dayGainAbs: 2989,
                    gain: -0.0023,
                    gainAbs: -902,
                    value: 399098.2
                }
            });

            expect(result.get(1).delete('cols').delete('prices').toJS()).to.deep.equal({
                className: 'sold',
                sold: true,
                gain: {
                    color: [255, 44, 44],
                    gain: -0.1027,
                    gainAbs: -9240,
                    value: 80760
                }
            });
        });
    });
});

