import test from 'ava';

import { blockData } from '~client-test/test_data/blocks';
import { blockPacker } from '~client/modules/block-packer';

test('creating a block list from block data', t => {
    const data = blockData;

    const result = blockPacker(data, 500, 400);

    t.deepEqual(result, [
        {
            width: '66.278%',
            height: '100%',
            bits: [
                {
                    width: '100%',
                    height: '100%',
                    name: 'foo1',
                    color: 3,
                    value: 1642283,
                    blocks: [
                        {
                            width: '100%',
                            height: '100%',
                            bits: [
                                {
                                    width: '100%',
                                    height: '100%',
                                    name: 'foo1_bar1',
                                    color: 1,
                                    value: 1642283
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            width: '33.722%',
            height: '84.563%',
            bits: [
                {
                    width: '100%',
                    height: '100%',
                    name: 'foo2',
                    color: 4,
                    value: 706605,
                    blocks: [
                        {
                            width: '100%',
                            height: '41.677%',
                            bits: [
                                {
                                    width: '53.258%',
                                    height: '100%',
                                    name: 'foo2_bar1',
                                    color: 3,
                                    value: 156842
                                },
                                {
                                    width: '46.742%',
                                    height: '100%',
                                    name: 'foo2_bar2',
                                    color: 4,
                                    value: 137650
                                }
                            ]
                        },
                        {
                            width: '100%',
                            height: '26.925%',
                            bits: [
                                {
                                    width: '64.181%',
                                    height: '100%',
                                    name: 'foo2_bar3',
                                    color: 5,
                                    value: 122108
                                },
                                {
                                    width: '35.819%',
                                    height: '100%',
                                    name: 'foo2_bar4',
                                    color: 6,
                                    value: 68148
                                }
                            ]
                        },
                        {
                            width: '47.35%',
                            height: '31.398%',
                            bits: [
                                {
                                    width: '100%',
                                    height: '54.595%',
                                    name: 'foo2_bar5',
                                    color: 7,
                                    value: 57351
                                },
                                {
                                    width: '100%',
                                    height: '45.405%',
                                    name: 'foo2_bar6',
                                    color: 8,
                                    value: 47698
                                }
                            ]
                        },
                        {
                            width: '52.65%',
                            height: '21.88%',
                            bits: [
                                {
                                    width: '53.316%',
                                    height: '100%',
                                    name: 'foo2_bar7',
                                    color: 9,
                                    value: 43399
                                },
                                {
                                    width: '46.684%',
                                    height: '100%',
                                    name: 'foo2_bar8',
                                    color: 10,
                                    value: 38000
                                }
                            ]
                        },
                        {
                            width: '52.65%',
                            height: '9.518%',
                            bits: [
                                {
                                    width: '100%',
                                    height: '100%',
                                    name: 'foo3_bar9',
                                    color: 11,
                                    value: 35409
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            width: '20.713%',
            height: '15.437%',
            bits: [
                {
                    width: '100%',
                    height: '100%',
                    name: 'foo3',
                    color: 5,
                    value: 79231,
                    blocks: [
                        {
                            width: '35.265%',
                            height: '100%',
                            bits: [
                                {
                                    width: '100%',
                                    height: '100%',
                                    name: 'foo3_bar1',
                                    color: 3,
                                    value: 27941
                                }
                            ]
                        },
                        {
                            width: '46.44%',
                            height: '100%',
                            bits: [
                                {
                                    width: '100%',
                                    height: '54.983%',
                                    name: 'foo3_bar2',
                                    color: 4,
                                    value: 20231
                                },
                                {
                                    width: '100%',
                                    height: '45.017%',
                                    name: 'foo3_bar3',
                                    color: 5,
                                    value: 16564
                                }
                            ]
                        },
                        {
                            width: '18.295%',
                            height: '100%',
                            bits: [
                                {
                                    width: '100%',
                                    height: '100%',
                                    name: 'foo3_bar4',
                                    color: 6,
                                    value: 14495
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            width: '13.009%',
            height: '15.437%',
            bits: [
                {
                    width: '100%',
                    height: '100%',
                    name: 'foo4',
                    color: 6,
                    value: 49760,
                    blocks: [
                        {
                            width: '80.587%',
                            height: '100%',
                            bits: [
                                {
                                    width: '100%',
                                    height: '100%',
                                    name: 'foo4_bar1',
                                    color: 0,
                                    value: 40100
                                }
                            ]
                        },
                        {
                            width: '19.413%',
                            height: '52.588%',
                            bits: [
                                {
                                    width: '100%',
                                    height: '100%',
                                    name: 'foo4_bar2',
                                    color: 1,
                                    value: 5080
                                }
                            ]
                        },
                        {
                            width: '19.413%',
                            height: '47.412%',
                            bits: [
                                {
                                    width: '100%',
                                    height: '100%',
                                    name: 'foo4_bar3',
                                    color: 2,
                                    value: 4580
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]);
});
