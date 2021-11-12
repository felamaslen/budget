import { renderHook } from '@testing-library/react-hooks';
import { FC } from 'react';
import { Context as ResponsiveContext } from 'react-responsive';

import { useIsMobile } from './media';
import { breakpoints } from '~client/styled/variables';

describe(useIsMobile.name, () => {
  describe(`when the screen is less than ${breakpoints.mobile}px wide`, () => {
    const Wrapper: FC = ({ children }) => (
      <ResponsiveContext.Provider value={{ width: breakpoints.mobile - 1 }}>
        {children}
      </ResponsiveContext.Provider>
    );

    it('should return true', () => {
      expect.assertions(1);
      const { result } = renderHook(useIsMobile, { wrapper: Wrapper });
      expect(result.current).toBe(true);
    });
  });

  describe.each`
    case              | width
    ${'exactly'}      | ${breakpoints.mobile}
    ${'greater than'} | ${breakpoints.mobile + 1}
  `(`when the screen is $case ${breakpoints.mobile}px wide`, ({ width }) => {
    const Wrapper: FC = ({ children }) => (
      <ResponsiveContext.Provider value={{ width }}>{children}</ResponsiveContext.Provider>
    );

    it('should return false', () => {
      expect.assertions(1);
      const { result } = renderHook(useIsMobile, { wrapper: Wrapper });
      expect(result.current).toBe(false);
    });
  });
});
