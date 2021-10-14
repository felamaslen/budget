import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { FormFieldTickbox } from './tickbox';

describe('<FormFieldTickbox />', () => {
  const props = {
    item: 'my-tickbox',
    value: true,
    onChange: jest.fn(),
  };

  it('should render an input', () => {
    expect.assertions(3);
    const { getByTestId } = render(<FormFieldTickbox {...props} />);
    const input = getByTestId('checkbox') as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(true);
  });

  it('should call onChange when toggled', () => {
    expect.assertions(3);
    const { container, getByTestId } = render(<FormFieldTickbox {...props} />);
    const input = getByTestId('checkbox') as HTMLInputElement;

    expect(props.onChange).not.toHaveBeenCalled();

    userEvent.click(input);

    expect(props.onChange).toHaveBeenCalledWith(false);
    props.onChange.mockReset();

    act(() => {
      render(<FormFieldTickbox {...props} value={false} />, { container });
    });

    userEvent.click(input);

    expect(props.onChange).toHaveBeenCalledWith(true);
  });
});
