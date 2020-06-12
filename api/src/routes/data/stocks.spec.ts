import { processStocks } from './stocks';

describe('Stocks route', () => {
  describe('processStocks', () => {
    it('should return expected results', () => {
      expect.assertions(1);
      const queryResult = [
        { code: 'ABC:DEF', name: 'ABC company', sum_weight: 2 },
        { code: 'XYZ:UVW', name: 'XYZ company', sum_weight: 4 },
      ];

      expect(processStocks(queryResult, 'fookey')).toStrictEqual({
        stocks: [
          ['ABC:DEF', 'ABC company', 2],
          ['XYZ:UVW', 'XYZ company', 4],
        ],
        total: 6,
        apiKey: 'fookey',
      });
    });
  });
});
