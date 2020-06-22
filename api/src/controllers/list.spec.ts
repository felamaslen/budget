import { DatabaseTransactionConnectionType } from 'slonik';
import { getLimitCondition, getOlderExists, formatResults, getTotalCost } from './list';
import * as queries from '~api/queries';
import { Page, ColumnMap } from '~api/types';

jest.mock('~api/queries');

describe('List controller', () => {
  const testUserId = 1234;

  describe('getLimitCondition', () => {
    it('should return a valid limit condition', () => {
      expect.assertions(1);

      const now = new Date('2017-09-04');
      const numMonths = 3;

      const result = getLimitCondition(now, numMonths);

      expect(result).toMatchInlineSnapshot(`
        Object {
          "endDate": null,
          "startDate": 2017-07-01T00:00:00.000Z,
        }
      `);
    });

    it('should handle pagination', () => {
      expect.assertions(1);

      const now = new Date('2017-09-03');
      const numMonths = 5;
      const offset = 1;

      const result = getLimitCondition(now, numMonths, offset);

      expect(result).toMatchInlineSnapshot(`
        Object {
          "endDate": 2017-04-30T23:59:59.999Z,
          "startDate": 2016-12-01T00:00:00.000Z,
        }
      `);
    });
  });

  describe('getOlderExists', () => {
    const db = {} as DatabaseTransactionConnectionType;

    beforeEach(() => {
      jest.spyOn(queries, 'countRows').mockResolvedValueOnce(882);
    });

    describe('if there are older rows', () => {
      it('should return true', async () => {
        expect.assertions(1);
        expect(await getOlderExists(db, testUserId, Page.food, 100, 7)).toBe(true);
      });
    });

    describe('if there are no older rows', () => {
      it('should return false', async () => {
        expect.assertions(1);
        expect(await getOlderExists(db, testUserId, Page.food, 100, 8)).toBe(false);
      });
    });
  });

  describe('formatResults', () => {
    it('should abbreviate property keys given a map', () => {
      expect.assertions(1);

      type MyItem = { id: number; date: string; item: string; category: string };

      const queryResult: MyItem[] = [
        { id: 1, date: '2017-09-12', item: 'foo', category: 'bar' },
        { id: 2, date: '2017-08-29', item: 'baz', category: 'bak' },
      ];

      const columnMap: ColumnMap<MyItem> = {
        I: 'id',
        d: 'date',
        i: 'item',
        k: 'category',
      };

      expect(queryResult.map(formatResults(columnMap))).toStrictEqual([
        {
          I: 1,
          d: '2017-09-12',
          i: 'foo',
          k: 'bar',
        },
        {
          I: 2,
          d: '2017-08-29',
          i: 'baz',
          k: 'bak',
        },
      ]);
    });
  });

  describe('getTotalCost', () => {
    const db = {} as DatabaseTransactionConnectionType;

    describe.each`
      pageType           | page          | method
      ${'standard list'} | ${Page.food}  | ${'getListTotalCost'}
      ${'funds'}         | ${Page.funds} | ${'getTotalFundCost'}
    `('on $pageType page', ({ page, method }) => {
      it('should return the correct result', async () => {
        expect.assertions(1);
        jest.spyOn(queries, method).mockResolvedValueOnce(1023);

        expect(await getTotalCost(db, testUserId, page)).toBe(1023);
      });
    });
  });
});
