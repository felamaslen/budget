import permutation from 'array-permutation';

import { blockPacker } from './block-packer';

describe('Flex block packer', () => {
  it('should fit a sorted list of totals into a rectangle', () => {
    expect.assertions(1);

    const width = 10;
    const height = 6;

    // total area is 60

    type Item = {
      something: string;
      total: number;
    };

    const totals: Item[] = [
      {
        something: 'foo',
        total: 12,
      },
      {
        something: 'bar',
        total: 3,
      },
      {
        something: 'baz',
        total: 15,
      },
    ];

    expect(blockPacker<Item>(width, height, totals)).toMatchInlineSnapshot(`
      Object {
        "box": Object {
          "flex": 1,
          "flow": "row",
        },
        "childIndex": 0,
        "children": Object {
          "box": Object {
            "flex": 0.5,
            "flow": "column",
          },
          "childIndex": 1,
          "children": Object {
            "box": Object {
              "flex": 0.2,
              "flow": "row",
            },
            "childIndex": 2,
            "items": Object {
              "blocks": Array [
                Object {
                  "area": 6,
                  "childCount": 2,
                  "flex": 1,
                  "something": "bar",
                  "subTree": undefined,
                  "total": 3,
                },
              ],
              "box": Object {
                "flex": 0.9999999999999999,
                "flow": "row",
              },
            },
          },
          "items": Object {
            "blocks": Array [
              Object {
                "area": 24,
                "childCount": 1,
                "flex": 1,
                "something": "foo",
                "subTree": undefined,
                "total": 12,
              },
            ],
            "box": Object {
              "flex": 0.8,
              "flow": "row",
            },
          },
        },
        "items": Object {
          "blocks": Array [
            Object {
              "area": 30,
              "childCount": 0,
              "flex": 1,
              "something": "baz",
              "subTree": undefined,
              "total": 15,
            },
          ],
          "box": Object {
            "flex": 0.5,
            "flow": "column",
          },
        },
      }
    `);
  });

  it('should add trees within blocks', () => {
    expect.assertions(1);

    const width = 10;
    const height = 6;

    const totals = [
      {
        name: 'parent block 1',
        total: 24,
        subTree: [
          {
            name: 'child block A',
            total: 8,
          },
          {
            name: 'child block B',
            total: 14,
          },
          {
            name: 'child block C',
            total: 2,
          },
        ],
      },
      {
        name: 'parent block 2',
        total: 36,
      },
    ];

    expect(blockPacker(width, height, totals)).toMatchInlineSnapshot(`
      Object {
        "box": Object {
          "flex": 1,
          "flow": "row",
        },
        "childIndex": 0,
        "children": Object {
          "box": Object {
            "flex": 0.4,
            "flow": "column",
          },
          "childIndex": 1,
          "items": Object {
            "blocks": Array [
              Object {
                "area": 24,
                "childCount": 1,
                "flex": 1,
                "name": "parent block 1",
                "subTree": Object {
                  "box": Object {
                    "flex": 1,
                    "flow": "column",
                  },
                  "childIndex": 0,
                  "children": Object {
                    "box": Object {
                      "flex": 0.4167,
                      "flow": "row",
                    },
                    "childIndex": 1,
                    "children": Object {
                      "box": Object {
                        "flex": 0.2,
                        "flow": "column",
                      },
                      "childIndex": 2,
                      "items": Object {
                        "blocks": Array [
                          Object {
                            "area": 2,
                            "childCount": 2,
                            "flex": 1,
                            "name": "child block C",
                            "subTree": undefined,
                            "total": 2,
                          },
                        ],
                        "box": Object {
                          "flex": 1.0000000000000002,
                          "flow": "column",
                        },
                      },
                    },
                    "items": Object {
                      "blocks": Array [
                        Object {
                          "area": 8,
                          "childCount": 1,
                          "flex": 1,
                          "name": "child block A",
                          "subTree": undefined,
                          "total": 8,
                        },
                      ],
                      "box": Object {
                        "flex": 0.8,
                        "flow": "row",
                      },
                    },
                  },
                  "items": Object {
                    "blocks": Array [
                      Object {
                        "area": 14,
                        "childCount": 0,
                        "flex": 1,
                        "name": "child block B",
                        "subTree": undefined,
                        "total": 14,
                      },
                    ],
                    "box": Object {
                      "flex": 0.5833333333333334,
                      "flow": "row",
                    },
                  },
                },
                "total": 24,
              },
            ],
            "box": Object {
              "flex": 1,
              "flow": "column",
            },
          },
        },
        "items": Object {
          "blocks": Array [
            Object {
              "area": 36,
              "childCount": 0,
              "flex": 1,
              "name": "parent block 2",
              "subTree": undefined,
              "total": 36,
            },
          ],
          "box": Object {
            "flex": 0.6,
            "flow": "column",
          },
        },
      }
    `);
  });

  it('should filter out items with zero or negative total', () => {
    expect.assertions(1);

    const width = 500;
    const height = 300;
    const items = [
      {
        name: 'S',
        total: 6083239.103549999,
        color: 'transparent',
        subTree: [
          {
            name: 'ATT',
            total: 208530,
            color: '#008299',
          },
          { name: 'APL', total: 0, color: '#870099' },
          {
            name: 'CTY',
            total: 759040,
            color: '#009975',
          },
          {
            name: 'FCSS',
            total: 858532.5,
            color: '#993b00',
          },
          {
            name: 'FGT',
            total: 541144,
            color: '#00994d',
          },
          { name: 'HLMM', total: 0, color: '#993000' },
          { name: 'HLSU', total: 0, color: '#990008' },
          { name: 'JAI', total: 98396.1598, color: '#780099' },
          { name: 'JEU', total: -203, color: '#99002e' },
          { name: 'LFL', total: 0, color: '#009994' },
          {
            name: 'LGI',
            total: 743959.4988,
            color: '#009',
          },
          {
            name: 'MGLJ',
            total: 73003.7135,
            color: '#99003b',
          },
          { name: 'MNU', total: 0, color: '#993d00' },
          {
            name: 'MSCB',
            total: 0,
            color: '#00995c',
          },
          {
            name: 'PCT',
            total: 209990,
            color: '#039900',
          },
          { name: 'STY', total: 0, color: '#004299' },
          {
            name: 'SMT',
            total: 2402628,
            color: '#1f0099',
          },
          {
            name: 'THR',
            total: 188015.23145,
            color: '#6e0099',
          },
        ],
      },
      { name: 'C', total: 2008073.8964500008, color: 'grey' },
    ];

    const result = blockPacker(width, height, items);
    expect(result).toMatchInlineSnapshot(`
      Object {
        "box": Object {
          "flex": 1,
          "flow": "row",
        },
        "childIndex": 0,
        "children": Object {
          "box": Object {
            "flex": 0.2482,
            "flow": "column",
          },
          "childIndex": 1,
          "items": Object {
            "blocks": Array [
              Object {
                "area": 37226.47788653092,
                "childCount": 1,
                "color": "grey",
                "flex": 1,
                "name": "C",
                "subTree": undefined,
                "total": 2008073.8964500008,
              },
            ],
            "box": Object {
              "flex": 1,
              "flow": "column",
            },
          },
        },
        "items": Object {
          "blocks": Array [
            Object {
              "area": 112773.52211346908,
              "childCount": 0,
              "color": "transparent",
              "flex": 1,
              "name": "S",
              "subTree": Object {
                "box": Object {
                  "flex": 1,
                  "flow": "row",
                },
                "childIndex": 0,
                "children": Object {
                  "box": Object {
                    "flex": 0.605,
                    "flow": "column",
                  },
                  "childIndex": 1,
                  "children": Object {
                    "box": Object {
                      "flex": 0.5605,
                      "flow": "row",
                    },
                    "childIndex": 2,
                    "children": Object {
                      "box": Object {
                        "flex": 0.3771,
                        "flow": "column",
                      },
                      "childIndex": 3,
                      "children": Object {
                        "box": Object {
                          "flex": 0.7301,
                          "flow": "column",
                        },
                        "childIndex": 4,
                        "children": Object {
                          "box": Object {
                            "flex": 0.6328,
                            "flow": "row",
                          },
                          "childIndex": 5,
                          "children": Object {
                            "box": Object {
                              "flex": 0.4769,
                              "flow": "column",
                            },
                            "childIndex": 6,
                            "children": Object {
                              "box": Object {
                                "flex": 0.4259,
                                "flow": "row",
                              },
                              "childIndex": 7,
                              "items": Object {
                                "blocks": Array [
                                  Object {
                                    "area": 1353.3720701448578,
                                    "childCount": 9,
                                    "color": "#99003b",
                                    "flex": 1,
                                    "name": "MGLJ",
                                    "subTree": undefined,
                                    "total": 73003.7135,
                                  },
                                ],
                                "box": Object {
                                  "flex": 1.000000000000012,
                                  "flow": "row",
                                },
                              },
                            },
                            "items": Object {
                              "blocks": Array [
                                Object {
                                  "area": 1824.107406301054,
                                  "childCount": 8,
                                  "color": "#780099",
                                  "flex": 1,
                                  "name": "JAI",
                                  "subTree": undefined,
                                  "total": 98396.1598,
                                },
                              ],
                              "box": Object {
                                "flex": 0.5740737020719869,
                                "flow": "column",
                              },
                            },
                          },
                          "items": Object {
                            "blocks": Array [
                              Object {
                                "area": 3485.501638300236,
                                "childCount": 7,
                                "color": "#6e0099",
                                "flex": 1,
                                "name": "THR",
                                "subTree": undefined,
                                "total": 188015.23145,
                              },
                            ],
                            "box": Object {
                              "flex": 0.5231144405596951,
                              "flow": "column",
                            },
                          },
                        },
                        "items": Object {
                          "blocks": Array [
                            Object {
                              "area": 3865.8126313986368,
                              "childCount": 6,
                              "color": "#008299",
                              "flex": 1,
                              "name": "ATT",
                              "subTree": undefined,
                              "total": 208530,
                            },
                          ],
                          "box": Object {
                            "flex": 0.3671657670010057,
                            "flow": "row",
                          },
                        },
                      },
                      "items": Object {
                        "blocks": Array [
                          Object {
                            "area": 3892.8786959545378,
                            "childCount": 5,
                            "color": "#039900",
                            "flex": 1,
                            "name": "PCT",
                            "subTree": undefined,
                            "total": 209990,
                          },
                        ],
                        "box": Object {
                          "flex": 0.2699325415678257,
                          "flow": "row",
                        },
                      },
                    },
                    "items": Object {
                      "blocks": Array [
                        Object {
                          "area": 13791.819055819493,
                          "childCount": 3,
                          "color": "#009",
                          "flex": 0.5789101807711925,
                          "name": "LGI",
                          "subTree": undefined,
                          "total": 743959.4988,
                        },
                        Object {
                          "area": 10031.944135642756,
                          "childCount": 4,
                          "color": "#00994d",
                          "flex": 0.4210898192288074,
                          "name": "FGT",
                          "subTree": undefined,
                          "total": 541144,
                        },
                      ],
                      "box": Object {
                        "flex": 0.6229178148138588,
                        "flow": "column",
                      },
                    },
                  },
                  "items": Object {
                    "blocks": Array [
                      Object {
                        "area": 15915.819224889705,
                        "childCount": 1,
                        "color": "#993b00",
                        "flex": 0.530753644736171,
                        "name": "FCSS",
                        "subTree": undefined,
                        "total": 858532.5,
                      },
                      Object {
                        "area": 14071.387425007535,
                        "childCount": 2,
                        "color": "#009975",
                        "flex": 0.46924635526382896,
                        "name": "CTY",
                        "subTree": undefined,
                        "total": 759040,
                      },
                    ],
                    "box": Object {
                      "flex": 0.43948476339698855,
                      "flow": "row",
                    },
                  },
                },
                "items": Object {
                  "blocks": Array [
                    Object {
                      "area": 44540.879830010286,
                      "childCount": 0,
                      "color": "#1f0099",
                      "flex": 1,
                      "name": "SMT",
                      "subTree": undefined,
                      "total": 2402628,
                    },
                  ],
                  "box": Object {
                    "flex": 0.39495866578676764,
                    "flow": "column",
                  },
                },
              },
              "total": 6083239.103549999,
            },
          ],
          "box": Object {
            "flex": 0.7518234807564605,
            "flow": "row",
          },
        },
      }
    `);
  });

  it('should sort blocks by size', () => {
    expect.assertions(24);
    const data = [
      {
        item: 'A',
        total: 100,
      },
      {
        item: 'B',
        total: 40,
      },
      {
        item: 'C',
        total: 28,
      },
      {
        item: 'D',
        total: 1,
      },
    ];

    const width = 40;
    const height = 60;

    const result = blockPacker(width, height, data);

    const permutations = permutation(data);
    let perm = permutations.next();

    while (!perm.done) {
      expect(blockPacker(width, height, perm.value)).toStrictEqual(result);

      perm = permutations.next();
    }
  });
});
