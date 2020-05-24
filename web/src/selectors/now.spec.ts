import { getNow, getCurrentDate } from '~client/selectors/now';
import { testState as state } from '~client/test-data/state';

describe('now selector', () => {
  describe('getNow', () => {
    it('should get the current time from the state', () => {
      expect.assertions(1);
      expect(getNow({ ...state, now: new Date('2020-04-20') })).toStrictEqual(
        new Date('2020-04-20'),
      );
    });
  });
  describe('getCurrentDate', () => {
    it('should get the end of the current day', () => {
      expect.assertions(1);
      expect(
        getCurrentDate({
          ...state,
          now: new Date('2018-03-23T11:53:23Z'),
        }),
      ).toStrictEqual(new Date('2018-03-23T23:59:59.999Z'));
    });

    it("getCurrentDate does not reload the result if the day doesn't change", () => {
      expect.assertions(1);
      const result = getCurrentDate(state);

      const nextResult = getCurrentDate({ ...state, now: new Date('2018-03-23T12:32:02Z') });

      // notice this equality check is shallow, i.e. by reference, so if the date had
      // been recalculated, this test would fail :)
      expect(nextResult).toBe(result);
    });
  });
});
