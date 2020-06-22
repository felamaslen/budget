import { getUnixTime } from 'date-fns';
import md5 from 'md5';

import { getMaxAge, processFundHistory, fundHash } from './funds';

describe('Funds controller', () => {
  describe('getMaxAge', () => {
    const now = new Date('2017-09-05');

    it.each`
      period     | length | expectedDate
      ${'year'}  | ${1}   | ${'2016-09-05'}
      ${'year'}  | ${3}   | ${'2014-09-05'}
      ${'month'} | ${6}   | ${'2017-03-05'}
    `('should return the correct timestamp', ({ period, length, expectedDate }) => {
      expect.assertions(1);
      expect(getMaxAge(now, period, length)).toStrictEqual(new Date(expectedDate));
    });

    it('should handle a zero length', () => {
      expect.assertions(1);
      expect(getMaxAge(now, 'year', 0).getTime()).toBe(0);
    });
  });

  describe('processFundHistory', () => {
    const funds = [
      {
        I: 3,
        i: 'Some fund 3',
        tr: [],
      },
      {
        I: 22,
        i: 'Some fund 22',
        tr: [],
      },
      {
        I: 23,
        i: 'Some fund 23',
        tr: [],
      },
      {
        I: 24,
        i: 'Some fund 24',
        tr: [],
      },
      {
        I: 25,
        i: 'Some fund 25',
        tr: [],
      },
      {
        I: 7,
        i: 'Some fund 7',
        tr: [],
      },
    ];

    const priceRows = [
      {
        time: new Date('2017-04-03 14:23:49').getTime(),
        id: [3, 22, 23, 24],
        price: [96.5, 100.2, 16.29, 1.23],
      },
      {
        time: new Date('2017-04-21 09:00:01').getTime(),
        id: [3, 22, 23, 25],
        price: [97.3, 100.03, 16.35, 67.08],
      },
      {
        time: new Date('2017-05-01 10:32:43').getTime(),
        id: [7, 3, 22, 23, 25],
        price: [10.21, 97.4, 100.1, 16.33, 67.22],
      },
      {
        time: new Date('2017-05-03 10:31:06').getTime(),
        id: [22, 25],
        price: [100.15, 66.98],
      },
    ];

    const maxAge = new Date('2020-04-20');

    it('should return the start time', () => {
      expect.assertions(1);
      expect(processFundHistory(funds, maxAge, priceRows)).toStrictEqual(
        expect.objectContaining({
          startTime: getUnixTime(new Date('2017-04-03 14:23:49')),
        }),
      );
    });

    it('should return the cached times, relative to the start time', () => {
      expect.assertions(1);
      const result = processFundHistory(funds, maxAge, priceRows);
      expect(result.cacheTimes).toMatchInlineSnapshot(`
        Array [
          0,
          1535772,
          2405334,
          2578037,
        ]
      `);
    });

    it('should return the rows with prices array and price offset index', () => {
      expect.assertions(1);
      expect(processFundHistory(funds, maxAge, priceRows)).toStrictEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              I: 3,
              pr: [96.5, 97.3, 97.4],
              prStartIndex: 0,
            }),
            expect.objectContaining({
              I: 22,
              pr: [100.2, 100.03, 100.1, 100.15],
              prStartIndex: 0,
            }),
            expect.objectContaining({
              I: 24,
              pr: [1.23],
              prStartIndex: 0,
            }),
            expect.objectContaining({
              I: 25,
              pr: [67.08, 67.22, 66.98],
              prStartIndex: 1,
            }),
            expect.objectContaining({
              I: 7,
              pr: [10.21],
              prStartIndex: 2,
            }),
            expect.objectContaining({
              I: 23,
              pr: [16.29, 16.35, 16.33],
              prStartIndex: 0,
            }),
          ]),
        }),
      );
    });

    describe('if a fund was sold and then re-bought', () => {
      const idFundNeverSold = 1776;
      const idFundOnceSold = 7619;

      const fundsRebought = [
        {
          I: idFundNeverSold,
          i: 'A fund which was never sold',
          tr: [],
        },
        {
          I: idFundOnceSold,
          i: 'A fund which was sold and rebought',
          tr: [],
        },
      ];

      const priceRowsRebought = [
        {
          time: new Date('2019-12-31').getTime(),
          id: [idFundNeverSold],
          price: [99.93],
        },
        {
          time: new Date('2020-01-01').getTime(),
          id: [idFundNeverSold, idFundOnceSold],
          price: [100, 200],
        },
        {
          time: new Date('2020-01-02').getTime(),
          id: [idFundNeverSold],
          price: [100.1],
        },
        {
          time: new Date('2020-01-03').getTime(),
          id: [idFundNeverSold, idFundOnceSold],
          price: [100.05, 196.54],
        },
      ];

      it('should pad the rebought fund with zeroes', () => {
        expect.assertions(1);
        const result = processFundHistory(fundsRebought, new Date('2020-04-20'), priceRowsRebought);

        expect(result).toStrictEqual(
          expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                I: idFundNeverSold,
                pr: [99.93, 100, 100.1, 100.05],
                prStartIndex: 0,
              }),
              expect.objectContaining({
                I: idFundOnceSold,
                pr: [200, 0, 196.54],
                prStartIndex: 1,
              }),
            ]),
          }),
        );
      });
    });
  });

  describe('fundHash', () => {
    it('should return a valid hashed value', () => {
      expect.assertions(1);
      expect(fundHash('foobar', 'somesalt')).toBe(md5('foobarsomesalt'));
    });
  });
});
