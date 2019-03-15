import { fromJS, Map as map, List as list } from 'immutable';
import '~client-test/browser.js';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import * as R from '~client/reducers/app.reducer';
import reduction from '~client/reduction';

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
            describe('on the add row', () => {
                it('should return the current add-item value', () => {
                    const stateOnAddRow = state.set('edit', map({
                        add: map({
                            food: list.of(DateTime.fromISO('2018-06-10'), 'foo', 'bar', 365, 'baz')
                        })
                    }));

                    expect(R.getItemValue(stateOnAddRow, 'food', -1, 1))
                        .to.deep.equal({ id: null, item: 'item', value: 'foo' });
                    expect(R.getItemValue(stateOnAddRow, 'food', -1, 3))
                        .to.deep.equal({ id: null, item: 'cost', value: 365 });
                });
            });
            describe('on a list row', () => {
                it('should return the current list-row value', () => {
                    const stateOnListRow = state.setIn(['pages', 'food', 'rows'], map([
                        [76, map({
                            cols: list.of(DateTime.fromISO('2018-06-03'), 'foo1', 'bar1', 861, 'baz2')
                        })],
                        [2, map({
                            cols: list.of(DateTime.fromISO('2018-06-11'), 'foo2', 'bar2', 1943, 'baz3')
                        })]
                    ]));

                    expect(R.getItemValue(stateOnListRow, 'food', 76, 4))
                        .to.deep.equal({ id: 76, item: 'shop', value: 'baz2' });

                    expect(R.getItemValue(stateOnListRow, 'food', 2, 0))
                        .to.deep.equal({ id: 2, item: 'date', value: DateTime.fromISO('2018-06-11') });
                });
            });
        });
    });

    describe('rHandleKeyPress', () => {
        const state = map({
            user: map({ uid: 0 })
        });

        it('should do nothing if the key is a modifier', () => {
            expect(R.rHandleKeyPress(state, { key: 'Control' })).to.equal(state);
            expect(R.rHandleKeyPress(state, { key: 'Shift' })).to.equal(state);
        });

        describe('if logged in', () => {
            const stateLoggedIn = state.setIn(['user', 'uid'], 1)
                .set('currentPage', 'food')
                .set('edit', map({
                    active: map({
                        row: -1,
                        col: 2,
                        value: null
                    }),
                    add: map({
                        food: list.of(DateTime.fromISO('2018-06-10'), '', '', 0, '')
                    })
                }))
                .set('editSuggestions', map({
                    list: list.of(),
                    active: -1,
                    nextCategory: list.of()
                }))
                .set('pages', map({
                    food: map({
                        data: map({ numRows: 10, numCols: 5 }),
                        rows: map([
                            [1, map({
                                id: 1,
                                cols: list.of(DateTime.fromISO('2018-06-03'), 'foo1', 'bar1', 30, 'baz1')
                            })],
                            [2, map({
                                id: 2,
                                cols: list.of(DateTime.fromISO('2018-06-02'), 'foo2', 'bar2', 30, 'baz2')
                            })],
                            [5, map({
                                id: 5,
                                cols: list.of(DateTime.fromISO('2018-05-28'), 'foo3', 'bar3', 30, 'baz3')
                            })],
                            [6, map({
                                id: 6,
                                cols: list.of(DateTime.fromISO('2018-05-28'), 'foo4', 'bar4', 30, 'baz4')
                            })],
                            [35, map({
                                id: 35,
                                cols: list.of(DateTime.fromISO('2018-05-09'), 'foo5', 'bar5', 30, 'baz5')
                            })],
                            [19, map({
                                id: 19,
                                cols: list.of(DateTime.fromISO('2018-04-19'), 'foo6', 'bar6', 30, 'baz6')
                            })],
                            [7, map({
                                id: 7,
                                cols: list.of(DateTime.fromISO('2018-04-18'), 'foo7', 'bar7', 30, 'baz7')
                            })],
                            [9, map({
                                id: 9,
                                cols: list.of(DateTime.fromISO('2018-04-09'), 'foo8', 'bar8', 30, 'baz8')
                            })],
                            [11, map({
                                id: 11,
                                cols: list.of(DateTime.fromISO('2018-04-05'), 'foo9', 'bar9', 30, 'baz9')
                            })],
                            [61, map({
                                id: 61,
                                cols: list.of(DateTime.fromISO('2018-04-03'), 'foo10', 'bar10', 30, 'baz10')
                            })]
                        ])
                    })
                }));

            describe('if navigating from suggestions', () => {
                const stateFromSuggestions = stateLoggedIn.set('editSuggestions', map({
                    list: list.of('foo', 'bar'),
                    active: 1,
                    nextCategory: list.of()
                }));

                describe('on escape', () => {
                    it('should clear the edit suggestions list', () => {
                        const result = R.rHandleKeyPress(stateFromSuggestions, { key: 'Escape' });

                        expect(result.get('editSuggestions').toJS()).to.deep.equal({
                            list: [],
                            active: -1,
                            nextCategory: []
                        });
                    });
                });
                describe('on enter', () => {
                    describe('if there is no suggestions category prefill', () => {
                        const result = R.rHandleKeyPress(stateFromSuggestions, { key: 'Enter' });

                        it('should set editable value to the suggestion value', () => {
                            expect(result.getIn(['edit', 'add', 'food', 2])).to.equal('bar');
                        });

                        it('should navigate to the next field', () => {
                            expect(result.getIn(['edit', 'active', 'col'])).to.equal(3);
                        });
                    });

                    describe('otherwise', () => {
                        const stateWithPrefill = stateFromSuggestions
                            .setIn(['edit', 'active', 'col'], 1)
                            .setIn(['editSuggestions', 'nextCategory'], list.of('baz', 'bak'));

                        const result = R.rHandleKeyPress(stateWithPrefill, { key: 'Enter' });

                        it('should prefill the category column', () => {
                            expect(result.getIn(['edit', 'add', 'food', 2])).to.equal('bak');
                        });
                    });
                });
            });

            describe('if navigating within suggestions', () => {
                it('should loop through the suggestions', () => {
                    const stateWithSuggestions = stateLoggedIn.set('editSuggestions', map({
                        list: list.of('foo', 'bar'),
                        active: -1
                    }));

                    let nextState = stateWithSuggestions;

                    const navState = prevState => R.rHandleKeyPress(prevState, { key: 'Tab' });

                    nextState = navState(nextState);
                    expect(nextState.getIn(['editSuggestions', 'active'])).to.equal(0);

                    nextState = navState(nextState);
                    expect(nextState.getIn(['editSuggestions', 'active'])).to.equal(1);

                    nextState = navState(nextState);
                    expect(nextState.getIn(['editSuggestions', 'active'])).to.equal(-1);
                });
            });

            describe('if navigating from the active field', () => {
                it('should set the next active field', () => {
                    const result = R.rHandleKeyPress(stateLoggedIn, { key: 'Tab' });

                    expect(result.getIn(['edit', 'active', 'col'])).to.equal(3);
                });
            });

            describe('on escape', () => {
                it('should deactivate and cancel editing', () => {
                    const stateEditing = stateLoggedIn.setIn(['edit', 'active', 'value'], 'wanttocancelthis');

                    const result = R.rHandleKeyPress(stateEditing, { key: 'Escape' });

                    expect(result.getIn(['edit', 'active', 'value'])).to.equal(null);
                });
            });

            describe('on enter', () => {
                it('should not do anything if the add button is selected', () => {
                    const stateWithAddButton = stateLoggedIn.setIn(['edit', 'addBtnFocus'], true);

                    const result = R.rHandleKeyPress(stateWithAddButton, { key: 'Enter' });

                    expect(result).to.equal(stateWithAddButton);
                });
                it('should activate the current edit item', () => {
                    const result = R.rHandleKeyPress(stateLoggedIn, { key: 'Enter' });

                    expect(result.getIn(['edit', 'active', 'col'])).to.equal(-1);
                    expect(result.getIn(['edit', 'active', 'id'])).to.equal(null);
                    expect(result.getIn(['edit', 'active', 'item'])).to.equal(null);
                    expect(result.getIn(['edit', 'active', 'originalValue'])).to.equal(null);
                    expect(result.getIn(['edit', 'active', 'page'])).to.equal('food');

                    expect(result.getIn(['edit', 'add', 'food', 2])).to.equal(null);
                    expect(result.getIn(['edit', 'addBtnFocus'])).to.equal(false);

                    expect(result.getIn(['editSuggestions', 'loading'])).to.equal(false);
                    expect(result.getIn(['editSuggestions', 'reqId'])).to.equal(null);
                });
            });
        });

        describe('if not logged in', () => {
            const stateLoggedOut = state.set('loginForm', map({
                values: list.of('0', '1'),
                inputStep: 2,
                visible: true
            }));

            it('should reset the login form if Escape was pressed', () => {
                expect(R.rHandleKeyPress(stateLoggedOut, { key: 'Escape' }).toJS())
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
                expect(R.rHandleKeyPress(stateLoggedOut, { key: '4' }).toJS())
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

