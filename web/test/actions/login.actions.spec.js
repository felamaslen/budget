import test from 'ava';

import {
    aLoginFormInputted,
    aLoginFormReset,
    aLoginFormResponseReceived
} from '~client/actions/login.actions';

import {
    LOGIN_FORM_INPUTTED,
    LOGIN_FORM_RESET,
    LOGIN_FORM_RESPONSE_GOT
} from '~client/constants/actions';

test('aLoginFormInputted returns LOGIN_FORM_INPUTTED with input', t => {
    t.deepEqual(aLoginFormInputted(9), { type: LOGIN_FORM_INPUTTED, input: 9 });
});

test('aLoginFormReset returns LOGIN_FORM_RESET with index', t => {
    t.deepEqual(aLoginFormReset(10), { type: LOGIN_FORM_RESET, index: 10 });
});

test('aLoginFormResponseReceived returns LOGIN_FORM_RESPONSE_GOT with res object', t => {
    t.deepEqual(aLoginFormResponseReceived({ foo: 'bar' }), {
        type: LOGIN_FORM_RESPONSE_GOT, foo: 'bar'
    });
});
