/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { Map as map, List as list } from 'immutable';
import { DateTime } from 'luxon';
import {
    makeGetGraphProps
} from '../../../src/selectors/funds/graph';
import { GRAPH_FUNDS_MODE_ROI } from '../../../src/constants/graph';
import { testRows, testPrices, testStartTime, testCacheTimes, testLines } from '../../test_data/testFunds';

describe('Funds/graph selectors', () => {
    describe('makeGetGraphProps', () => {
        const getGraphProps = makeGetGraphProps();

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
                viewSoldFunds: true,
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

        const result = getGraphProps(state, { isMobile: false });

        describe('Fund items', () => {
            it('should be a map', () => {
                expect(result).to.have.property('fundItems');
                expect(result.fundItems).to.be.instanceof(map);
            });

            const fundItems = result.fundItems;

            itEach({ testPerIteration: true });
            it.each([
                { id: 'overall', value: { color: [0, 0, 0], enabled: true, item: 'Overall' } },
                { id: 10, value: { color: [0, 74, 153], enabled: false, item: 'some fund 1' } },
                { id: 1, value: { color: [0, 74, 153], enabled: true, item: 'some fund 3' } },
                { id: 3, value: { color: [0, 74, 153], enabled: false, item: 'some fund 2' } },
                { id: 5, value: { color: [0, 153, 99], enabled: false, item: 'test fund 4' } }
            ], 'should set the fund item with id %s', ['id'], ({ id, value }) => {

                expect(fundItems.get(id).toJS()).to.deep.equal(value);
            });
            itEach({ testPerIteration: false });
        });

        it('should return fund lines', () => {
            expect(result).to.have.property('lines');
            expect(result.lines).to.be.instanceof(list);
            expect(result.lines.toJS()).to.deep.equal(testLines);
        });

        it('should not return fund items for deleted funds', () => {
            const stateWithDeletedItem = state.setIn(['pages', 'funds', 'rows'],
                state.getIn(['pages', 'funds', 'rows']).delete(10));

            const resultWithDeletedItem = getGraphProps(stateWithDeletedItem, { isMobile: false });

            expect(resultWithDeletedItem.fundItems.toJS()).not.to.have.property('10');
        });
    });
});

