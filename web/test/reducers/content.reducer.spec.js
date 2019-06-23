import test from 'ava';
import { fromJS } from 'immutable';
import { DateTime } from 'luxon';
import {
    rContentBlockHover,
    rRequestContent,
    rHandleContentResponse,
    rSetPage
} from '~client/reducers/content.reducer';

test('rContentBlockHover seting the status to blank if not passing a block', t => {
    t.deepEqual(rContentBlockHover(fromJS({
        other: {
            blockView: {
                status: 'foo'
            }
        }
    }), {}).toJS(), {
        other: {
            blockView: {
                status: ''
            }
        }
    });
});

test('rContentBlockHover seting the block status for normal blocks', t => {
    const state = fromJS({
        other: {
            blockView: {}
        }
    });

    const result = rContentBlockHover(state, {
        block: fromJS({ name: 'foo', value: 503 })
    });

    t.deepEqual(result.toJS(), {
        other: {
            blockView: {
                status: 'Foo (£5.03)'
            }
        }
    });
});

test('rContentBlockHover seting the block status for sub blocks', t => {
    const state = fromJS({
        other: {
            blockView: {}
        }
    });

    const result = rContentBlockHover(state, {
        block: fromJS({ name: 'foo' }),
        subBlock: fromJS({ name: 'bar', value: 9231 })
    });

    t.deepEqual(result.toJS(), {
        other: {
            blockView: {
                status: 'Foo: bar (£92.31)'
            }
        }
    });
});

test('rRequestContent seting the loading status', t => {
    t.true('loading' in rRequestContent(fromJS({ pages: {} }), { page: 'food' }).toJS());

    t.true('loading' in rRequestContent(fromJS({ pages: { food: {} } }), { page: 'food' }).toJS());
});

test('rRequestContent alwaysing reload the analysis page', t => {
    t.true('loading' in rRequestContent(fromJS({ pages: { analysis: {} } }), { page: 'analysis' }).toJS());
});

test('rRequestContent seting the current page', t => {
    t.true('currentPage' in rRequestContent(fromJS({ pages: {} }), { page: 'page1' }).toJS());
});

test('rHandleContentResponse unseting loading and do nothing else, if there was no response', t => {
    t.deepEqual(rHandleContentResponse(fromJS({ loading: true }), {}).toJS(), {
        loading: false
    });
});

test('rHandleContentRespons setting expected parameters in the state', t => {
    const now = DateTime.fromISO('2017-11-10T09:34Z');

    const state = fromJS({
        now,
        loading: true,
        pages: {},
        edit: {
            active: null,
            add: {}
        },
        other: {
            graphFunds: {
                zoomRange: [null, null],
                period: 'fooperiod'
            }
        }
    });

    const response = {
        data: {
            data: {
                total: 0,
                data: [],
                startTime: 1508533928,
                cacheTimes: [191239]
            }
        }
    };

    const result = rHandleContentResponse(state, { response, page: 'funds' }, now);

    t.is(result.get('now'), now);
    t.deepEqual(result.getIn(['pages', 'funds', 'cache', 'fooperiod', 'cacheTimes']).toJS(), [191239]);
    t.is(result.getIn(['pages', 'funds', 'cache', 'fooperiod', 'startTime']), 1508533928);
    t.deepEqual(result.getIn(['pages', 'funds', 'cache', 'fooperiod', 'prices']).toJS(), {});
    t.is(result.getIn(['other', 'graphFunds', 'enabledList', 'overall']), true);
    t.is(result.getIn(['other', 'graphFunds', 'period']), 'fooperiod');
    t.deepEqual(result.getIn(['other', 'graphFunds', 'zoomRange']).toJS(), [0, 1772512]);

    t.is(result.getIn(['edit', 'active', 'row']), -1);
    t.is(result.getIn(['edit', 'active', 'col']), -1);
    t.is(result.getIn(['edit', 'active', 'id']), null);
    t.is(result.getIn(['edit', 'active', 'item']), null);
    t.is(result.getIn(['edit', 'active', 'originalValue']), null);
    t.is(result.getIn(['edit', 'active', 'page']), 'funds');
    t.is(result.getIn(['edit', 'active', 'value']), null);

    t.is(result.getIn(['edit', 'add', 'funds', 0]), '');
    t.is(result.getIn(['edit', 'add', 'funds', 1]).size, 0);
});

test('rSetPage seting the current page', t => {
    t.deepEqual(rSetPage(fromJS({ currentPage: null }), { page: 'food' }).toJS(), { currentPage: 'food' });
});
