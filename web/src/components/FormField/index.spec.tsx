import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import FormFieldText from '~client/components/FormField';

describe('<FormFieldText />', () => {
  const props = {
    value: 'foo',
    onChange: jest.fn(),
    onType: jest.fn(),
  };

  it('should render a text input with the initial value', async () => {
    const { findByDisplayValue } = render(<FormFieldText {...props} />);
    const input = await findByDisplayValue('foo');

    expect(input).toBeInTheDocument();
  });

  describe('if inactive', () => {
    it('should not render an input', () => {
      const { container } = render(<FormFieldText {...props} active={false} />);
      expect(container.querySelector('input')).toBeFalsy();
    });

    it('should render the value as a string', async () => {
      const { container } = render(<FormFieldText {...props} active={false} />);
      expect(container).toHaveTextContent('foo');
    });
  });

  it('should call onChange when changing the value, after the blur', async () => {
    const { findByDisplayValue } = render(<FormFieldText {...props} />);
    const input = await findByDisplayValue('foo');

    fireEvent.change(input, { target: { value: 'bar' } });
    expect(props.onChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith('bar');
  });

  it('should call onType when changing the value, before the blur', async () => {
    const { findByDisplayValue } = render(<FormFieldText {...props} />);
    const input = await findByDisplayValue('foo');

    expect(props.onType).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'b' } });
    expect(props.onType).toHaveBeenCalledTimes(1);
    expect(props.onType).toHaveBeenCalledWith('b');

    fireEvent.blur(input);
    expect(props.onType).toHaveBeenCalledTimes(1);
  });
});
