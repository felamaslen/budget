import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';

import { FormFieldColor } from './color';

describe('<FormFieldColor />', () => {
  const props = {
    value: '#aa09b3',
    onChange: jest.fn(),
  };

  it('should render a color input', () => {
    expect.assertions(1);
    const { getByDisplayValue } = render(<FormFieldColor {...props} />);
    const input = getByDisplayValue('#aa09b3') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when changing the value, without waiting for blur', async () => {
    expect.assertions(2);
    const { getByDisplayValue } = render(<FormFieldColor {...props} />);
    const input = getByDisplayValue('#aa09b3') as HTMLInputElement;

    act(() => {
      fireEvent.change(input, { target: { value: '#aa83b9' } });
    });

    expect(props.onChange).toHaveBeenCalledWith('#aa83b9');

    act(() => {
      fireEvent.blur(input);
    });

    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it('should update its input value when the value prop changes', async () => {
    expect.assertions(2);
    const { container, getByDisplayValue } = render(<FormFieldColor {...props} />);
    const input = getByDisplayValue('#aa09b3') as HTMLInputElement;

    expect(input.value).toBe('#aa09b3');

    act(() => {
      render(<FormFieldColor {...props} value="#123654" />, { container });
    });

    expect(input.value).toBe('#123654');
  });
});
