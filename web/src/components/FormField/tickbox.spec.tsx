import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import FormFieldTickbox from './tickbox';

describe('<FormFieldTickbox />', () => {
  const props = {
    item: 'my-tickbox',
    value: true,
    onChange: jest.fn(),
  };

  it('should render an input', () => {
    const { getByRole } = render(<FormFieldTickbox {...props} />);
    const input = getByRole('checkbox') as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(true);
  });

  it('should call onChange when toggled', () => {
    const { container, getByRole } = render(<FormFieldTickbox {...props} />);
    const input = getByRole('checkbox') as HTMLInputElement;

    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.click(input);
    });

    expect(props.onChange).toHaveBeenCalledWith(false);
    props.onChange.mockReset();

    act(() => {
      render(<FormFieldTickbox {...props} value={false} />, { container });
    });

    act(() => {
      fireEvent.click(input);
    });

    expect(props.onChange).toHaveBeenCalledWith(true);
  });
});
