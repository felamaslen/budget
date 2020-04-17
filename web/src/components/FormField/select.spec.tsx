import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import FormFieldSelect, { Props } from './select';

describe('<FormFieldSelect />', () => {
  const props = {
    onChange: jest.fn(),
  };
  const propsSpecific: Props<'something' | 'else'> = {
    ...props,
    options: [
      { internal: 'something', external: 'Something' },
      { internal: 'else', external: 'My option' },
    ],
    value: 'something',
  };

  it('should render a select with value', () => {
    const { container } = render(<FormFieldSelect<'something' | 'else'> {...propsSpecific} />);
    const select = container.querySelector('select') as HTMLSelectElement;

    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');
  });

  it('should render all options', () => {
    const { container } = render(<FormFieldSelect {...propsSpecific} />);
    const options = container.querySelectorAll('option');

    expect(options).toHaveLength(2);

    expect(options[0].value).toBe('something');
    expect(options[1].value).toBe('else');

    expect(options[0]).toHaveTextContent('Something');
    expect(options[1]).toHaveTextContent('My option');
  });

  it('should call onChange when the select value is changed', () => {
    const { container } = render(<FormFieldSelect {...propsSpecific} />);
    const select = container.querySelector('select') as HTMLSelectElement;

    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.change(select, { target: { value: 'else' } });
    });

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith('else');
  });

  it('should update the value if the available options changes', () => {
    const optionsA = [{ internal: 'A' }, { internal: 'B' }, { internal: 'C' }];
    const optionsB = optionsA.slice(0, 2);
    const optionsC = optionsA.slice(0, 1);

    const { container } = render(<FormFieldSelect {...props} options={optionsA} value="B" />);
    const select = container.querySelector('select') as HTMLSelectElement;

    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');

    act(() => {
      fireEvent.change(select, { target: { value: 'C' } });
    });

    expect(props.onChange).toHaveBeenCalledWith('C');

    act(() => {
      render(<FormFieldSelect {...props} options={optionsC} value="B" />, { container });
    });

    // Change required, as C is no longer a valid option
    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange.mock.calls[1]).toEqual(['A']);

    act(() => {
      render(<FormFieldSelect {...props} options={optionsB} value="A" />, { container });
    });
    act(() => {
      render(<FormFieldSelect {...props} options={optionsC} value="A" />, { container });
    });

    // Change not required, as A is still in the options set
    expect(props.onChange).toHaveBeenCalledTimes(2);
  });
});
