import test from 'ava';
import { fromJS } from 'immutable';
import {
    processPageDataAnalysis,
    rAnalysisChangeOption,
    rAnalysisHandleNewData,
    rAnalysisTreeToggleDisplay,
    rAnalysisTreeToggleExpand,
    rAnalysisTreeHover,
    rAnalysisBlockClick
} from '~client/reducers/analysis.reducer';

test('processPageDataAnalysis working as expected', t => {
    const reduction = fromJS({
        other: {
            analysis: {
                treeVisible: {}
            },
            blockView: {}
        },
        pages: {}
    });

    const raw = {
        cost: [
            ['foo', [['foo1', 10], ['foo2', 20]]],
            ['bar', [['bar1', 30], ['bar2', 40], ['bar3', 50]]]
        ],
        saved: 100,
        description: 'barbaz',
        timeline: [1, 2, 3, 4, 5]
    };

    const result = processPageDataAnalysis(reduction, { raw });

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
        pages: {
            analysis: {
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
        }
    };

    t.deepEqual(result.toJS(), expectedResult);
});

test('rAnalysisChangeOption seting analysis options and set to loading', t => {
    const reduction = fromJS({
        other: {
            analysis: {}
        }
    });

    const period = 'foo';
    const grouping = 'bar';
    const timeIndex = 'baz';

    const result = rAnalysisChangeOption(reduction, { period, grouping, timeIndex });

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

    t.true(result.equals(expectedResult));
});

test('rAnalysisHandleNewData inserting data into the state', t => {
    const reduction = fromJS({
        other: {
            analysis: {},
            blockView: {}
        }
    });

    const response = {
        data: {
            data: {
                items: []
            }
        }
    };

    const name = 'deepblock1';

    const result = rAnalysisHandleNewData(reduction, { response, name });

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

    t.deepEqual(result.toJS(), expectedResult);
});

test('rAnalysisTreeToggleDisplay toggleing the analysis tree display', t => {
    const reduction = fromJS({
        other: {
            analysis: {
                treeVisible: {}
            }
        },
        pages: {
            analysis: { cost: [] }
        }
    });

    const key = 'food';

    const result = rAnalysisTreeToggleDisplay(reduction, { key });

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
        pages: {
            analysis: { cost: [] }
        }
    };

    t.deepEqual(result.toJS(), expectedResult);
});

test('rAnalysisTreeToggleExpand toggleing the expanded status for the given tree item', t => {
    const reduction = fromJS({
        other: {
            analysis: {
                treeOpen: {}
            }
        }
    });

    const key = 'food';

    const result = rAnalysisTreeToggleExpand(reduction, { key });

    const expectedResult = {
        other: {
            analysis: {
                treeOpen: {
                    food: true
                }
            }
        }
    };

    t.deepEqual(result.toJS(), expectedResult);
});

test('rAnalysisTreeHover seting the active block to the given key', t => {
    const reduction = fromJS({
        other: {
            blockView: {
                active: null
            }
        }
    });

    const result = rAnalysisTreeHover(reduction, { key: 'food' });

    const expectedResult = {
        other: {
            blockView: {
                active: 'food'
            }
        }
    };

    t.deepEqual(result.toJS(), expectedResult);
});

test('rAnalysisBlockClick skipping bills', t => {
    const state = {
        foo: 'bar'
    };

    t.deepEqual(rAnalysisBlockClick(fromJS(state), { name: 'bills' }).toJS(), state);
});

test('rAnalysisBlockClick seting the block to loading, if it wasn\'t deeply loaded', t => {
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

    const result = rAnalysisBlockClick(state, { name: 'food' });

    t.true(result.equals(state.setIn(['other', 'analysis', 'loading'], true)));
});

test('rAnalysisBlockClick reseting the view, if going back to shallow view', t => {
    const state = {
        other: {
            analysis: {
                treeVisible: false
            },
            blockView: {
                deep: 'foo'
            }
        },
        pages: {
            analysis: { cost: [] }
        }
    };

    const result = rAnalysisBlockClick(fromJS(state), { name: 'food' });

    t.deepEqual(result.toJS(), {
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
        pages: {
            analysis: { cost: [] }
        }
    });
});

