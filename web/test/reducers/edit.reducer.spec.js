import test from 'ava';
import { fromJS } from 'immutable';
import {
    getInvalidInsertDataKeys,
    stringifyFields,
    rHandleServerAdd,
    rHandleSuggestions
} from '~client/reducers/edit.reducer';
import { dateInput } from '~client/modules/date';

test.todo('rActivateEditable');

test.todo('rChangeEditable');

test('getInvalidInsertDataKeys geting a list of invalid data keys', t => {
    const items = fromJS([
        { item: 'item', value: '' },
        { item: 'foo', value: '' },
        { item: 'category', value: '' },
        { item: 'category', value: 'foobar' },
        { item: 'society', value: '' },
        { item: 'holiday', value: '' },
        { item: 'bar', value: '' },
        dateInput('13/10/17'),
        dateInput('foo')
    ]);

    t.deepEqual(getInvalidInsertDataKeys(items).toJS(), [0, 2, 4, 5, 8]);
});

test('stringifyFields serialiseing fields into an object of strings', t => {
    const fields = fromJS([
        { item: 'foo1', value: 'bar' },
        { item: 'foo2', value: dateInput('13/10/17') },
        { item: 'foo3', value: 10.43 }
    ]);

    t.deepEqual(stringifyFields(fields), {
        foo1: 'bar',
        foo2: '2017-10-13',
        foo3: 10.43
    });
});

test.todo('rHandleServerAdd');

test('rHandleServerAdd shouldn\'t do anything if an error occurred', t => {
    t.deepEqual(rHandleServerAdd(fromJS({ loadingApi: true, foo: 'bar' }), { err: true }).toJS(), { loadingApi: false, foo: 'bar' });
});

test('rHandleSuggestions setting editSuggestions/loading to false', t => {
    t.is(rHandleSuggestions(fromJS({
        editSuggestions: {
            loading: true
        }
    }), {}).getIn(['editSuggestions', 'loading']), false);
});

test('rHandleSuggestions setting the active suggestion to -1', t => {
    t.is(rHandleSuggestions(fromJS({
        editSuggestions: {
            active: 5
        }
    }), {}).getIn(['editSuggestions', 'active']), -1);
});

test('rHandleSuggestions resetting the list if there are no results, or if the request is stale', t => {
    const resultNoItems = rHandleSuggestions(fromJS({
        editSuggestions: {
            active: 5
        }
    }), {});

    t.is(resultNoItems.getIn(['editSuggestions', 'list']).size, 0);
    t.is(resultNoItems.getIn(['editSuggestions', 'reqId']), null);

    const resultWrongId = rHandleSuggestions(fromJS({
        editSuggestions: {
            active: 5,
            reqId: 100
        }
    }), { items: ['foo'], reqId: 101 });

    t.is(resultWrongId.getIn(['editSuggestions', 'list']).size, 0);
    t.is(resultWrongId.getIn(['editSuggestions', 'reqId']), null);
});

test('rHandleSuggestions inserting the list into the state', t => {
    t.deepEqual(
        rHandleSuggestions(fromJS({
            editSuggestions: {
                loading: true,
                active: 3,
                reqId: 100,
                list: []
            },
            edit: {
                active: {
                    value: 'foo'
                }
            }
        }), {
            data: { list: ['bar', 'baz'] },
            reqId: 100
        })
            .get('editSuggestions')
            .toJS(),
        {
            loading: false,
            active: -1,
            reqId: 100,
            list: ['bar', 'baz'],
            nextCategory: []
        }
    );
});

test.todo('rRequestSuggestions');
test.todo('rChangeFundTransactions');
test.todo('rAddFundTransactions');
test.todo('rRemoveFundTransactions');
