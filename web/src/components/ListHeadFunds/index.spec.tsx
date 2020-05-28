import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import React from 'react';

import { ListHeadFunds } from '.';
import { Period } from '~client/constants/graph';

describe('<ListHeadFunds />', () => {
  const props = {
    totalCost: 400000,
    viewSoldFunds: false,
    period: Period.year1,
    cachedValue: {
      ageText: '3 hours ago',
      value: 399098,
      dayGain: 0.0329,
      dayGainAbs: 9964.92,
    },
    onViewSoldToggle: jest.fn(),
    onReloadPrices: jest.fn(),
    setSort: jest.fn(),
  };

  const setup = (): RenderResult => render(<ListHeadFunds {...props} />);

  it.each`
    thing                        | value
    ${'current value'}           | ${'£4k'}
    ${'overall (absolute) gain'} | ${'(£9)'}
    ${'overall (relative) gain'} | ${'(0.23%)'}
    ${'daily (absolute) gain'}   | ${'£100'}
    ${'daily (relative) gain'}   | ${'3.29%'}
  `('should render the $thing', ({ value }) => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText(value)).toBeInTheDocument();
  });

  it('should reload fund prices on click', () => {
    expect.assertions(1);
    const { getByRole } = setup();
    const button = getByRole('button');

    act(() => {
      fireEvent.click(button);
    });

    expect(props.onReloadPrices).toHaveBeenCalledTimes(1);
  });

  it('should call an onViewSoldToggle function when a tickbox is toggled', () => {
    expect.assertions(3);
    const { getByRole, container } = setup();

    const tickbox = getByRole('checkbox') as HTMLInputElement;
    expect(tickbox.checked).toBe(false);

    act(() => {
      fireEvent.click(tickbox);
    });

    expect(props.onViewSoldToggle).toHaveBeenCalledTimes(1);

    act(() => {
      render(<ListHeadFunds {...props} viewSoldFunds />, { container });
    });

    expect(tickbox.checked).toBe(true);
  });
});
