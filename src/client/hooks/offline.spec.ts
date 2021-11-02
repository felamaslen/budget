import { act, renderHook } from '@testing-library/react-hooks';
import { useOffline } from './offline';

describe(useOffline.name, () => {
  it('should return the offline state as false', () => {
    expect.assertions(2);
    const { result } = renderHook(useOffline);
    const [offline, wasOffline] = result.current;
    expect(offline).toBe(false);
    expect(wasOffline).toBe(false);
  });

  describe('when the page goes offline', () => {
    it('should set offline to true', () => {
      expect.assertions(2);
      const { result } = renderHook(useOffline);

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      const [offline, wasOffline] = result.current;
      expect(offline).toBe(true);
      expect(wasOffline).toBe(true);
    });
  });

  describe('when the page comes back online', () => {
    it('should set offline to false, but keep wasOffline as true', () => {
      expect.assertions(2);
      const { result } = renderHook(useOffline);

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      const [offline, wasOffline] = result.current;
      expect(offline).toBe(false);
      expect(wasOffline).toBe(true);
    });
  });
});
