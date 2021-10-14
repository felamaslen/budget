import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Digit } from './digit';

describe('<Digit />', () => {
  const props = {
    digit: 3,
    onInput: jest.fn(),
  };

  const setup = (): RenderResult => render(<Digit {...props} />);

  it('should render a button with the digit', () => {
    expect.assertions(2);
    const { getByRole } = setup();
    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('3');
  });

  it('should handle input', () => {
    expect.assertions(2);
    const { getByText } = setup();
    const button = getByText('3') as HTMLButtonElement;

    userEvent.click(button);

    expect(props.onInput).toHaveBeenCalledTimes(1);
    expect(props.onInput).toHaveBeenCalledWith(3);
  });
});
