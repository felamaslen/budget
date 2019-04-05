import test from 'ava';
import { fromJS } from 'immutable';
import {
    getNow,
    getApiKey,
    getRequestList,
    getAddData,
    getContentParamsAnalysis,
    getLoadedStatus
} from '~client/selectors/app';

test('getNow gets the current time from the state', t => {
    t.is(getNow(fromJS({ now: 'foo' })), 'foo');
});

test('apiKey gets the API key from the state', t => {
    t.is(getApiKey(fromJS({
        user: {
            apiKey: 'foo'
        }
    })), 'foo');
});

test('getRequestList gets the requestList and map it to each request', t => {
    t.deepEqual(getRequestList(fromJS({
        edit: {
            requestList: [{ req: 1, foo: 'bar' }, { req: 2, bar: 'baz' }]
        }
    })).toJS(), [1, 2]);
});

test('getAddData gets the fields and item', t => {
    t.deepEqual(getAddData(fromJS({
        edit: {
            addFields: 'foo',
            addFieldsString: 'bar'
        }
    })), { fields: 'foo', item: 'bar' });
});

test('getContentParamsAnalysis gets the periodKey and groupingKey from state', t => {
    t.deepEqual(getContentParamsAnalysis(fromJS({
        other: {
            analysis: {
                period: 'foo',
                grouping: 'bar',
                timeIndex: 'baz'
            }
        }
    })), {
        periodKey: 'foo',
        groupingKey: 'bar',
        timeIndex: 'baz'
    });
});

test('getLoadedStatus returns the pagesLoaded status from state', t => {
    t.is(getLoadedStatus(fromJS({ pages: { foo: { is: 'loaded' } } }), { page: 'foo' }), true);
    t.is(getLoadedStatus(fromJS({ pages: { foo: { is: 'loaded' } } }), { page: 'bar' }), false);
    t.is(getLoadedStatus(fromJS({ pages: { foo: { is: 'loaded' } } }), { page: 'baz' }), false);
});

