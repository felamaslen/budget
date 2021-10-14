import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { FormFieldNumber } from './number';

describe('<FormFieldNumber />', () => {
  const props = {
    value: 103.45,
    onChange: jest.fn(),
  };

  it('should render an input with the value', () => {
    expect.assertions(3);
    const { getByDisplayValue } = render(<FormFieldNumber {...props} />);
    const input = getByDisplayValue('103.45') as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('number');
    expect(input.inputMode).toBe('numeric');
  });

  it('should call onChange when changing the value, after the blur', () => {
    expect.assertions(4);
    const { getByDisplayValue } = render(<FormFieldNumber {...props} />);
    const input = getByDisplayValue('103.45') as HTMLInputElement;

    userEvent.clear(input);
    userEvent.type(input, '10.93');

    expect(props.onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('10.93');

    userEvent.tab();

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith(10.93);
  });

  it('should update its input value when the value prop changes', () => {
    expect.assertions(2);
    const { container, getByDisplayValue } = render(<FormFieldNumber {...props} />);
    const input = getByDisplayValue('103.45') as HTMLInputElement;

    expect(input.value).toBe('103.45');

    act(() => {
      render(<FormFieldNumber {...props} value={103.46} />, { container });
    });

    expect(input.value).toBe('103.46');
  });

  it('should accept a placeholder', () => {
    expect.assertions(1);
    const { getByDisplayValue } = render(
      <FormFieldNumber {...props} inputProps={{ placeholder: 'my placeholder' }} />,
    );
    const input = getByDisplayValue('103.45') as HTMLInputElement;
    expect(input.placeholder).toBe('my placeholder');
  });
});
