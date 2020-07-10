import endOfDay from 'date-fns/endOfDay';
import isSameSecond from 'date-fns/isSameSecond';
import startOfSecond from 'date-fns/startOfSecond';
import { createContext, Context, useState, useRef, useEffect } from 'react';

import { IDENTITY } from '~client/modules/data';

function timeHookFactory(roundFn: (date: Date) => Date = IDENTITY): [() => Date, Context<Date>] {
  const useTime = (): Date => {
    const [time, setTime] = useState<Date>(roundFn(new Date()));
    const timer = useRef<number>(0);
    useEffect(() => {
      clearInterval(timer.current);
      timer.current = setInterval(() => {
        setTime((last) => {
          const nextTime = roundFn(new Date());
          return isSameSecond(nextTime, last) ? last : nextTime;
        });
      }, 1000);

      return (): void => clearInterval(timer.current);
    }, []);

    return time;
  };

  const TimeContext: Context<Date> = createContext(roundFn(new Date()));

  return [useTime, TimeContext];
}

const [useToday, TodayContext] = timeHookFactory(endOfDay);
export { useToday, TodayContext };

const [useNow, NowContext] = timeHookFactory(startOfSecond);
export { useNow, NowContext };
