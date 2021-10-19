import { render, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PinDisplay, Props } from './pin-display';

describe('<PinDisplay />', () => {
  const props: Props = {
    inputStep: 2,
    onFocus: jest.fn(),
    onInput: jest.fn(),
  };

  const setup = (): RenderResult => render(<PinDisplay {...props} />);

  it('should render four input boxes', () => {
    expect.assertions(1);
    const { getAllByRole } = setup();

    const inputs = getAllByRole('spinbutton');
    expect(inputs).toHaveLength(4);
  });

  it('should focus the selected input box based on the inputStep prop', async () => {
    expect.hasAssertions();
    const { getAllByRole } = setup();
    await waitFor(() => {
      expect(getAllByRole('spinbutton')[2]).toHaveFocus();
    });
  });

  it('should call onInput when typing', async () => {
    expect.hasAssertions();
    const onInput = jest.fn();
    const { getAllByRole } = render(<PinDisplay {...props} inputStep={1} onInput={onInput} />);
    await waitFor(() => {
      expect(getAllByRole('spinbutton')[1]).toHaveFocus();
    });

    userEvent.keyboard('7');

    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onInput).toHaveBeenCalledWith(7, 1);
  });
});
