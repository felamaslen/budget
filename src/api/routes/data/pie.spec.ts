import { getPieCols, processQueryResult } from './pie';
import { PageListStandard } from '~api/types';
import { PageNonStandard } from '~shared/constants';

describe('pie route', () => {
  describe('getPieCols', () => {
    it('should return the expected category list', () => {
      expect.assertions(5);

      expect(() =>
        getPieCols(PageNonStandard.Funds as unknown as PageListStandard),
      ).toThrowErrorMatchingInlineSnapshot(`"Invalid category"`);

      expect(getPieCols(PageListStandard.Food)).toStrictEqual([
        ['shop', 'Shop cost'],
        ['category', 'Category cost'],
      ]);

      expect(getPieCols(PageListStandard.General)).toStrictEqual([
        ['shop', 'Shop cost'],
        ['category', 'Category cost'],
      ]);

      expect(getPieCols(PageListStandard.Social)).toStrictEqual([
        ['shop', 'Shop cost'],
        ['category', 'Society cost'],
      ]);

      expect(getPieCols(PageListStandard.Holiday)).toStrictEqual([
        ['shop', 'Shop cost'],
        ['category', 'Holiday cost'],
      ]);
    });
  });

  describe('processQueryResult', () => {
    it('should return the expected results', () => {
      expect.assertions(1);
      const queryResult = [
        { col: 'Tesco', cost: 41739 },
        { col: 'Sainsburys', cost: 20490 },
        { col: 'Subway', cost: 15647 },
        { col: 'Wetherspoons', cost: 6982 },
        { col: 'Waitrose', cost: 120 },
        { col: 'Boots', cost: 99 },
      ];

      const pieCol: [string, string] = ['shop', 'Shop cost'];

      const threshold = 0.05;

      const result = processQueryResult(queryResult, pieCol, threshold);

      const expectedResult = {
        title: 'Shop cost',
        type: 'cost',
        total: 85077,
        data: [
          ['Tesco', 41739],
          ['Sainsburys', 20490],
          ['Subway', 15647],
          ['Wetherspoons', 6982],
          ['Other', 219],
        ],
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });
});
