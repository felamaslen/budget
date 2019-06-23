import test from 'ava';
import { fromJS, Map as map, List as list } from 'immutable';
import { DateTime } from 'luxon';
import {
    pushToRequestQueue
} from '~client/reducers/request-queue.reducer';

test.todo('addToRequestQueue');

test('pushToRequestQueue pushing to the request list', t => {
    const state = map({
        pages: map({
            overview: map({
                startDate: DateTime.fromISO('2017-08-31')
            })
        }),
        edit: map({ requestList: list.of() })
    });

    const dataItem = fromJS({
        page: 'overview',
        row: 3,
        value: 100
    });

    t.deepEqual(
        pushToRequestQueue(state, dataItem).toJS(),
        {
            pages: {
                overview: {
                    startDate: DateTime.fromISO('2017-08-31')
                }
            },
            edit: {
                requestList: [
                    {
                        page: 'overview',
                        req: {
                            body: { year: 2017, month: 11, balance: 100 },
                            method: 'post',
                            query: {},
                            route: 'balance'
                        }
                    }
                ]
            }
        }
    );
});
