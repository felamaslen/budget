/* eslint id-length: 0, no-unused-expressions: 0 */
import { expect } from 'chai';
import { DateTime } from 'luxon';
import { Map as map } from 'immutable';
import * as rList from '~client/reducers/list.reducer';

describe('List page reducers', () => {
    describe('processRawListRows', () => {
        it('should be tested');
    });

    describe('getListData', () => {
        it('should get properties from the raw response', () => {
            const page = 'food';
            const raw = {
                data: [1, 2, 3],
                total: 1003
            };

            expect(rList.getListData(page, raw).toJS()).to.deep.equal({ total: 1003 });
        });
    });

    describe('processPageDataList', () => {
        it('should set the page data', () => {
            const stateBefore = map({
                pages: map.of()
            });

            const page = 'food';
            const raw = {
                data: [
                    { I: 300, 'd': '2018-05-03', 'i': 'foo', 'k': 'bar', 'c': 1939, 's': 'baz' }
                ],
                total: 1003
            };

            const stateAfter = {
                pages: {
                    food: {
                        data: {
                            total: 1003
                        },
                        rows: {
                            '300': {
                                id: 300,
                                cols: [
                                    DateTime.fromISO('2018-05-03'),
                                    'foo',
                                    'bar',
                                    1939,
                                    'baz'
                                ]
                            }
                        }
                    }
                }
            };

            expect(rList.processPageDataList(stateBefore, { page, raw }).toJS())
                .to.deep.equal(stateAfter);
        });
    });
});

