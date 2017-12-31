import { fromJS, Map as map, List as list } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/request-queue.reducer';

describe('Request queue reducer', () => {
    describe('addToRequestQueue', () => {
        it('should be tested');
    });

    describe('pushToRequestQueue', () => {
        it('should push to the request list', () => {
            const state = map({
                pages: list([map({ data: map({ startYearMonth: [2017, 8] }) })]),
                edit: map({ requestList: list.of() })
            });

            const dataItem = fromJS({
                pageIndex: 0,
                row: 3,
                value: 100
            });

            expect(R.pushToRequestQueue(state, dataItem).toJS())
                .to.deep.equal({
                    pages: [{ data: { startYearMonth: [2017, 8] } }],
                    edit: {
                        requestList: [
                            {
                                pageIndex: 0,
                                req: {
                                    body: { year: 2017, month: 11, balance: 100 },
                                    method: 'post',
                                    query: {},
                                    route: 'balance'
                                }
                            }
                        ]
                    }
                });
        });
    });
});
