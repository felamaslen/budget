import { expect } from 'chai';

import * as A from '../../src/actions/login.actions';
import * as C from '../../src/constants/actions';

describe('login.actions', () => {
    describe('aLoginFormInputted', () =>
        it('should return LOGIN_FORM_INPUTTED with input', () =>
            expect(A.aLoginFormInputted(9)).to.deep.equal({ type: C.LOGIN_FORM_INPUTTED, payload: 9 })
        )
    );
    describe('aLoginFormReset', () =>
        it('should return LOGIN_FORM_RESET with index', () =>
            expect(A.aLoginFormReset(10)).to.deep.equal({ type: C.LOGIN_FORM_RESET, payload: 10 })
        )
    );
    describe('aLoginFormSubmitted', () =>
        it('should return LOGIN_FORM_SUBMITTED with pin', () =>
            expect(A.aLoginFormSubmitted(1929)).to.deep.equal({ type: C.LOGIN_FORM_SUBMITTED, payload: 1929 })
        )
    );
    describe('aLoginFormResponseReceived', () =>
        it('should return LOGIN_FORM_RESPONSE_GOT with res object', () =>
            expect(A.aLoginFormResponseReceived({ foo: 'bar' })).to.deep.equal({
                type: C.LOGIN_FORM_RESPONSE_GOT, payload: { foo: 'bar' }
            })
        )
    );
});

