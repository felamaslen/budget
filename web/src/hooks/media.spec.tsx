import { act, render, waitFor } from '@testing-library/react';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';

import { useMediaQuery, useIsMobile } from './media';
import { breakpoints } from '~client/styled/variables';

describe('useMediaQuery', () => {
  const testQuery = '(max-width: 480px)';
  const testQueryComplement = '(min-width: 481px)';

  const TestComponent: React.FC = () => {
    const matches = useMediaQuery(testQuery);

    return <span>{matches ? 'matches' : 'does not match'}</span>;
  };

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
    const { getByText } = render(<TestComponent />);
    expect(getByText('does not match')).toBeInTheDocument();
  });

  it('should return true if the query does match', async () => {
    expect.assertions(1);
    matchMedia.useMediaQuery(testQuery);
    const { getByText } = render(<TestComponent />);
    await waitFor(() => {
      expect(getByText('matches')).toBeInTheDocument();
    });
  });

  it('should handle the case when the match status changes', async () => {
    expect.assertions(2);
    matchMedia.useMediaQuery(testQueryComplement);
    const { getByText } = render(<TestComponent />);
    expect(getByText('does not match')).toBeInTheDocument();

    act(() => {
      matchMedia.useMediaQuery(testQuery);
    });

    await waitFor(() => {
      expect(getByText('matches')).toBeInTheDocument();
    });
  });

  describe('useIsMobile', () => {
    const TestIsMobile: React.FC = () => {
      const isMobile = useIsMobile();

      return <span>{isMobile ? 'mobile' : 'not mobile'}</span>;
    };

    it(`should return true at less than ${breakpoints.mobile}px`, () => {
      expect.assertions(1);
      matchMedia.useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`);
      const { getByText } = render(<TestIsMobile />);
      expect(getByText('mobile')).toBeInTheDocument();
    });

    it(`should return false at ${breakpoints.mobile}px or above`, () => {
      expect.assertions(1);
      matchMedia.useMediaQuery(`(min-width: ${breakpoints.mobile}px)`);
      const { getByText } = render(<TestIsMobile />);
      expect(getByText('not mobile')).toBeInTheDocument();
    });
  });
});
