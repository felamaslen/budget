import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import MatchMediaMock from 'jest-matchmedia-mock';

import { useMediaQuery, useIsMobile } from './media';
import { breakpoints } from '~client/styled/variables';

describe('useMediaQuery', () => {
  const testQuery = '(max-width: 480px)';
  const testQueryComplement = '(min-width: 481px)';

  let matchMedia: MatchMediaMock;

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  it('should return false if the query does not match', () => {
    expect.assertions(1);
    matchMedia.useMediaQuery(testQueryComplement);
    const { result } = renderHook(() => useMediaQuery(testQuery));
    expect(result.current).toBe(false);
  });

  it('should return true if the query does match', () => {
    expect.assertions(1);
    matchMedia.useMediaQuery(testQuery);
    const { result } = renderHook(() => useMediaQuery(testQuery));
    expect(result.current).toBe(true);
  });

  it('should change the result when the match status changes', () => {
    expect.assertions(2);
    matchMedia.useMediaQuery(testQueryComplement);
    const { result } = renderHook(() => useMediaQuery(testQuery));
    expect(result.current).toBe(false);

    act(() => {
      matchMedia.useMediaQuery(testQuery);
    });

    expect(result.current).toBe(true);
  });

  describe('useIsMobile', () => {
    it(`should return true at less than ${breakpoints.mobile}px`, () => {
      expect.assertions(1);
      matchMedia.useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`);
      const { result } = renderHook(useIsMobile);
      expect(result.current).toBe(true);
    });

    it(`should return false at ${breakpoints.mobile}px or above`, () => {
      expect.assertions(1);
      matchMedia.useMediaQuery(`(min-width: ${breakpoints.mobile}px)`);
      const { result } = renderHook(useIsMobile);
      expect(result.current).toBe(false);
    });
  });
});
