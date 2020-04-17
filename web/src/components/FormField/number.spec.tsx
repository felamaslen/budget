import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';

import FormFieldNumber from './number';

describe('<FormFieldNumber />', () => {
  const props = {
    value: 103.45,
    onChange: jest.fn(),
  };

  it('should render an input with the value', async () => {
    const { findByDisplayValue } = render(<FormFieldNumber {...props} />);
    const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('number');
  });

  it('should call onChange when changing the value, after the blur', async () => {
    const { findByDisplayValue } = render(<FormFieldNumber {...props} />);
    const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '10.93' } });

    expect(props.onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('10.93');

    fireEvent.blur(input);

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith(10.93);
  });

  it('should update its input value when the value prop changes', async () => {
    const { container, findByDisplayValue } = render(<FormFieldNumber {...props} />);
    const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

    expect(input.value).toBe('103.45');

    act(() => {
      render(<FormFieldNumber {...props} value={103.46} />, { container });
    });

    expect(input.value).toBe('103.46');
  });
});
