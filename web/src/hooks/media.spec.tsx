import { act, render, waitFor } from '@testing-library/react';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';

import { useMediaQuery } from './media';

describe('useMediaQuery', () => {
  const testQuery = '(max-width: 480px)';

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
    const { getByText } = render(<TestComponent />);
    expect(getByText('does not match')).toBeInTheDocument();
  });

  it('should return true if the query does match', async () => {
    expect.assertions(1);
    const { getByText } = render(<TestComponent />);
    act(() => {
      matchMedia.useMediaQuery(testQuery);
    });
    await waitFor(() => {
      expect(getByText('matches')).toBeInTheDocument();
    });
  });
});
