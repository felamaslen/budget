import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/analysis.reducer';

describe('Analysis reducers', () => {
    describe('processPageDataAnalysis', () => {
        it('should work as expected', () => {
            const reduction = fromJS({
                other: {
                    analysis: {
                        treeVisible: {}
                    },
                    blockView: {}
                },
                pages: [null, null]
            });

            const pageIndex = 1;
            const raw = {
                cost: [
                    ['foo', [['foo1', 10], ['foo2', 20]]],
                    ['bar', [['bar1', 30], ['bar2', 40], ['bar3', 50]]]
                ],
                saved: 100,
                description: 'barbaz',
                timeline: [1, 2, 3, 4, 5]
            };

            const result = R.processPageDataAnalysis(reduction, { pageIndex, raw });

            const expectedResult = {
                other: {
                    analysis: {
                        treeVisible: {},
                        timeline: [1, 2, 3, 4, 5]
                    },
                    blockView: {
                        blocks: [
                            {
                                width: '100%',
                                height: '88%',
                                bits: [
                                    {
                                        width: '54.545%',
                                        height: '100%',
                                        name: 'bar',
                                        color: 0,
                                        value: 120,
                                        blocks: [
                                            {
                                                width: '100%',
                                                height: '41.667%',
                                                bits: [
                                                    {
                                                        width: '100%',
                                                        height: '100%',
                                                        name: 'bar3',
                                                        color: 0,
                                                        value: 50
                                                    }
                                                ]
                                            },
                                            {
                                                width: '57.143%',
                                                height: '58.333%',
                                                bits: [
                                                    {
                                                        width: '100%',
                                                        height: '100%',
                                                        name: 'bar2',
                                                        color: 1,
                                                        value: 40
                                                    }
                                                ]
                                            },
                                            {
                                                width: '42.857%',
                                                height: '58.333%',
                                                bits: [
                                                    {
                                                        width: '100%',
                                                        height: '100%',
                                                        name: 'bar1',
                                                        color: 2,
                                                        value: 30
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        width: '45.455%',
                                        height: '100%',
                                        name: 'saved',
                                        color: 1,
                                        value: 100,
                                        blocks: [
                                            {
                                                width: '100%',
                                                height: '100%',
                                                bits: [
                                                    {
                                                        width: '100%',
                                                        height: '100%',
                                                        name: 'Saved',
                                                        color: 0,
                                                        value: 100
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                width: '100%',
                                height: '12%',
                                bits: [
                                    {
                                        width: '100%',
                                        height: '100%',
                                        name: 'foo',
                                        color: 2,
                                        value: 30,
                                        blocks: [
                                            {
                                                width: '66.667%',
                                                height: '100%',
                                                bits: [
                                                    {
                                                        width: '100%',
                                                        height: '100%',
                                                        name: 'foo2',
                                                        color: 0,
                                                        value: 20
                                                    }
                                                ]
                                            },
                                            {
                                                width: '33.333%',
                                                height: '100%',
                                                bits: [
                                                    {
                                                        width: '100%',
                                                        height: '100%',
                                                        name: 'foo1',
                                                        color: 1,
                                                        value: 10
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        deep: null
                    }
                },
                pages: [
                    null,
                    {
                        cost: [
                            {
                                name: 'bar',
                                total: 120,
                                subTree: [
                                    { name: 'bar3', total: 50 },
                                    { name: 'bar2', total: 40 },
                                    { name: 'bar1', total: 30 }
                                ]
                            },
                            {
                                name: 'saved',
                                total: 100,
                                subTree: [
                                    { name: 'Saved', total: 100 }
                                ]
                            },
                            {
                                name: 'foo',
                                total: 30,
                                subTree: [
                                    { name: 'foo2', total: 20 },
                                    { name: 'foo1', total: 10 }
                                ]
                            }
                        ],
                        costTotal: 250,
                        items: {},
                        description: 'barbaz'
                    }
                ]
            };

            expect(result.toJS()).to.deep.equal(expectedResult);
        });
    });

    describe('rAnalysisChangeOption', () => {
        it('should set analysis options and set to loading', () => {
            const reduction = fromJS({
                other: {
                    analysis: {}
                }
            });

            const period = 'foo';
            const grouping = 'bar';
            const timeIndex = 'baz';

            const result = R.rAnalysisChangeOption(reduction, { period, grouping, timeIndex });

            const expectedResult = fromJS({
                other: {
                    analysis: {
                        loading: true,
                        period: 'foo',
                        grouping: 'bar',
                        timeIndex: 'baz'
                    }
                }
            });

            expect(result.equals(expectedResult)).to.equal(true);
        });
    });

    describe('rAnalysisHandleNewData', () => {
        it('should insert data into the state', () => {
            const reduction = fromJS({
                other: {
                    analysis: {},
                    blockView: {}
                }
            });

            const pageIndex = 1;
            const response = {
                data: {
                    data: {
                        items: []
                    }
                }
            };

            const name = 'deepblock1';

            const result = R.rAnalysisHandleNewData(reduction, { pageIndex, response, name });

            const expectedResult = {
                other: {
                    analysis: {
                        loading: false
                    },
                    blockView: {
                        blocks: [],
                        deep: 'deepblock1',
                        loadKey: null,
                        status: ''
                    }
                }
            };

            expect(result.toJS()).to.deep.equal(expectedResult);
        });
    });

    describe('rAnalysisTreeToggleDisplay', () => {
        it('should toggle the analysis tree display', () => {
            const reduction = fromJS({
                other: {
                    analysis: {
                        treeVisible: {}
                    }
                },
                pages: [
                    null,
                    {
                        cost: []
                    }
                ]
            });

            const key = 'food';

            const result = R.rAnalysisTreeToggleDisplay(reduction, { key });

            const expectedResult = {
                other: {
                    analysis: {
                        treeVisible: {
                            food: false
                        }
                    },
                    blockView: {
                        blocks: [],
                        active: null
                    }
                },
                pages: [
                    null,
                    {
                        cost: []
                    }
                ]
            };

            expect(result.toJS()).to.deep.equal(expectedResult);
        });
    });

    describe('rAnalysisTreeToggleExpand', () => {
        it('should toggle the expanded status for the given tree item', () => {
            const reduction = fromJS({
                other: {
                    analysis: {
                        treeOpen: {}
                    }
                }
            });

            const key = 'food';

            const result = R.rAnalysisTreeToggleExpand(reduction, { key });

            const expectedResult = {
                other: {
                    analysis: {
                        treeOpen: {
                            food: true
                        }
                    }
                }
            };

            expect(result.toJS()).to.deep.equal(expectedResult);
        });
    });

    describe('rAnalysisTreeHover', () => {
        it('should set the active block to the given key', () => {
            const reduction = fromJS({
                other: {
                    blockView: {
                        active: null
                    }
                }
            });

            const result = R.rAnalysisTreeHover(reduction, { key: 'food' });

            const expectedResult = {
                other: {
                    blockView: {
                        active: 'food'
                    }
                }
            };

            expect(result.toJS()).to.deep.equal(expectedResult);
        });
    });

    describe('rAnalysisBlockClick', () => {
        it('should skip bills', () => {
            const state = {
                foo: 'bar'
            };

            expect(R.rAnalysisBlockClick(fromJS(state), { name: 'bills' }).toJS())
                .to.deep.equal(state);
        });

        it('should set the block to loading, if it wasn\'t deeply loaded', () => {
            const state = fromJS({
                other: {
                    analysis: {
                        loading: false
                    },
                    blockView: {
                        deep: null
                    }
                }
            });

            const result = R.rAnalysisBlockClick(state, { name: 'food' });

            expect(result.equals(state.setIn(['other', 'analysis', 'loading'], true))).to.equal(true);
        });

        it('should reset the view, if going back to shallow view', () => {
            const state = {
                other: {
                    analysis: {
                        treeVisible: false
                    },
                    blockView: {
                        deep: 'foo'
                    }
                },
                pages: [
                    {
                        cost: []
                    }
                ]
            };

            const result = R.rAnalysisBlockClick(fromJS(state), { name: 'food', pageIndex: 0 });

            expect(result.toJS()).to.deep.equal({
                other: {
                    analysis: {
                        treeVisible: false
                    },
                    blockView: {
                        blocks: [],
                        deep: null,
                        status: ''
                    }
                },
                pages: [
                    {
                        cost: []
                    }
                ]
            });
        });
    });
});

