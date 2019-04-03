import test from 'ava';
import { DateTime } from 'luxon';
import { Map as map } from 'immutable';
import {
    getListData,
    processPageDataList
} from '~client/reducers/list.reducer';

test.todo('processRawListRows');

test('getListData geting properties from the raw response', t => {
    const page = 'food';
    const raw = {
        data: [1, 2, 3],
        total: 1003
    };

    t.deepEqual(getListData(page, raw).toJS(), { total: 1003 });
});

test('processPageDataList seting the page data', t => {
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

    t.deepEqual(processPageDataList(stateBefore, { page, raw }).toJS(), stateAfter);
});

