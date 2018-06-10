/* eslint-disable newline-per-chained-call */
import { Map as map } from 'immutable';
import { DateTime } from 'luxon';
import { expect } from 'chai';
import * as S from '../../../src/selectors/funds/graph';
import { GRAPH_FUNDS_MODE_ROI } from '../../../src/constants/graph';
import { testRows, testPrices, testStartTime, testCacheTimes, testLines } from '../../test_data/testFunds';

describe('Funds/graph selectors', () => {
    describe('makeGetGraphProps', () => {
        it('should return expected data', () => {
            const state = map({
                now: DateTime.fromISO('2017-09-01T19:01Z'),
                pages: map({
                    funds: map({
                        rows: testRows,
                        cache: map({
                            period1: map({
                                startTime: testStartTime,
                                cacheTimes: testCacheTimes,
                                prices: testPrices
                            })
                        })
                    })
                }),
                other: map({
                    graphFunds: map({
                        mode: GRAPH_FUNDS_MODE_ROI,
                        period: 'period1',
                        enabledList: map([
                            ['overall', true],
                            [10, false],
                            [1, true],
                            [3, false],
                            [5, false]
                        ])
                    })
                })
            });

            const result = S.makeGetGraphProps()(state, { isMobile: false });

            expect(result.fundItems.toJS()).to.deep.equal({
                overall: { color: [0, 0, 0], enabled: true, item: 'Overall' },
                '10': { color: [0, 125, 181], enabled: false, item: 'some fund 1' },
                '1': { color: [255, 0, 86], enabled: true, item: 'some fund 3' },
                '3': { color: [14, 76, 161], enabled: false, item: 'some fund 2' },
                '5': { color: [149, 0, 58], enabled: false, item: 'test fund 4' }
            });

            expect(result.lines.toJS()).to.deep.equal(testLines);
        });
    });
});

