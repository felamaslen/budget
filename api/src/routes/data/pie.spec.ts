import { getPieCols, processQueryResult } from './pie';
import { Page } from '~api/types';

describe('Pie route', () => {
  describe('getPieCols', () => {
    it('should return the expected category list', () => {
      expect.assertions(5);

      expect(() => getPieCols(Page.funds)).toThrowErrorMatchingInlineSnapshot(`"Invalid category"`);

      expect(getPieCols(Page.food)).toStrictEqual([
        ['shop', 'Shop cost'],
        ['category', 'Category cost'],
      ]);

      expect(getPieCols(Page.general)).toStrictEqual([
        ['shop', 'Shop cost'],
        ['category', 'Category cost'],
      ]);

      expect(getPieCols(Page.social)).toStrictEqual([
        ['shop', 'Shop cost'],
        ['society', 'Society cost'],
      ]);

      expect(getPieCols(Page.holiday)).toStrictEqual([
        ['shop', 'Shop cost'],
        ['holiday', 'Holiday cost'],
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
