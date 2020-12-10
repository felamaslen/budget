import { endOfDay } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import {
  periodCondition,
  getCategoryColumn,
  getCostsByDate,
  processTimelineData,
  getDeepAnalysisData,
} from './analysis';
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
      expect.assertions(5);

      expect(getCategoryColumn(AnalysisPage.Bills)).toBe('item');
      expect(getCategoryColumn(AnalysisPage.Food, AnalysisGroupBy.Category)).toBe('category');
      expect(getCategoryColumn(AnalysisPage.General, AnalysisGroupBy.Category)).toBe('category');
      expect(getCategoryColumn(AnalysisPage.Social, AnalysisGroupBy.Category)).toBe('category');
      expect(getCategoryColumn(AnalysisPage.Holiday, AnalysisGroupBy.Category)).toBe('category');
    });
  });

  describe('getCostsByDate', () => {
    it('should organise rows into a tree based on year, month and date', () => {
      expect.assertions(1);

      const input = [
        [
          { date: '2015-01-10', cost: 5 },
          { date: '2016-12-06', cost: 10 },
          { date: '2016-12-20', cost: 11 },
          { date: '2017-01-04', cost: 15 },
          { date: '2017-09-03', cost: 3 },
        ],
        [
          { date: '2015-01-10', cost: 1 },
          { date: '2015-03-04', cost: 50 },
          { date: '2017-05-30', cost: 17 },
        ],
        [{ date: '2016-04-04', cost: 3 }],
      ];

      expect(getCostsByDate(input)).toStrictEqual({
        2015: {
          0: {
            10: [5, 1],
          },
          2: {
            4: [0, 50],
          },
        },
        2016: {
          3: {
            4: [0, 0, 3],
          },
          11: {
            6: [10],
            20: [11],
          },
        },
        2017: {
          0: {
            4: [15],
          },
          4: {
            30: [0, 17],
          },
          8: {
            3: [3],
          },
        },
      });
    });
  });

  describe('processTimelineData', () => {
    describe('for yearly data', () => {
      it('should return an item for each day in the year', () => {
        expect.assertions(1);
        const data = [
          [
            { date: '2015-01-10', cost: 5 },
            { date: '2016-12-06', cost: 10 },
            { date: '2016-12-20', cost: 11 },
            { date: '2017-01-04', cost: 15 },
            { date: '2017-09-03', cost: 3 },
          ],
          [
            { date: '2015-01-10', cost: 1 },
            { date: '2015-03-04', cost: 50 },
            { date: '2017-05-30', cost: 17 },
          ],
          [{ date: '2016-04-04', cost: 3 }],
        ];

        const condition = { startTime: new Date('2016-01-01') };

        const expectedResult = [
          ...new Array(31 + 29 + 31 + 3).fill([]),
          [0, 0, 3],
          ...new Array(26 + 31 + 30 + 31 + 31 + 30 + 31 + 30 + 5).fill([]),
          [10],
          ...new Array(13).fill([]),
          [11],
          ...new Array(11).fill([]),
        ];

        expect(processTimelineData(data, AnalysisPeriod.Year, condition)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe('for monthly data', () => {
      it('should return an item for each day in the month', () => {
        expect.assertions(1);

        const data = [
          [
            { date: '2015-01-10', cost: 5 },
            { date: '2016-12-06', cost: 10 },
            { date: '2016-12-20', cost: 11 },
            { date: '2017-01-04', cost: 15 },
            { date: '2017-09-03', cost: 3 },
          ],
          [
            { date: '2015-01-10', cost: 1 },
            { date: '2015-03-04', cost: 50 },
            { date: '2017-05-30', cost: 17 },
          ],
          [{ date: '2016-04-04', cost: 3 }],
        ];

        const condition = {
          startTime: new Date('2016-12-01'),
        };

        const expectedResult = [
          ...new Array(5).fill([]),
          [10],
          ...new Array(13).fill([]),
          [11],
          ...new Array(11).fill([]),
        ];

        expect(processTimelineData(data, AnalysisPeriod.Month, condition)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe('for weekly data', () => {
      it('should return null', () => {
        expect.assertions(1);
        expect(
          processTimelineData([], AnalysisPeriod.Week, { startTime: new Date('2020-04-20') }),
        ).toBeNull();
      });
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
