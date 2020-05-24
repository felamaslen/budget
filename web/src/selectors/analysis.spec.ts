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
import { testState } from '~client/test-data/state';
import { Page } from '~client/types/app';

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
          subTree: [{ name: 'foo1_bar1', total: 1642283 }],
          total: 1642283,
        },
        {
          name: Page.food,
          subTree: [
            { name: 'foo2_bar1', total: 156842 },
            { name: 'foo2_bar2', total: 137650 },
          ],
          total: 156842 + 137650,
        },
        {
          name: 'saved',
          total: testState.analysis.saved,
        },
      ];

      const result = getCostAnalysis(testState);

      expect(result).toStrictEqual(expectedResult);
    });

    it("shouldn'tt throw an error if cost is empty", () => {
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
      expect.assertions(2);
      const result = getBlocks(testState);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toStrictEqual(
        blockPacker(getCostAnalysis(testState), ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT),
      );
    });

    it('should exclude blocks which are not in the visible tree', () => {
      expect.assertions(1);
      const result = getBlocks({
        ...testState,
        analysis: {
          ...testState.analysis,
          treeVisible: {
            [Page.food]: false,
          },
        },
      });

      expect(result).toStrictEqual(
        blockPacker(
          getCostAnalysis({
            ...testState,
            analysis: {
              ...testState.analysis,
              cost: testState.analysis.cost.filter(([name]) => name !== Page.food),
            },
          }),
          ANALYSIS_VIEW_WIDTH,
          ANALYSIS_VIEW_HEIGHT,
        ),
      );
    });
  });

  describe('getDeepBlocks', () => {
    it('getDeepBlocks gets a block-packed map of the state', () => {
      expect.assertions(2);
      const result = getDeepBlocks({
        ...testState,
        analysis: {
          ...testState.analysis,
          costDeep: [
            [
              Page.food,
              [
                ['foo2_bar2_baz1_bak1', 100],
                ['foo2_bar2_baz1_bak2', 130],
                ['foo2_bar2_baz1_bak3', 93],
              ],
            ],
            [
              Page.general,
              [
                ['foo2_bar2_baz2_bak1', 30],
                ['foo2_bar2_baz2_bak2', 992],
              ],
            ],
          ],
        },
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result).toStrictEqual(
        blockPacker(
          [
            {
              name: Page.food,
              total: 100 + 130 + 93,
              subTree: [
                { name: 'foo2_bar2_baz1_bak1', total: 100 },
                { name: 'foo2_bar2_baz1_bak2', total: 130 },
                { name: 'foo2_bar2_baz1_bak3', total: 93 },
              ],
            },
            {
              name: Page.general,
              total: 30 + 992,
              subTree: [
                { name: 'foo2_bar2_baz2_bak1', total: 30 },
                { name: 'foo2_bar2_baz2_bak2', total: 992 },
              ],
            },
          ],
          ANALYSIS_VIEW_WIDTH,
          ANALYSIS_VIEW_HEIGHT,
        ),
      );
    });
  });
});
