import test from 'ava';
import { fromJS } from 'immutable';
import {
    rErrorMessageOpen,
    rErrorMessageClose,
    rErrorMessageRemove
} from '~client/reducers/error.reducer';

test('rErrorMessageOpen pushing the message to the list', t => {
    const message = fromJS({
        foo: 'bar'
    });

    const msgId = '119238';

    const result = rErrorMessageOpen(fromJS({
        errorMsg: []
    }), { message, msgId });

    t.deepEqual(result.get('errorMsg').toJS(), [{ foo: 'bar', id: '119238' }]);
});

test('rErrorMessageClose seting the selected message to closed', t => {
    t.deepEqual(
        rErrorMessageClose(fromJS({
            errorMsg: [
                { id: 'foo' },
                { id: 'bar' }
            ]
        }), { msgId: 'foo' })
            .get('errorMsg')
            .toJS(),
        [
            { id: 'foo', closed: true },
            { id: 'bar' }
        ]
    );
});

test('rErrorMessageRemove removeing the selected message from the list', t => {
    t.deepEqual(
        rErrorMessageRemove(fromJS({
            errorMsg: [
                { id: 'foo' },
                { id: 'bar' }
            ]
        }), { msgId: 'foo' })
            .get('errorMsg')
            .toJS(),
        [
            { id: 'bar' }
        ]
    );
});
