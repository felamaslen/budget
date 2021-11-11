import { render, fireEvent } from '@testing-library/react';

import { FormFieldRange } from './range';

describe('<FormFieldRange />', () => {
  const props = {
    value: 103.45,
    onChange: jest.fn(),
  };

  it('should render a range input with the value', () => {
    expect.assertions(2);
    const { getByRole } = render(<FormFieldRange {...props} />);
    const input = getByRole('slider') as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('range');
  });

  it('should call onChange when changing the value', () => {
    expect.assertions(2);
    const { getByRole } = render(<FormFieldRange {...props} />);
    const input = getByRole('slider') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '10.93' } });

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith(10.93);
  });
});
