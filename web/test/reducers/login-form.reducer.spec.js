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
                    visible: true,
                    active: true
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

        it('should set the active state', () => {
            expect(R.rLoginFormInput(fromJS({
                loginForm: {
                    values: ['3', '2', '1'],
                    inputStep: 3,
                    visible: true
                }
            }), { input: '4' }).toJS()).to.deep.equal({
                loginForm: {
                    values: ['3', '2', '1', '4'],
                    inputStep: 4,
                    visible: true,
                    active: false
                }
            });

            expect(R.rLoginFormInput(fromJS({
                loginForm: {
                    values: ['3', '2'],
                    inputStep: 2,
                    visible: true
                }
            }), { input: '4' }).toJS()).to.deep.equal({
                loginForm: {
                    values: ['3', '2', '4'],
                    inputStep: 3,
                    visible: true,
                    active: true
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

