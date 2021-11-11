import endOfDay from 'date-fns/endOfDay';
import isSameSecond from 'date-fns/isSameSecond';
import startOfSecond from 'date-fns/startOfSecond';
import { createContext, Context, FC, useState, useRef, useEffect, useContext } from 'react';

import { IDENTITY } from '~client/modules/data';

function timeHookFactory(roundFn: (date: Date) => Date = IDENTITY): [FC, () => Date] {
  const useTimeInit = (): Date => {
    const [time, setTime] = useState<Date>(roundFn(new Date()));
    const timer = useRef<number>(0);
    useEffect(() => {
      clearInterval(timer.current);
      timer.current = window.setInterval(() => {
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
  const useTime = (): Date => useContext(TimeContext);

  const Provider: FC = ({ children }) => {
    const time = useTimeInit();
    return <TimeContext.Provider value={time}>{children}</TimeContext.Provider>;
  };

  return [Provider, useTime];
}

const [TodayProvider, useToday] = timeHookFactory(endOfDay);
export { useToday, TodayProvider };

const [NowProvider, useNow] = timeHookFactory(startOfSecond);
export { useNow, NowProvider };
