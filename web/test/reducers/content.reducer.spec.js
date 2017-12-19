import { expect } from 'chai';
import { fromJS } from 'immutable';
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
            expect(R.rRequestContent(fromJS({}), { loading: false }).get('loading'))
                .to.equal(false);
        });

        it('should set the current page index', () => {
            expect(R.rRequestContent(fromJS({}), { pageIndex: 4 }).get('currentPageIndex'))
                .to.equal(4);
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
            const state = fromJS({
                loading: true,
                pagesLoaded: [null, null, null],
                pagesRaw: [null, null, null],
                pages: [null, null, null],
                edit: {
                    active: null,
                    add: [null, null, null]
                },
                other: {
                    graphFunds: {
                        zoom: [null, null],
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

            const now = new Date('2017-11-10 09:34');

            const result = R.rHandleContentResponse(state, { response, pageIndex: 2 }, now);

            expect(result.toJS()).to.deep.equal({
                loading: false,
                pages: [
                    null,
                    null,
                    {
                        cacheTimes: [191239],
                        data: { numCols: 4, numRows: 0, total: 0 },
                        rows: {},
                        startTime: 1508533928
                    }
                ],
                pagesLoaded: [null, null, true],
                pagesRaw: [
                    null,
                    null,
                    {
                        cacheTimes: [191239],
                        data: [],
                        startTime: 1508533928,
                        total: 0
                    }
                ],
                other: {
                    graphFunds: {
                        cacheTimes: [191239],
                        period: 'fooperiod',
                        data: {
                            fundItems: [
                                {
                                    color: [0, 0, 0],
                                    enabled: true,
                                    item: 'Overall'
                                }
                            ],
                            fundLinesAll: [],
                            fundLines: []
                        },
                        range: [0, 1772512],
                        startTime: 1508533928,
                        zoom: [0, 1772512]
                    },
                    fundHistoryCache: {
                        fooperiod: {
                            cacheTimes: [191239],
                            rows: {},
                            startTime: 1508533928
                        }
                    },
                    fundsCachedValue: {
                        ageText: '18 days, 7 hours ago',
                        value: 0
                    }
                },
                edit: {
                    active: {
                        row: -1,
                        col: -1,
                        id: null,
                        item: null,
                        originalValue: null,
                        pageIndex: 2,
                        value: null
                    },
                    add: [
                        null,
                        null,
                        [
                            { year: 2017, month: 10, date: 14, valid: true },
                            '',
                            {
                                idCount: 0,
                                list: fromJS([]),
                                size: 0
                            },
                            0
                        ]
                    ]
                }
            });
        });
    });
});

