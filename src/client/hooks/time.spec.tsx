import { render, RenderResult, act } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';
import endOfSecond from 'date-fns/endOfSecond';
import startOfSecond from 'date-fns/startOfSecond';
import React, { useEffect } from 'react';
import sinon from 'sinon';

import { useToday, useNow } from './time';

describe('Time hooks', () => {
  const now = new Date('2020-04-20T13:25:10.783Z');

  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });
  afterEach(() => {
    clock.restore();
  });

  const ticksToEndOfDay = endOfDay(now).getTime() - now.getTime();
  const ticksToEndOfSecond = endOfSecond(now).getTime() - now.getTime();

  describe.each`
    hook          | useHook     | roundTo     | roundFn          | ticksToNext
    ${'useToday'} | ${useToday} | ${'day'}    | ${endOfDay}      | ${ticksToEndOfDay}
    ${'useNow'}   | ${useNow}   | ${'second'} | ${startOfSecond} | ${ticksToEndOfSecond}
  `('$hook', ({ useHook, roundTo, roundFn, ticksToNext }) => {
    const callback = jest.fn();

    const TestComponent: React.FC = () => {
      const time = useHook();
      useEffect(() => {
        callback(time);
      }, [time]);

      return <span>{time.toISOString()}</span>;
    };

    const setup = (): RenderResult => render(<TestComponent />);

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
        clock.tick(ticksToNext - 1);
      });
      expect(callback).toHaveBeenCalledTimes(1);
      act(() => {
        clock.tick(1000);
      });
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });
});
