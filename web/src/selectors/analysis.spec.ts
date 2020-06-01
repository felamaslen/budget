import {
  getLoading,
  getLoadingDeep,
  getAnalysisPeriod,
  getGrouping,
  getPage,
  getCostAnalysis,
  getBlocks,
  getDeepBlocks,
} from './analysis';
import {
  ANALYSIS_VIEW_WIDTH,
  ANALYSIS_VIEW_HEIGHT,
  Period,
  Grouping,
} from '~client/constants/analysis';
import { blockPacker } from '~client/modules/block-packer';
import { colors } from '~client/styled/variables';
import { testState } from '~client/test-data/state';
import { Page, BlockItem, AnalysisCost } from '~client/types';

describe('Analysis selectors', () => {
  describe('getLoading', () => {
    it('should get the loading status', () => {
      expect.assertions(1);
      expect(
        getLoading({
          ...testState,
          analysis: {
            ...testState.analysis,
            loading: true,
          },
        }),
      ).toBe(true);
    });
  });

  describe('getLoadingDeep', () => {
    it('should get the loading (deep block) status', () => {
      expect.assertions(1);
      expect(
        getLoadingDeep({
          ...testState,
          analysis: {
            ...testState.analysis,
            loadingDeep: true,
          },
        }),
      ).toBe(true);
    });
  });

  describe('getAnalysisPeriod', () => {
    it('should get the period', () => {
      expect.assertions(1);
      expect(
        getAnalysisPeriod({
          ...testState,
          analysis: {
            ...testState.analysis,
            period: Period.month,
          },
        }),
      ).toBe(Period.month);
    });
  });

  describe('getGrouping', () => {
    it('should get the grouping', () => {
      expect.assertions(1);
      expect(
        getGrouping({
          ...testState,
          analysis: {
            ...testState.analysis,
            grouping: Grouping.shop,
          },
        }),
      ).toBe(Grouping.shop);
    });
  });

  describe('getPage', () => {
    it('should get the page', () => {
      expect.assertions(1);
      expect(
        getPage({
          ...testState,
          analysis: {
            ...testState.analysis,
            page: 3,
          },
        }),
      ).toBe(3);
    });
  });

  describe('getCostAnalysis', () => {
    it('should return the cost data, ordered and mapped into subtrees', () => {
      expect.assertions(1);
      const expectedResult = [
        {
          name: Page.general,
          color: colors[Page.general].main,
          subTree: [{ name: 'foo1_bar1', total: 1642283 }],
          total: 1642283,
        },
        {
          name: Page.food,
          color: colors[Page.food].main,
          subTree: [
            { name: 'foo2_bar1', total: 156842 },
            { name: 'foo2_bar2', total: 137650 },
          ],
          total: 156842 + 137650,
        },
        {
          name: 'saved',
          color: colors.blockColor.saved,
          total: testState.analysis.saved,
        },
      ];

      const result = getCostAnalysis(testState);

      expect(result).toStrictEqual(expectedResult);
    });

    it("shouldn't throw an error if cost is empty", () => {
      expect.assertions(1);
      expect(() => {
        getCostAnalysis({
          ...testState,
          analysis: {
            ...testState.analysis,
            cost: [],
          },
        });
      }).not.toThrow();
    });
  });

  describe('getBlocks', () => {
    it('should get a block-packed map of the state', () => {
      expect.assertions(1);
      const result = getBlocks(ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT)(testState);

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
      const result = getBlocks(ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT, {
        [Page.food]: false,
      })(testState);

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
      const result = getBlocks(3, 4, {
        [Page.food]: false,
      })(testState);

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

  describe('getDeepBlocks', () => {
    const costDeep: AnalysisCost<string> = [
      [
        'Category 1',
        [
          ['foo2_bar2_baz1_bak1', 100],
          ['foo2_bar2_baz1_bak2', 130],
          ['foo2_bar2_baz1_bak3', 93],
        ],
      ],
      [
        'Category 2',
        [
          ['foo2_bar2_baz2_bak1', 30],
          ['foo2_bar2_baz2_bak2', 992],
        ],
      ],
    ];

    const costDeepProcessed = [
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

    const stateDeep = {
      ...testState,
      analysis: {
        ...testState.analysis,
        costDeep,
      },
    };

    it('getDeepBlocks gets a block-packed map of the state', () => {
      expect.assertions(1);
      const result = getDeepBlocks(ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT)(stateDeep);

      expect(result).toStrictEqual(
        blockPacker<BlockItem>(ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT, costDeepProcessed),
      );
    });

    it('should take custom dimensions', () => {
      expect.assertions(1);
      const result = getDeepBlocks(3, 4)(stateDeep);

      expect(result).toStrictEqual(blockPacker<BlockItem>(3, 4, costDeepProcessed));
    });
  });
});