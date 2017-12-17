import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/app.reducer';
import reduction from '../../src/reduction';

describe('app.reducer', () => {
    describe('rHandleKeyPress', () => {
        it('should do nothing if the key is a modifier', () => {
            expect(R.rHandleKeyPress(fromJS({ foo: 'bar' }), { key: 'Control' }).toJS())
                .to.deep.equal({ foo: 'bar' });

            expect(R.rHandleKeyPress(fromJS({ foo: 'bar' }), { key: 'Shift' }).toJS())
                .to.deep.equal({ foo: 'bar' });
        });

        describe('if logged in', () => {
            it('works', () => null);
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
                            visible: true
                        }
                    });
            });
        });
    });

    describe('rLogout', () => {
        it('should not do anything if the state is loading', () => {
            expect(R.rLogout(fromJS({ loading: true })).toJS())
                .to.deep.equal({ loading: true });
        });

        it('should reset the state and set the login form to visible', () => {
            expect(R.rLogout(fromJS({ loginForm: { visible: false } })).toJS())
                .to.deep.equal(reduction
                    .setIn(['loginForm', 'visible'], true)
                    .deleteIn(['errorMsg'])
                    .deleteIn(['loading'])
                    .deleteIn(['loadingApi'])
                    .toJS()
                );
        });
    });

    describe('rUpdateTime', () => {
        describe('if on the funds page', () => {
            const state = fromJS({
                pages: [null, null, {}],
                other: {
                    graphFunds: {
                        startTime: 0,
                        cacheTimes: [new Date('2017-11-10 09:21').getTime() / 1000]
                    },
                    fundsCachedValue: {
                        ageText: null
                    }
                }
            });

            it('should update the cached value age', () => {
                expect(R.rUpdateTime(state, new Date('2017-11-10 10:00')).toJS())
                    .to.deep.equal({
                        other: {
                            fundsCachedValue: {
                                ageText: '39 minutes ago'
                            },
                            graphFunds: {
                                cacheTimes: [
                                    1510305660
                                ],
                                startTime: 0
                            }
                        },
                        pages: [null, null, {}]
                    });
            });
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

