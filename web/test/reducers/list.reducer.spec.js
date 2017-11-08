/* eslint id-length: 0, no-unused-expressions: 0 */
import { Map as map, List as list } from 'immutable';
import { expect } from 'chai';

import * as rList from '../../src/reducers/list.reducer';

describe('list', () => {
    describe('processPageDataFunds', () => {
        it('should return formatted funds page data', () => {
            const reduction = map({
                pages: list([null, null, null]),
                other: map({
                    graphFunds: map({
                        period: 'year1',
                        zoom: list([null, null])
                    })
                })
            });

            const pageIndex = 2;

            const now = new Date('2017-09-05');
            const startTime = Math.floor(new Date('2017-09-01').getTime() / 1000);

            const data = {
                data: [
                    {
                        d: [2016, 9, 1],
                        i: 'some fund name',
                        c: 100000,
                        I: 1,
                        tr: [
                            { c: 700000, u: 100, d: [2016, 9, 1] },
                            { c: 300000, u: 40, d: [2017, 1, 5] }
                        ],
                        pr: [
                            100.5,
                            102.3,
                            101.9,
                            99.76,
                            98.1,
                            99.12
                        ],
                        prStartIndex: 2
                    }
                ],
                total: 100000,
                startTime,
                cacheTimes: [0, 1, 2, 3, 4, 5, 6, 7]
            };

            const result = rList.processPageDataFunds(reduction, pageIndex, data, now);

            const other = result.getIn(['other']);

            expect(other.getIn(['fundHistoryCache', 'year1']))
                .to.be.ok;

            expect(other.get('fundsCachedValue')).to.be.ok;

            expect(other.getIn(['graphFunds', 'startTime'])).to.equal(startTime);
            expect(other.getIn(['graphFunds', 'cacheTimes']).toJS())
                .to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7]);

            expect(other.getIn(['graphFunds', 'zoom']).toJS())
                .to.deep.equal([0, 86400 * 4]);

            expect(other.getIn(['graphFunds', 'range']).toJS())
                .to.deep.equal([0, 86400 * 4]);

            expect(other.getIn(['graphFunds', 'data'])).to.be.ok;
        });
    });
});

