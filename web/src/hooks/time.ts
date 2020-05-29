import endOfDay from 'date-fns/endOfDay';
import isSameSecond from 'date-fns/isSameSecond';
import startOfSecond from 'date-fns/startOfSecond';
import { useState, useRef, useEffect } from 'react';

import { IDENTITY } from '~client/modules/data';

function timeHookFactory(roundFn: (date: Date) => Date = IDENTITY): () => Date {
  return function useTime(): Date {
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
}

export const useTime = timeHookFactory(startOfSecond);
export const useToday = timeHookFactory(endOfDay);
