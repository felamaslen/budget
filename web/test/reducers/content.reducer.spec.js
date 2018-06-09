import { expect } from 'chai';
import { fromJS } from 'immutable';
import { DateTime } from 'luxon';
import * as R from '../../src/reducers/content.reducer';

describe('Content reducer', () => {
    describe('rContentBlockHover', () => {
        it('should set the status to blank if not passing a block', () => {
            expect(R.rContentBlockHover(fromJS({
                other: {
                    blockView: {
                        status: 'foo'
                    }
                }
            }), {}).toJS())
                .to.deep.equal({
                    other: {
                        blockView: {
                            status: ''
                        }
                    }
                });
        });

        it('should set the block status for normal blocks', () => {
            const state = fromJS({
                other: {
                    blockView: {}
                }
            });

            const result = R.rContentBlockHover(state, {
                block: fromJS({ name: 'foo', value: 503 })
            });

            expect(result.toJS()).to.deep.equal({
                other: {
                    blockView: {
                        status: 'Foo (£5.03)'
                    }
                }
            });
        });

        it('should set the block status for sub blocks', () => {
            const state = fromJS({
                other: {
                    blockView: {}
                }
            });

            const result = R.rContentBlockHover(state, {
                block: fromJS({ name: 'foo' }),
                subBlock: fromJS({ name: 'bar', value: 9231 })
            });

            expect(result.toJS()).to.deep.equal({
                other: {
                    blockView: {
                        status: 'Foo: bar (£92.31)'
                    }
                }
            });
        });
    });

    describe('rRequestContent', () => {
        it('should set the loading status', () => {
            expect(R.rRequestContent(fromJS({}), { loading: true }).get('loading'))
                .to.equal(true);
        });

        it('should set the current page index', () => {
            expect(R.rRequestContent(fromJS({}), { page: 'page1' }).get('currentPage'))
                .to.equal('page1');
        });
    });

    describe('rHandleContentResponse', () => {
        it('should unset loading and do nothing else, if there was no response', () => {
            expect(R.rHandleContentResponse(fromJS({ loading: true }), {}).toJS())
                .to.deep.equal({
                    loading: false
                });
        });

        it('set expected parameters in the state', () => {
            const now = DateTime.fromJSDate(new Date('2017-11-10 09:34'));

            const state = fromJS({
                now,
                loading: true,
                pagesLoaded: {},
                pages: {},
                edit: {
                    active: null,
                    add: {}
                },
                other: {
                    graphFunds: {
                        zoomRange: [null, null],
                        period: 'fooperiod'
                    }
                }
            });

            const response = {
                data: {
                    data: {
                        total: 0,
                        data: [],
                        startTime: 1508533928,
                        cacheTimes: [191239]
                    }
                }
            };

            const result = R.rHandleContentResponse(state, { response, page: 'funds' }, now);

            expect(result.toJS())
                .to.deep.equal({
                    now,
                    loading: false,
                    pages: {
                        funds: {
                            cache: {
                                fooperiod: {
                                    cacheTimes: [191239],
                                    startTime: 1508533928,
                                    prices: {}
                                }
                            },
                            data: { numCols: 2, numRows: 0, total: 0 },
                            rows: {}
                        }
                    },
                    pagesLoaded: { funds: true },
                    other: {
                        graphFunds: {
                            enabledList: {
                                overall: true
                            },
                            period: 'fooperiod',
                            zoomRange: [0, 1772512]
                        }
                    },
                    edit: {
                        active: {
                            row: -1,
                            col: -1,
                            id: null,
                            item: null,
                            originalValue: null,
                            page: 'funds',
                            value: null
                        },
                        add: {
                            funds: [
                                '',
                                {
                                    idCount: 0,
                                    list: fromJS([]),
                                    size: 0
                                }
                            ]
                        }
                    }
                });
        });
    });

    describe('rSetPage', () => {
        it('should set the current page', () => {
            expect(R.rSetPage(fromJS({ currentPage: null }), { page: 'food' }).toJS())
                .to.deep.equal({ currentPage: 'food' });
        });
    });
});

