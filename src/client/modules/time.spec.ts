import { memoiseNowAndToday, TimeKey } from './time';

describe(memoiseNowAndToday.name, () => {
  const myTimedFunction = jest.fn((time: Date, key: TimeKey): { result: string } => ({
    result: `${key}_${time.toISOString()}`,
  }));
  const { today, now } = memoiseNowAndToday(myTimedFunction);

  it.each`
    fnType     | fn
    ${'today'} | ${today}
    ${'now'}   | ${now}
  `('should memoise the $fnType function', ({ fn, fnType }) => {
    expect.assertions(5);
    expect(myTimedFunction).not.toHaveBeenCalled();

    const time = new Date();

    const resultA = fn(time);
    expect(myTimedFunction).toHaveBeenCalledTimes(1);
    expect(myTimedFunction).toHaveBeenCalledWith(time, fnType);

    const resultB = fn(time);
    expect(myTimedFunction).toHaveBeenCalledTimes(1);

    expect(resultA).toBe(resultB);
  });

  it('should memoise today and now separately', () => {
    expect.assertions(8);

    const dateNow = new Date('2020-04-20T15:34:11.445Z');
    const dateToday = new Date('2020-04-20T23:59:59.999Z');

    expect(myTimedFunction).toHaveBeenCalledTimes(0);

    const resultNowA = now(dateNow);
    const resultNowB = now(dateNow);

    expect(myTimedFunction).toHaveBeenCalledTimes(1);

    const resultTodayA = today(dateToday);
    const resultTodayB = today(dateToday);

    expect(resultNowA).toBe(resultNowB);
    expect(resultTodayA).toBe(resultTodayB);

    expect(resultNowA).not.toBe(resultTodayA);

    expect(myTimedFunction).toHaveBeenCalledTimes(2);
    expect(myTimedFunction).toHaveBeenNthCalledWith(1, dateNow, 'now');
    expect(myTimedFunction).toHaveBeenNthCalledWith(2, dateToday, 'today');
  });
});
