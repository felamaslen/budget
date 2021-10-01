import { endOfDay } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import { periodCondition, getCategoryColumn, getDeepAnalysisData } from './analysis';
import * as queries from '~api/queries';
import { AnalysisGroupBy, AnalysisPage, AnalysisPeriod } from '~api/types';

jest.mock('~api/queries');

describe('Analysis controller', () => {
  const testUserId = 1234;

  describe('periodCondition', () => {
    it('should get weekly periods', () => {
      expect.assertions(6);
      const now = new Date('2017-09-04');

      const result = periodCondition(now, AnalysisPeriod.Week);

      expect(result.startTime).toStrictEqual(new Date('2017-09-04'));
      expect(result.endTime).toStrictEqual(endOfDay(new Date('2017-09-10')));
      expect(result.description).toBe('Week beginning September 4, 2017');

      const result3 = periodCondition(now, AnalysisPeriod.Week, 3);

      expect(result3.startTime).toStrictEqual(new Date('2017-08-14'));
      expect(result3.endTime).toStrictEqual(endOfDay(new Date('2017-08-20')));
      expect(result3.description).toBe('Week beginning August 14, 2017');
    });

    it('should get monthly periods', () => {
      expect.assertions(6);
      const now = new Date('2017-09-04');

      const result = periodCondition(now, AnalysisPeriod.Month);

      expect(result.startTime).toStrictEqual(new Date('2017-09-01'));
      expect(result.endTime).toStrictEqual(endOfDay(new Date('2017-09-30')));
      expect(result.description).toBe('September 2017');

      const result10 = periodCondition(now, AnalysisPeriod.Month, 10);

      expect(result10.startTime).toStrictEqual(new Date('2016-11-01'));
      expect(result10.endTime).toStrictEqual(endOfDay(new Date('2016-11-30')));
      expect(result10.description).toBe('November 2016');
    });

    it('should get yearly periods', () => {
      expect.assertions(6);
      const now = new Date('2017-09-04');

      const result = periodCondition(now, AnalysisPeriod.Year);

      expect(result.startTime).toStrictEqual(new Date('2017-01-01'));
      expect(result.endTime).toStrictEqual(endOfDay(new Date('2017-12-31')));
      expect(result.description).toBe('2017');

      const result10 = periodCondition(now, AnalysisPeriod.Year, 5);

      expect(result10.startTime).toStrictEqual(new Date('2012-01-01'));
      expect(result10.endTime).toStrictEqual(endOfDay(new Date('2012-12-31')));
      expect(result10.description).toBe('2012');
    });
  });

  describe(getCategoryColumn.name, () => {
    it('should return a group as expected', () => {
      expect.assertions(6);

      expect(getCategoryColumn(AnalysisGroupBy.Category)).toBe('category');
      expect(getCategoryColumn(AnalysisGroupBy.Category)).toBe('category');
      expect(getCategoryColumn(AnalysisGroupBy.Category)).toBe('category');
      expect(getCategoryColumn(AnalysisGroupBy.Category)).toBe('category');
      expect(getCategoryColumn(AnalysisGroupBy.Category)).toBe('category');
      expect(getCategoryColumn(AnalysisGroupBy.Category)).toBe('category');
    });
  });

  describe('getDeepAnalysisData', () => {
    it('should return a grouped tree with deep items', async () => {
      expect.assertions(1);

      jest.spyOn(queries, 'getPeriodCostDeep').mockResolvedValueOnce([
        { cost: 80, item: 'Flour', itemCol: 'Bread' },
        { cost: 95, item: 'Milk', itemCol: 'Dairy' },
        { cost: 130, item: 'Eggs', itemCol: 'Dairy' },
      ]);

      expect(
        await getDeepAnalysisData({} as DatabaseTransactionConnectionType, testUserId, {
          period: AnalysisPeriod.Month,
          groupBy: AnalysisGroupBy.Category,
          page: 0,
          category: AnalysisPage.Food,
        }),
      ).toStrictEqual([
        {
          item: 'Bread',
          tree: [{ category: 'Flour', sum: 80 }],
        },
        {
          item: 'Dairy',
          tree: [
            { category: 'Milk', sum: 95 },
            { category: 'Eggs', sum: 130 },
          ],
        },
      ]);
    });
  });
});
