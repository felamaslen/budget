import test from 'ava';
import { fromJS } from 'immutable';
import {
    rLoginFormInput,
    rLoginFormSubmit
} from '~client/reducers/login-form.reducer';

test('rLoginFormInput pushing the input string to the state and increment the input step', t => {
    t.deepEqual(rLoginFormInput(fromJS({
        loginForm: {
            values: [],
            inputStep: 0,
            visible: true
        }
    }), { input: '4' }).toJS(), {
        loginForm: {
            values: ['4'],
            inputStep: 1,
            visible: true,
            active: true
        }
    });
});

test('rLoginFormInput handling bad input', t => {
    t.deepEqual(rLoginFormInput(fromJS({
        loginForm: {
            values: [],
            inputStep: 0,
            visible: true
        }
    }), { input: 'f' }).toJS(), {
        loginForm: {
            values: [],
            inputStep: 0,
            visible: true
        }
    });
});

test('rLoginFormInput not doing anything if the login form is not visible', t => {
    t.deepEqual(rLoginFormInput(fromJS({
        loginForm: {
            values: [],
            inputStep: 0,
            visible: false
        }
    }), { input: '4' }).toJS(), {
        loginForm: {
            values: [],
            inputStep: 0,
            visible: false
        }
    });
});

test('rLoginFormInput setting the active state', t => {
    t.deepEqual(rLoginFormInput(fromJS({
        loginForm: {
            values: ['3', '2', '1'],
            inputStep: 3,
            visible: true
        }
    }), { input: '4' }).toJS(), {
        loginForm: {
            values: ['3', '2', '1', '4'],
            inputStep: 4,
            visible: true,
            active: false
        }
    });

    t.deepEqual(rLoginFormInput(fromJS({
        loginForm: {
            values: ['3', '2'],
            inputStep: 2,
            visible: true
        }
    }), { input: '4' }).toJS(), {
        loginForm: {
            values: ['3', '2', '4'],
            inputStep: 3,
            visible: true,
            active: true
        }
    });
});

test.todo('rLoginFormReset');

test('rLoginFormSubmit seting the login form to inactive', t => {
    t.deepEqual(rLoginFormSubmit(fromJS({ loginForm: { active: true } })).toJS(), { loginForm: { active: false } });
});

test.todo('rLoginFormHandleResponse');

