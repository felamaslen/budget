import { render } from '@testing-library/react';
import React from 'react';
import { FundNameMobile } from './mobile';

describe('<FundNameMobile />', () => {
  const props = {
    value: 'Monks Investment Trust Ordinary 5p (share)',
  };

  it('should render an abbreviated fund name', () => {
    expect.assertions(1);
    const { getByText } = render(<FundNameMobile {...props} />);
    expect(getByText('MNKS')).toBeInTheDocument();
  });
});
