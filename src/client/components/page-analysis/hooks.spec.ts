import { getForest, getBlocks, getDeepBlocks, getDeepForest, State } from './hooks';

import { ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT } from '~client/constants/analysis';
import { blockPacker } from '~client/modules/block-packer';
import { colors } from '~client/styled/variables';
import type { BlockItem } from '~client/types';
import { AnalysisPage, PageListStandard } from '~client/types/enum';
import type { CategoryCostTreeDeep } from '~client/types/gql';

describe('Analysis hooks', () => {
  const state: State = {
    description: 'Some description',
    cost: [
      {
        item: AnalysisPage.Food,
        tree: [
          { category: 'foo2_bar2', sum: 137650 },
          { category: 'foo2_bar1', sum: 156842 },
        ],
      },
      {
        item: AnalysisPage.General,
        tree: [{ category: 'foo1_bar1', sum: 1642283 }],
      },
    ],
    saved: 67123,
    timeline: [[1, 2, 3]],
  };

  describe(getForest.name, () => {
    it('should return the cost data, ordered and mapped into subtrees', () => {
      expect.assertions(1);
      const expectedResult = [
        {
          name: PageListStandard.General,
          color: colors[PageListStandard.General].main,
          subTree: [{ name: 'foo1_bar1', total: 1642283 }],
          total: 1642283,
        },
        {
          name: PageListStandard.Food,
          color: colors[PageListStandard.Food].main,
          subTree: [
            { name: 'foo2_bar1', total: 156842 },
            { name: 'foo2_bar2', total: 137650 },
          ],
          total: 156842 + 137650,
        },
        {
          name: 'saved',
          color: colors.blockColor.saved,
          total: state.saved,
        },
      ];

      const result = getForest(state.cost, state.saved);

      expect(result).toStrictEqual(expectedResult);
    });

    describe('when the cost is empty', () => {
      it('should not throw an error', () => {
        expect.assertions(1);
        expect(() => getForest([], 0)).not.toThrow();
      });
    });
  });

  describe(getBlocks.name, () => {
    const forest = getForest(state.cost, state.saved);

    it('should get a block-packed map of the state', () => {
      expect.assertions(1);
      const result = getBlocks(forest, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT);

      expect(result).toMatchInlineSnapshot(`
        Object {
          "box": Object {
            "flex": 1,
            "flow": "column",
          },
          "childIndex": 0,
          "children": Object {
            "box": Object {
              "flex": 0.1804557916620506,
              "flow": "row",
            },
            "childIndex": 1,
            "children": Object {
              "box": Object {
                "flex": 0.18562006553931645,
                "flow": "row",
              },
              "childIndex": 2,
              "items": Object {
                "blocks": Array [
                  Object {
                    "area": 8374.05396881478,
                    "childCount": 2,
                    "color": "#113822",
                    "flex": 1,
                    "hasBreakdown": false,
                    "name": "saved",
                    "subTree": undefined,
                    "total": 67123,
                  },
                ],
                "box": Object {
                  "flex": 1.0000000000000016,
                  "flow": "row",
                },
              },
            },
            "items": Object {
              "blocks": Array [
                Object {
                  "area": 36739.893946697885,
                  "childCount": 1,
                  "color": "#43a047",
                  "flex": 1,
                  "hasBreakdown": true,
                  "name": "food",
                  "subTree": Object {
                    "box": Object {
                      "flex": 1,
                      "flow": "row",
                    },
                    "childIndex": 0,
                    "children": Object {
                      "box": Object {
                        "flex": 0.46741507409369354,
                        "flow": "row",
                      },
                      "childIndex": 1,
                      "items": Object {
                        "blocks": Array [
                          Object {
                            "area": 17172.780251290234,
                            "childCount": 1,
                            "flex": 1,
                            "name": "foo2_bar2",
                            "subTree": undefined,
                            "total": 137650,
                          },
                        ],
                        "box": Object {
                          "flex": 1.0000000000000002,
                          "flow": "row",
                        },
                      },
                    },
                    "items": Object {
                      "blocks": Array [
                        Object {
                          "area": 19567.11369540765,
                          "childCount": 0,
                          "flex": 1,
                          "name": "foo2_bar1",
                          "subTree": undefined,
                          "total": 156842,
                        },
                      ],
                      "box": Object {
                        "flex": 0.5325849259063065,
                        "flow": "row",
                      },
                    },
                  },
                  "total": 294492,
                },
              ],
              "box": Object {
                "flex": 0.8143799344606835,
                "flow": "row",
              },
            },
          },
          "items": Object {
            "blocks": Array [
              Object {
                "area": 204886.05208448734,
                "childCount": 0,
                "color": "#01579b",
                "flex": 1,
                "hasBreakdown": true,
                "name": "general",
                "subTree": Object {
                  "box": Object {
                    "flex": 1,
                    "flow": "row",
                  },
                  "childIndex": 0,
                  "items": Object {
                    "blocks": Array [
                      Object {
                        "area": 204886.05208448734,
                        "childCount": 0,
                        "flex": 1,
                        "name": "foo1_bar1",
                        "subTree": undefined,
                        "total": 1642283,
                      },
                    ],
                    "box": Object {
                      "flex": 1,
                      "flow": "row",
                    },
                  },
                },
                "total": 1642283,
              },
            ],
            "box": Object {
              "flex": 0.8195442083379494,
              "flow": "row",
            },
          },
        }
      `);
    });

    it('should exclude blocks which are not in the visible tree', () => {
      expect.assertions(1);
      const result = getBlocks(forest, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT, {
        [PageListStandard.Food]: false,
      });

      expect(result).toMatchInlineSnapshot(`
        Object {
          "box": Object {
            "flex": 1,
            "flow": "column",
          },
          "childIndex": 0,
          "children": Object {
            "box": Object {
              "flex": 0.039266856440190394,
              "flow": "row",
            },
            "childIndex": 1,
            "items": Object {
              "blocks": Array [
                Object {
                  "area": 9816.714110047584,
                  "childCount": 1,
                  "color": "#113822",
                  "flex": 1,
                  "hasBreakdown": false,
                  "name": "saved",
                  "subTree": undefined,
                  "total": 67123,
                },
              ],
              "box": Object {
                "flex": 0.9999999999999986,
                "flow": "row",
              },
            },
          },
          "items": Object {
            "blocks": Array [
              Object {
                "area": 240183.2858899524,
                "childCount": 0,
                "color": "#01579b",
                "flex": 1,
                "hasBreakdown": true,
                "name": "general",
                "subTree": Object {
                  "box": Object {
                    "flex": 1,
                    "flow": "row",
                  },
                  "childIndex": 0,
                  "items": Object {
                    "blocks": Array [
                      Object {
                        "area": 240183.2858899524,
                        "childCount": 0,
                        "flex": 1,
                        "name": "foo1_bar1",
                        "subTree": undefined,
                        "total": 1642283,
                      },
                    ],
                    "box": Object {
                      "flex": 1,
                      "flow": "row",
                    },
                  },
                },
                "total": 1642283,
              },
            ],
            "box": Object {
              "flex": 0.9607331435598097,
              "flow": "row",
            },
          },
        }
      `);
    });

    it('should take custom dimensions', () => {
      expect.assertions(1);
      const result = getBlocks(forest, 3, 4, {
        [PageListStandard.Food]: false,
      });

      expect(result).toMatchInlineSnapshot(`
        Object {
          "box": Object {
            "flex": 1,
            "flow": "column",
          },
          "childIndex": 0,
          "children": Object {
            "box": Object {
              "flex": 0.039266856440190345,
              "flow": "row",
            },
            "childIndex": 1,
            "items": Object {
              "blocks": Array [
                Object {
                  "area": 0.47120227728228403,
                  "childCount": 1,
                  "color": "#113822",
                  "flex": 1,
                  "hasBreakdown": false,
                  "name": "saved",
                  "subTree": undefined,
                  "total": 67123,
                },
              ],
              "box": Object {
                "flex": 0.9999999999999998,
                "flow": "row",
              },
            },
          },
          "items": Object {
            "blocks": Array [
              Object {
                "area": 11.528797722717716,
                "childCount": 0,
                "color": "#01579b",
                "flex": 1,
                "hasBreakdown": true,
                "name": "general",
                "subTree": Object {
                  "box": Object {
                    "flex": 1,
                    "flow": "column",
                  },
                  "childIndex": 0,
                  "items": Object {
                    "blocks": Array [
                      Object {
                        "area": 11.528797722717716,
                        "childCount": 0,
                        "flex": 1,
                        "name": "foo1_bar1",
                        "subTree": undefined,
                        "total": 1642283,
                      },
                    ],
                    "box": Object {
                      "flex": 1,
                      "flow": "column",
                    },
                  },
                },
                "total": 1642283,
              },
            ],
            "box": Object {
              "flex": 0.9607331435598097,
              "flow": "column",
            },
          },
        }
      `);
    });
  });

  describe(getDeepBlocks.name, () => {
    const costDeep: CategoryCostTreeDeep[] = [
      {
        item: 'Category 1',
        tree: [
          { category: 'foo2_bar2_baz1_bak1', sum: 100 },
          { category: 'foo2_bar2_baz1_bak2', sum: 130 },
          { category: 'foo2_bar2_baz1_bak3', sum: 93 },
        ],
      },
      {
        item: 'Category 2',
        tree: [
          { category: 'foo2_bar2_baz2_bak1', sum: 30 },
          { category: 'foo2_bar2_baz2_bak2', sum: 992 },
        ],
      },
    ];

    const forestDeep = getDeepForest(costDeep);

    const forestDeepProcessed = [
      {
        name: 'Category 1',
        total: 100 + 130 + 93,
        color: colors.blockIndex[0],
        subTree: [
          { name: 'foo2_bar2_baz1_bak1', total: 100 },
          { name: 'foo2_bar2_baz1_bak2', total: 130 },
          { name: 'foo2_bar2_baz1_bak3', total: 93 },
        ],
      },
      {
        name: 'Category 2',
        total: 30 + 992,
        color: colors.blockIndex[1],
        subTree: [
          { name: 'foo2_bar2_baz2_bak1', total: 30 },
          { name: 'foo2_bar2_baz2_bak2', total: 992 },
        ],
      },
    ];

    it('should get a block-packed map of the state', () => {
      expect.assertions(1);
      const result = getDeepBlocks(forestDeep, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT);

      expect(result).toStrictEqual(
        blockPacker<BlockItem>(ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT, forestDeepProcessed),
      );
    });

    it('should take custom dimensions', () => {
      expect.assertions(1);
      const result = getDeepBlocks(forestDeep, 3, 4);

      expect(result).toStrictEqual(blockPacker<BlockItem>(3, 4, forestDeepProcessed));
    });
  });
});
