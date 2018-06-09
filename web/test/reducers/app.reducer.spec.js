import { fromJS } from 'immutable';
import '../browser';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import * as R from '../../src/reducers/app.reducer';
import reduction from '../../src/reduction';

describe('app.reducer', () => {
    describe('rOnWindowResize', () => {
        it('should set the window size in state', () => {
            expect(R.rOnWindowResize(fromJS({ other: { windowWidth: 100 } }), { size: 200 }).toJS())
                .to.deep.equal({ other: { windowWidth: 200 } });
        });
    });

    describe('getItemValue', () => {
        const state = fromJS({
            pages: {
                overview: {
                    data: {
                        cost: {
                            balance: [100, 1001, 392, 9913, 923]
                        }
                    }
                }
            }
        });

        describe('on the overview page', () => {
            it('should get an object with the relevant value', () => {
                expect(R.getItemValue(state, 'overview', 0))
                    .to.deep.equal({ id: null, item: null, value: 100 });

                expect(R.getItemValue(state, 'overview', 3))
                    .to.deep.equal({ id: null, item: null, value: 9913 });
            });
        });

        describe('on list pages', () => {
            it('should be tested');
        });
    });

    describe('rHandleKeyPress', () => {
        it('should do nothing if the key is a modifier', () => {
            expect(R.rHandleKeyPress(fromJS({ foo: 'bar' }), { key: 'Control' }).toJS())
                .to.deep.equal({ foo: 'bar' });

            expect(R.rHandleKeyPress(fromJS({ foo: 'bar' }), { key: 'Shift' }).toJS())
                .to.deep.equal({ foo: 'bar' });
        });

        describe('if logged in', () => {
            const stateLoggedIn = {
                user: {
                    uid: 1
                }
            };

            describe('if navigating from suggestions', () => {
                const stateFromSuggestions = {
                    ...stateLoggedIn,
                    editSuggestions: {
                        list: ['foo', 'bar'],
                        active: 1
                    }
                };

                it('should handle escape', () => {
                    const state = fromJS(stateFromSuggestions);

                    const result = R.rHandleKeyPress(state, { key: 'Escape' });

                    const expectedResult = {
                        ...stateLoggedIn,
                        editSuggestions: {
                            list: [],
                            active: -1
                        }
                    };

                    expect(result.toJS()).to.deep.equal(expectedResult);
                });
            });

            it('should be tested further');
        });

        describe('if not logged in', () => {
            const state = fromJS({
                user: {
                    uid: 0
                },
                loginForm: {
                    values: ['0', '1'],
                    inputStep: 2,
                    visible: true
                }
            });

            it('should reset the login form if Escape was pressed', () => {
                expect(R.rHandleKeyPress(state, { key: 'Escape' }).toJS())
                    .to.deep.equal({
                        user: { uid: 0 },
                        loginForm: {
                            values: [],
                            inputStep: 0,
                            visible: true
                        }
                    });
            });

            it('should input the key to the login form, otherwise', () => {
                expect(R.rHandleKeyPress(state, { key: '4' }).toJS())
                    .to.deep.equal({
                        user: { uid: 0 },
                        loginForm: {
                            values: ['0', '1', '4'],
                            inputStep: 3,
                            visible: true,
                            active: true
                        }
                    });
            });
        });
    });

    describe('rLogout', () => {
        let envBefore = null;
        before(() => {
            envBefore = process.env.DEFAULT_FUND_PERIOD;

            process.env.DEFAULT_FUND_PERIOD = 'year1';
        });
        after(() => {
            process.env.DEFAULT_FUND_PERIOD = envBefore;
        });

        it('should not do anything if the state is loading', () => {
            expect(R.rLogout(fromJS({ loading: true })).toJS())
                .to.deep.equal({ loading: true });
        });

        it('should reset the state and set the login form to visible', () => {
            expect(R.rLogout(fromJS({ loginForm: { visible: false } })).toJS())
                .to.deep.equal(reduction
                    .delete('now')
                    .setIn(['loginForm', 'visible'], true)
                    .deleteIn(['errorMsg'])
                    .deleteIn(['loading'])
                    .deleteIn(['loadingApi'])
                    .toJS()
                );
        });
    });

    describe('rUpdateTime', () => {
        it('should set the now property in the state', () => {
            const now = DateTime.local();

            expect(R.rUpdateTime(fromJS({ now: null }), { now }).toJS()).to.deep.equal({ now });
        });
    });

    describe('rUpdateServer', () => {
        it('should set loadingApi to true', () => {
            expect(R.rUpdateServer(fromJS({ loadingApi: false })).toJS()).to.deep.equal({ loadingApi: true });
        });
    });

    describe('rHandleServerUpdate', () => {
        it('should set loadingApi to false and reset the request queue', () => {
            expect(R.rHandleServerUpdate(fromJS({
                loadingApi: true,
                edit: {
                    requestList: ['foo', 'bar']
                }
            })).toJS())
                .to.deep.equal({
                    loadingApi: false,
                    edit: {
                        requestList: []
                    }
                });
        });
    });
});

