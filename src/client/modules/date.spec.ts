import endOfMonth from 'date-fns/endOfMonth';
import timezoneMock from 'timezone-mock';

import { timeSeriesTicks, getMonthDatesList } from './date';

describe('date module', () => {
  describe('timeSeriesTicks', () => {
    it('should handle small ranges (less than 10 minutes)', () => {
      expect.assertions(1);
      const result = timeSeriesTicks(1497871283, 1497871283 + 167);
      const expectedResult = [
        { label: '11:21', major: 1, time: 1497871260 },
        { label: null, major: 0, time: 1497871290 },
        { label: '11:22', major: 1, time: 1497871320 },
        { label: null, major: 0, time: 1497871350 },
        { label: '11:23', major: 1, time: 1497871380 },
        { label: null, major: 0, time: 1497871410 },
        { label: '11:24', major: 1, time: 1497871440 },
      ];

      expect(result).toStrictEqual(expectedResult);
    });

    it('should handle ranges of between 10 minutes and one hour', () => {
      expect.assertions(1);
      const result = timeSeriesTicks(1497871283, 1497871283 + 795);

      const expectedResult = [
        { label: null, major: 0, time: 1497871260 },
        { label: null, major: 0, time: 1497871320 },
        { label: null, major: 0, time: 1497871380 },
        { label: null, major: 0, time: 1497871440 },
        { label: null, major: 0, time: 1497871500 },
        { label: null, major: 0, time: 1497871560 },
        { label: null, major: 0, time: 1497871620 },
        { label: null, major: 0, time: 1497871680 },
        { label: null, major: 0, time: 1497871740 },
        { label: '11:30', major: 1, time: 1497871800 },
        { label: null, major: 0, time: 1497871860 },
        { label: null, major: 0, time: 1497871920 },
        { label: null, major: 0, time: 1497871980 },
        { label: null, major: 0, time: 1497872040 },
        { label: null, major: 0, time: 1497872100 },
      ];

      expect(result).toStrictEqual(expectedResult);
    });

    it('should handle ranges of between one hour and 0.6 days', () => {
      expect.assertions(1);
      const result = timeSeriesTicks(1497871283, 1497871283 + 51320);

      const expectedResult = [
        { label: '11:00', major: 1, time: 1497870000 },
        { label: null, major: 0, time: 1497871800 },
        { label: '12:00', major: 1, time: 1497873600 },
        { label: null, major: 0, time: 1497875400 },
        { label: '13:00', major: 1, time: 1497877200 },
        { label: null, major: 0, time: 1497879000 },
        { label: '14:00', major: 1, time: 1497880800 },
        { label: null, major: 0, time: 1497882600 },
        { label: '15:00', major: 1, time: 1497884400 },
        { label: null, major: 0, time: 1497886200 },
        { label: '16:00', major: 1, time: 1497888000 },
        { label: null, major: 0, time: 1497889800 },
        { label: '17:00', major: 1, time: 1497891600 },
        { label: null, major: 0, time: 1497893400 },
        { label: '18:00', major: 1, time: 1497895200 },
        { label: null, major: 0, time: 1497897000 },
        { label: '19:00', major: 1, time: 1497898800 },
        { label: null, major: 0, time: 1497900600 },
        { label: '20:00', major: 1, time: 1497902400 },
        { label: null, major: 0, time: 1497904200 },
        { label: '21:00', major: 1, time: 1497906000 },
        { label: null, major: 0, time: 1497907800 },
        { label: '22:00', major: 1, time: 1497909600 },
        { label: null, major: 0, time: 1497911400 },
        { label: '23:00', major: 1, time: 1497913200 },
        { label: null, major: 0, time: 1497915000 },
        { label: 'Tue', major: 2, time: 1497916800 },
        { label: null, major: 0, time: 1497918600 },
        { label: '01:00', major: 1, time: 1497920400 },
        { label: null, major: 0, time: 1497922200 },
      ];

      expect(result).toStrictEqual(expectedResult);
    });

    it('should handle ranges of between 0.6 days and eight days', () => {
      expect.assertions(1);
      const result = timeSeriesTicks(1497871283, 1497871283 + 86400 * 3.32);

      const expectedResult = [
        { label: null, major: 0, time: 1497862800 },
        { label: null, major: 0, time: 1497873600 },
        { label: null, major: 0, time: 1497884400 },
        { label: null, major: 0, time: 1497895200 },
        { label: null, major: 0, time: 1497906000 },
        { label: 'Tue', major: 1, time: 1497916800 },
        { label: null, major: 0, time: 1497927600 },
        { label: null, major: 0, time: 1497938400 },
        { label: null, major: 0, time: 1497949200 },
        { label: null, major: 0, time: 1497960000 },
        { label: null, major: 0, time: 1497970800 },
        { label: null, major: 0, time: 1497981600 },
        { label: null, major: 0, time: 1497992400 },
        { label: 'Wed', major: 1, time: 1498003200 },
        { label: null, major: 0, time: 1498014000 },
        { label: null, major: 0, time: 1498024800 },
        { label: null, major: 0, time: 1498035600 },
        { label: null, major: 0, time: 1498046400 },
        { label: null, major: 0, time: 1498057200 },
        { label: null, major: 0, time: 1498068000 },
        { label: null, major: 0, time: 1498078800 },
        { label: 'Thu', major: 1, time: 1498089600 },
        { label: null, major: 0, time: 1498100400 },
        { label: null, major: 0, time: 1498111200 },
        { label: null, major: 0, time: 1498122000 },
        { label: null, major: 0, time: 1498132800 },
        { label: null, major: 0, time: 1498143600 },
        { label: null, major: 0, time: 1498154400 },
      ];

      expect(result).toStrictEqual(expectedResult);
    });

    it('should handle ranges of between eight and 35 days', () => {
      expect.assertions(1);
      const result = timeSeriesTicks(1497871283, 1497871283 + 86400 * 11.4);

      const expectedResult = [
        { label: null, major: 0, time: 1497830400 },
        { label: null, major: 0, time: 1497916800 },
        { label: null, major: 0, time: 1498003200 },
        { label: null, major: 0, time: 1498089600 },
        { label: null, major: 0, time: 1498176000 },
        { label: null, major: 0, time: 1498262400 },
        { label: '25 Jun', major: 1, time: 1498348800 },
        { label: null, major: 0, time: 1498435200 },
        { label: null, major: 0, time: 1498521600 },
        { label: null, major: 0, time: 1498608000 },
        { label: null, major: 0, time: 1498694400 },
        { label: null, major: 0, time: 1498780800 },
        { label: null, major: 0, time: 1498867200 },
      ];

      expect(result).toStrictEqual(expectedResult);
    });

    it('should handle ranges of between 35 days and a year', () => {
      expect.assertions(1);
      const result = timeSeriesTicks(1497871283, 1497871283 + 86400 * 35 * 1.5);

      const expectedResult = [
        { label: null, major: 0, time: 1497830400 },
        { label: null, major: 0, time: 1498435200 },
        { label: 'Jul', major: 2, time: 1498867201 },
        { label: null, major: 0, time: 1499040000 },
        { label: null, major: 0, time: 1499644800 },
        { label: null, major: 0, time: 1500249600 },
        { label: null, major: 0, time: 1500854400 },
        { label: null, major: 0, time: 1501459200 },
        { label: 'Aug', major: 2, time: 1501545601 },
        { label: null, major: 0, time: 1502064000 },
        { label: null, major: 0, time: 1502668800 },
      ];

      expect(result).toStrictEqual(expectedResult);
    });

    it('should return ticks for every month of the year', () => {
      expect.assertions(1);
      const result = timeSeriesTicks(1531414873, 1561140074);

      const expectedLabels = [
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
      ];

      const labels = result.filter(({ label }) => label).map(({ label }) => label);

      expect(labels).toStrictEqual(expectedLabels);
    });

    it('should handle ranges of years', () => {
      expect.assertions(1);
      const result = timeSeriesTicks(1456790400, 1494073200);

      const expectedResult = [
        { label: null, major: 0, time: 1456790400 },
        { label: null, major: 0, time: 1459468800 },
        { label: null, major: 0, time: 1462060800 },
        { label: null, major: 0, time: 1464739200 },
        { label: 'H2', major: 1, time: 1467331200 },
        { label: null, major: 0, time: 1470009600 },
        { label: null, major: 0, time: 1472688000 },
        { label: null, major: 0, time: 1475280000 },
        { label: null, major: 0, time: 1477958400 },
        { label: null, major: 0, time: 1480550400 },
        { label: '2017', major: 2, time: 1483228800 },
        { label: null, major: 0, time: 1485907200 },
        { label: null, major: 0, time: 1488326400 },
        { label: null, major: 0, time: 1491004800 },
        { label: null, major: 0, time: 1493596800 },
      ];

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('getMonthDatesList', () => {
    it('should get a list of dates at the end of each month', () => {
      expect.assertions(1);
      const startDate = new Date('2018-01-01');
      const endDate = new Date('2018-07-01');

      expect(getMonthDatesList(startDate, endDate)).toStrictEqual([
        new Date('2018-01-31T23:59:59.999Z'),
        new Date('2018-02-28T23:59:59.999Z'),
        new Date('2018-03-31T23:59:59.999Z'),
        new Date('2018-04-30T23:59:59.999Z'),
        new Date('2018-05-31T23:59:59.999Z'),
        new Date('2018-06-30T23:59:59.999Z'),
        new Date('2018-07-31T23:59:59.999Z'),
      ]);
    });

    it('should return an empty array if both dates are in the same month', () => {
      expect.assertions(1);
      expect(getMonthDatesList(new Date('2018-01-03'), new Date('2018-01-29'))).toStrictEqual([]);
    });

    describe.each`
      timezone
      ${'UTC'}
      ${'Europe/London'}
    `('when operating in $timezone', ({ timezone }) => {
      beforeAll(() => {
        timezoneMock.register(timezone);
      });

      afterAll(() => {
        timezoneMock.unregister();
      });

      const winterWinterList = [
        '2019-10-31',
        '2019-11-30',
        '2019-12-31',
        '2020-01-31',
        '2020-02-29',
      ];

      const winterSummerList = [
        '2020-02-29',
        '2020-03-31',
        '2020-04-30',
        '2020-05-31',
        '2020-06-30',
      ];

      const summerSummerList = ['2020-06-30', '2020-07-31', '2020-08-31'];

      const summerWinterList = ['2020-08-31', '2020-09-30', '2020-10-31', '2020-11-30'];

      it.each`
        case                                | startTime       | endTime         | expectedResult
        ${'both dates in winter time'}      | ${'2019-10-31'} | ${'2020-02-29'} | ${winterWinterList}
        ${'crossing from winter to summer'} | ${'2020-02-29'} | ${'2020-06-30'} | ${winterSummerList}
        ${'both dates in summer time'}      | ${'2020-06-30'} | ${'2020-08-31'} | ${summerSummerList}
        ${'crossing from summer to winter'} | ${'2020-08-31'} | ${'2020-11-30'} | ${summerWinterList}
      `('should handle $case', ({ startTime, endTime, expectedResult }) => {
        expect.assertions(1);

        const result = getMonthDatesList(new Date(startTime), new Date(endTime));
        expect(result).toStrictEqual(
          expectedResult.map((date: string) => endOfMonth(new Date(date))),
        );
      });
    });
  });
});
