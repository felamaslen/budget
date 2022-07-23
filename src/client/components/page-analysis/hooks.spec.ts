import { renderHook } from '@testing-library/react';

import { getForest, getBlocks, getDeepBlocks, getDeepForest, State, useStatus } from './hooks';

import { ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT } from '~client/constants/analysis';
import { blockPacker } from '~client/modules/block-packer';
import { colors } from '~client/styled/variables';
import type { AnalysisSortedTree, BlockItem, MainBlockName } from '~client/types';
import { AnalysisPage, PageListStandard } from '~client/types/enum';
import type { CategoryCostTreeDeep } from '~client/types/gql';

describe('analysis hooks', () => {
  const state: State = {
    description: 'Some description',
    startDate: new Date('2018-04-01'),
    endDate: new Date('2018-04-07'),
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
    income: 2003898,
  };

  const invested = 191332;

  describe(getForest.name, () => {
    it('should return the cost data, ordered and mapped into subtrees', () => {
      expect.assertions(1);
      const expectedResult: AnalysisSortedTree<MainBlockName>[] = [
        {
          name: PageListStandard.General as string as MainBlockName,
          derived: false,
          color: colors[PageListStandard.General].main,
          subTree: [{ name: 'foo1_bar1', total: 1642283 }],
          total: 1642283,
        },
        {
          name: PageListStandard.Food as string as MainBlockName,
          derived: false,
          color: colors[PageListStandard.Food].main,
          subTree: [
            { name: 'foo2_bar1', total: 156842 },
            { name: 'foo2_bar2', total: 137650 },
          ],
          total: 156842 + 137650,
        },
        {
          name: 'saved',
          derived: true,
          color: colors.blockColor.saved,
          total: state.saved,
        },
        {
          name: 'invested',
          derived: true,
          color: colors.overview.balanceStocks,
          total: invested,
        },
      ];

      const result = getForest(state.cost, state.saved, invested);

      expect(result).toStrictEqual(expectedResult);
    });

    describe('when the cost is empty', () => {
      it('should not throw an error', () => {
        expect.assertions(1);
        expect(() => getForest([], 0, 0)).not.toThrow();
      });
    });
  });

  describe(getBlocks.name, () => {
    const forest = getForest(state.cost, state.saved, invested);

    it('should get a block-packed map of the state', () => {
      expect.assertions(1);
      const result = getBlocks(forest, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT);

      // eslint-disable-next-line jest/no-large-snapshots
      expect(result).toMatchInlineSnapshot(`
        Object {
          "box": Object {
            "flex": 1,
            "flow": "column",
          },
          "childIndex": 0,
          "children": Object {
            "box": Object {
              "flex": 0.1520527681325915,
              "flow": "row",
            },
            "childIndex": 1,
            "items": Object {
              "blocks": Array [
                Object {
                  "area": 38013.19203314789,
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
                            "area": 17767.93897071162,
                            "childCount": 1,
                            "flex": 1,
                            "name": "foo2_bar2",
                            "subTree": undefined,
                            "total": 137650,
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
                          "area": 20245.25306243627,
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
                "flex": 1.0000000000000004,
                "flow": "row",
              },
            },
          },
          "items": Object {
            "blocks": Array [
              Object {
                "area": 211986.80796685212,
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
                        "area": 211986.80796685212,
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
              "flex": 0.8479472318674085,
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
          "items": Object {
            "blocks": Array [
              Object {
                "area": 250000,
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
                        "area": 250000,
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
              "flex": 1,
              "flow": "column",
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
          "items": Object {
            "blocks": Array [
              Object {
                "area": 12,
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
                        "area": 12,
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
              "flex": 1,
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

    const forestDeepProcessed: AnalysisSortedTree<MainBlockName>[] = [
      {
        name: 'Category 1' as MainBlockName,
        derived: false,
        total: 100 + 130 + 93,
        color: colors.blockIndex[0],
        subTree: [
          { name: 'foo2_bar2_baz1_bak1', total: 100 },
          { name: 'foo2_bar2_baz1_bak2', total: 130 },
          { name: 'foo2_bar2_baz1_bak3', total: 93 },
        ],
      },
      {
        name: 'Category 2' as MainBlockName,
        derived: false,
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

  describe(useStatus.name, () => {
    const cost: State['cost'] = [
      {
        item: AnalysisPage.Bills,
        tree: [
          {
            category: 'Housing',
            sum: 1701920,
          },
          {
            category: 'Car',
            sum: 82901,
          },
        ],
      },
      {
        item: AnalysisPage.Food,
        tree: [
          {
            category: 'Fruit',
            sum: 48694,
          },
          {
            category: 'Meat',
            sum: 33792,
          },
        ],
      },
    ];

    const saved = 1638557;

    describe('when there are no active blocks', () => {
      it('should return an empty string', () => {
        expect.assertions(1);
        const { result } = renderHook(() => useStatus([], cost, null, saved));
        expect(result.current).toBe('');
      });
    });

    describe('when there is a main active block', () => {
      describe.each`
        subBlock        | activeBlocks
        ${'not active'} | ${['saved']}
        ${'active'}     | ${['saved', 'Invested']}
      `('when the main active block is saved and a sub-block is $subBlock', ({ activeBlocks }) => {
        it('should return the saved value', () => {
          expect.assertions(1);
          const { result } = renderHook(() => useStatus(activeBlocks, cost, null, saved));
          expect(result.current).toBe('Saved: £16,385.57');
        });
      });

      describe('when there is not an active sub-block', () => {
        it('should sum the total of the selected tree and set the status using that', () => {
          expect.assertions(2);
          const { rerender, result } = renderHook<string, { page: AnalysisPage }>(
            ({ page }) => useStatus([page], cost, null, saved),
            { initialProps: { page: AnalysisPage.Bills } },
          );

          expect(result.current).toBe('Bills (£17,848.21)');

          rerender({ page: AnalysisPage.Food });

          expect(result.current).toBe('Food (£824.86)');
        });
      });

      describe('when there is an active sub-block', () => {
        it('should add the sub-block to the status and use the total from the sub-block', () => {
          expect.assertions(2);
          const { rerender, result } = renderHook<string, { subBlock: string }>(
            ({ subBlock }) => useStatus([AnalysisPage.Bills, subBlock], cost, null, saved),
            { initialProps: { subBlock: 'Housing' } },
          );

          expect(result.current).toBe('Bills: Housing (£17,019.20)');

          rerender({ subBlock: 'Car' });

          expect(result.current).toBe('Bills: Car (£829.01)');
        });

        describe('when the sub-block does not exist', () => {
          it('should use 0 as the total', () => {
            expect.assertions(1);
            const { result } = renderHook(() =>
              useStatus([AnalysisPage.Bills, 'NOT-Car'], cost, null, saved),
            );

            expect(result.current).toBe('Bills: NOT-Car (£0.00)');
          });
        });
      });
    });
  });
});
