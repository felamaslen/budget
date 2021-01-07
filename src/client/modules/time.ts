import moize from 'moize';

export type TimeKey = 'month' | 'today' | 'now';

type TimedFunction<T> = (time: Date) => T;
type KeyedTimedFunction<T> = (time: Date, key: TimeKey) => T;

export function memoiseNowAndToday<T>(
  fn: KeyedTimedFunction<T>,
): Record<TimeKey, TimedFunction<T>> {
  const month = moize((time: Date) => fn(time, 'month'), { maxSize: 1 });
  const today = moize((time: Date) => fn(time, 'today'), { maxSize: 1 });
  const now = moize((time: Date) => fn(time, 'now'), { maxSize: 1 });

  return { month, today, now };
}
