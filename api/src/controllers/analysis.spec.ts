import { endOfDay } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import {
  periodCondition,
  getCategoryColumn,
  getCostsByDate,
  processTimelineData,
  getDeepAnalysisData,
} from './analysis';
import { User } from '~api/modules/auth';
import * as queries from '~api/queries';
import { Page } from '~api/types';

jest.mock('~api/queries');

describe('Analysis controller', () => {
  describe('periodCondition', () => {
    it('should get weekly periods', () => {
      expect.assertions(6);
      const now = new Date('2017-09-04');

      const result = periodCondition(now, 'week');

      expect(result.startTime).toStrictEqual(new Date('2017-09-04'));
      expect(result.endTime).toStrictEqual(endOfDay(new Date('2017-09-10')));
      expect(result.description).toBe('Week beginning September 4, 2017');

      const result3 = periodCondition(now, 'week', 3);

      expect(result3.startTime).toStrictEqual(new Date('2017-08-14'));
      expect(result3.endTime).toStrictEqual(endOfDay(new Date('2017-08-20')));
      expect(result3.description).toBe('Week beginning August 14, 2017');
    });

    it('should get monthly periods', () => {
      expect.assertions(6);
      const now = new Date('2017-09-04');

      const result = periodCondition(now, 'month');

      expect(result.startTime).toStrictEqual(new Date('2017-09-01'));
      expect(result.endTime).toStrictEqual(endOfDay(new Date('2017-09-30')));
      expect(result.description).toBe('September 2017');

      const result10 = periodCondition(now, 'month', 10);

      expect(result10.startTime).toStrictEqual(new Date('2016-11-01'));
      expect(result10.endTime).toStrictEqual(endOfDay(new Date('2016-11-30')));
      expect(result10.description).toBe('November 2016');
    });

    it('should get yearly periods', () => {
      expect.assertions(6);
      const now = new Date('2017-09-04');

      const result = periodCondition(now, 'year');

      expect(result.startTime).toStrictEqual(new Date('2017-01-01'));
      expect(result.endTime).toStrictEqual(endOfDay(new Date('2017-12-31')));
      expect(result.description).toBe('2017');

      const result10 = periodCondition(now, 'year', 5);

      expect(result10.startTime).toStrictEqual(new Date('2012-01-01'));
      expect(result10.endTime).toStrictEqual(endOfDay(new Date('2012-12-31')));
      expect(result10.description).toBe('2012');
    });
  });

  describe('getCategoryColumn', () => {
    it('should return a group as expected', () => {
      expect.assertions(5);

      expect(getCategoryColumn(Page.bills)).toBe('item');
      expect(getCategoryColumn(Page.food, 'category')).toBe('category');
      expect(getCategoryColumn(Page.general, 'category')).toBe('category');
      expect(getCategoryColumn(Page.social, 'category')).toBe('society');
      expect(getCategoryColumn(Page.holiday, 'category')).toBe('holiday');
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

        expect(processTimelineData(data, 'year', condition)).toStrictEqual(expectedResult);
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

        expect(processTimelineData(data, 'month', condition)).toStrictEqual(expectedResult);
      });
    });

    describe('for weekly data', () => {
      it('should return null', () => {
        expect.assertions(1);
        expect(processTimelineData([], 'week', { startTime: new Date('2020-04-20') })).toBeNull();
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
        await getDeepAnalysisData(
          {} as DatabaseTransactionConnectionType,
          { uid: 'some-user-id' } as User,
          { period: 'month', groupBy: 'category', pageIndex: 0, category: Page.food },
        ),
      ).toStrictEqual([
        ['Bread', [['Flour', 80]]],
        [
          'Dairy',
          [
            ['Milk', 95],
            ['Eggs', 130],
          ],
        ],
      ]);
    });
  });
});
