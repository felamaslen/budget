import { render, RenderResult, act } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';
import endOfSecond from 'date-fns/endOfSecond';
import startOfSecond from 'date-fns/startOfSecond';
import { useEffect } from 'react';

import { NowProvider, TodayProvider, useNow, useToday } from './time';

describe('time hooks', () => {
  const now = new Date('2020-04-20T13:25:10.783Z');
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  const ticksToEndOfDay = endOfDay(now).getTime() - now.getTime();
  const ticksToEndOfSecond = endOfSecond(now).getTime() - now.getTime();

  describe.each`
    hook          | useHook     | Provider         | roundTo     | roundFn          | ticksToNext
    ${'useToday'} | ${useToday} | ${TodayProvider} | ${'day'}    | ${endOfDay}      | ${ticksToEndOfDay}
    ${'useNow'}   | ${useNow}   | ${NowProvider}   | ${'second'} | ${startOfSecond} | ${ticksToEndOfSecond}
  `('$hook', ({ Provider, useHook, roundTo, roundFn, ticksToNext }) => {
    const callback = jest.fn();

    const Child: React.FC = () => {
      const time = useHook();
      useEffect(() => {
        callback(time);
      }, [time]);

      return <span>{time.toISOString()}</span>;
    };

    const Parent: React.FC = () => (
      <Provider>
        <Child />
      </Provider>
    );

    const setup = (): RenderResult => render(<Parent />);

    it(`should return the current time, rounded to the ${roundTo}`, () => {
      expect.assertions(1);
      const { container } = setup();
      expect(container).toHaveTextContent(roundFn(now).toISOString());
    });

    it('should not change the date instance until the second changes', () => {
      expect.assertions(3);
      setup();
      expect(callback).toHaveBeenCalledTimes(1);
      act(() => {
        jest.advanceTimersByTime(ticksToNext - 1);
      });
      expect(callback).toHaveBeenCalledTimes(1);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });
});
