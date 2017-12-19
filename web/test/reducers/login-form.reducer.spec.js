import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/login-form.reducer';

describe('Login form reducer', () => {
    describe('rLoginFormInput', () => {
        it('should push the input string to the state and increment the input step', () => {
            expect(R.rLoginFormInput(fromJS({
                loginForm: {
                    values: [],
                    inputStep: 0,
                    visible: true
                }
            }), { input: '4' }).toJS()).to.deep.equal({
                loginForm: {
                    values: ['4'],
                    inputStep: 1,
                    visible: true
                }
            });
        });

        it('should handle bad input', () => {
            expect(R.rLoginFormInput(fromJS({
                loginForm: {
                    values: [],
                    inputStep: 0,
                    visible: true
                }
            }), { input: 'f' }).toJS()).to.deep.equal({
                loginForm: {
                    values: [],
                    inputStep: 0,
                    visible: true
                }
            });
        });

        it('should not do anything if the login form is not visible', () => {
            expect(R.rLoginFormInput(fromJS({
                loginForm: {
                    values: [],
                    inputStep: 0,
                    visible: false
                }
            }), { input: '4' }).toJS()).to.deep.equal({
                loginForm: {
                    values: [],
                    inputStep: 0,
                    visible: false
                }
            });
        });
    });

    describe('rLoginFormReset', () => {
        it('should be tested');
    });

    describe('rLoginFormSubmit', () => {
        it('should set the login form to inactive', () => {
            expect(R.rLoginFormSubmit(fromJS({ loginForm: { active: true } })).toJS())
                .to.deep.equal({ loginForm: { active: false } });
        });
    });

    describe('rLoginFormHandleResponse', () => {
        it('should be tested');
    });
});

