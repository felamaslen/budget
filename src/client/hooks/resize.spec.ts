import { act, renderHook } from '@testing-library/react-hooks';
import { useDebouncedResize } from './resize';

jest.mock('~client/modules/ssr', () => ({
  isServerSide: false,
}));

describe(useDebouncedResize.name, () => {
  it('should return the current window width, debounced', () => {
    expect.assertions(3);
    jest.useFakeTimers();

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1285,
    });

    const { result } = renderHook(useDebouncedResize);

    expect(result.current).toBe(1285);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(1285);

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current).toBe(1440);
  });
});
