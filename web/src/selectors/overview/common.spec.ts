import endOfDay from 'date-fns/endOfDay';
import timezoneMock from 'timezone-mock';

import { State } from '~client/reducers';
import {
  getStartDate,
  getEndDate,
  getNumMonths,
  getFutureMonths,
  getMonthDates,
} from '~client/selectors/overview/common';
import { testState as state } from '~client/test-data/state';
import { PageNonStandard } from '~client/types/enum';

describe('Overview selectors (common)', () => {
  describe('getStartDate', () => {
    it('should get the start date', () => {
      expect.assertions(1);
      expect(getStartDate(state)).toStrictEqual(new Date('2018-01-31T23:59:59.999Z'));
    });
  });

  describe('getEndDate', () => {
    it('should get the end date', () => {
      expect.assertions(1);
      expect(getEndDate(state)).toStrictEqual(new Date('2018-07-31T23:59:59.999Z'));
    });
  });

  describe('getNumMonths', () => {
    it('should get the number of months in overview views, given the start and end date', () => {
      expect.assertions(1);
      expect(getNumMonths(state)).toBe(7);
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

      it.each`
        case                                | startTime       | endTime         | expectedResult
        ${'both dates in winter time'}      | ${'2019-10-31'} | ${'2020-02-29'} | ${5}
        ${'crossing from winter to summer'} | ${'2020-02-29'} | ${'2020-06-30'} | ${5}
        ${'both dates in summer time'}      | ${'2020-06-30'} | ${'2020-08-31'} | ${3}
        ${'crossing from summer to winter'} | ${'2020-08-31'} | ${'2020-11-30'} | ${4}
      `('should handle $case', ({ startTime, endTime, expectedResult }) => {
        expect.assertions(1);

        const stateWithStartEndTime: State = {
          ...state,
          [PageNonStandard.Overview]: {
            ...state[PageNonStandard.Overview],
            startDate: endOfDay(new Date(startTime)),
            endDate: endOfDay(new Date(endTime)),
          },
        };

        const result = getNumMonths(stateWithStartEndTime);
        expect(result).toBe(expectedResult);
      });
    });
  });

  describe('getFutureMonths', () => {
    it('should calculate the number of months in the future there are, based on the current date', () => {
      expect.assertions(5);
      expect(getFutureMonths(new Date('2018-03-23T11:45:20Z'))(state)).toBe(4);

      expect(getFutureMonths(new Date('2018-03-31T15:20Z'))(state)).toBe(4);

      expect(getFutureMonths(new Date('2018-03-31T22:59Z'))(state)).toBe(4);

      expect(getFutureMonths(new Date('2018-04-01T00:00Z'))(state)).toBe(3);

      expect(
        getFutureMonths(new Date('2019-07-28T12:01:32Z'))({
          ...state,
          overview: {
            ...state.overview,
            endDate: new Date('2020-07-31T23:59:59.999Z'),
          },
        }),
      ).toBe(12);
    });
  });

  describe('getMonthDates', () => {
    it('should get a list of dates at the end of each month', () => {
      expect.assertions(1);
      expect(getMonthDates(state)).toStrictEqual([
        new Date('2018-01-31T23:59:59.999Z'),
        new Date('2018-02-28T23:59:59.999Z'),
        new Date('2018-03-31T23:59:59.999Z'),
        new Date('2018-04-30T23:59:59.999Z'),
        new Date('2018-05-31T23:59:59.999Z'),
        new Date('2018-06-30T23:59:59.999Z'),
        new Date('2018-07-31T23:59:59.999Z'),
      ]);
    });
  });
});
