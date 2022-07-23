import { act, renderHook } from '@testing-library/react';
import { useWindowFocus } from './focus';

describe(useWindowFocus.name, () => {
  const onFocus = jest.fn();

  it('should fire onFocus when the browser regains focus, with the time since last focus', () => {
    expect.assertions(4);
    jest.useFakeTimers();

    renderHook(() => useWindowFocus(onFocus));

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledWith(0);

    act(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    jest.advanceTimersByTime(1562);

    act(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(onFocus).toHaveBeenCalledTimes(2);
    expect(onFocus).toHaveBeenNthCalledWith(2, 1562);
  });
});
