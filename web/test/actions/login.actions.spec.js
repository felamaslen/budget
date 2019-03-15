import { expect } from 'chai';

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

describe('login.actions', () => {
    describe('aLoginFormInputted', () =>
        it('should return LOGIN_FORM_INPUTTED with input', () =>
            expect(aLoginFormInputted(9)).to.deep.equal({ type: LOGIN_FORM_INPUTTED, input: 9 })
        )
    );
    describe('aLoginFormReset', () =>
        it('should return LOGIN_FORM_RESET with index', () =>
            expect(aLoginFormReset(10)).to.deep.equal({ type: LOGIN_FORM_RESET, index: 10 })
        )
    );
    describe('aLoginFormResponseReceived', () =>
        it('should return LOGIN_FORM_RESPONSE_GOT with res object', () =>
            expect(aLoginFormResponseReceived({ foo: 'bar' })).to.deep.equal({
                type: LOGIN_FORM_RESPONSE_GOT, foo: 'bar'
            })
        )
    );
});

