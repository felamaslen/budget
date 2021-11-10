import { render, act, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormFieldSelect, PropsSelect, SelectOptions } from './select';

describe('<FormFieldSelect />', () => {
  const props = {
    onChange: jest.fn(),
  };
  const propsSpecific: PropsSelect<'something' | 'else'> = {
    ...props,
    options: [
      { internal: 'something', external: 'Something' },
      { internal: 'else', external: 'My option' },
    ],
    value: 'something',
  };

  it('should render a select with value', () => {
    expect.assertions(2);
    const { container } = render(<FormFieldSelect<'something' | 'else'> {...propsSpecific} />);
    const select = container.querySelector('select') as HTMLSelectElement;

    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');
  });

  it('should render all options', () => {
    expect.assertions(5);
    const { container } = render(<FormFieldSelect {...propsSpecific} />);
    const options = container.querySelectorAll('option');

    expect(options).toHaveLength(2);

    expect(options[0].value).toBe('Something');
    expect(options[1].value).toBe('My option');

    expect(options[0]).toHaveTextContent('Something');
    expect(options[1]).toHaveTextContent('My option');
  });

  it('should call onChange when the select value is changed', () => {
    expect.assertions(3);
    const { container } = render(<FormFieldSelect {...propsSpecific} />);
    const select = container.querySelector('select') as HTMLSelectElement;

    expect(props.onChange).not.toHaveBeenCalled();

    userEvent.selectOptions(select, 'My option');

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith('else');
  });

  it('should update the value if the available options changes', () => {
    expect.assertions(6);
    const optionsA = [{ internal: 'A' }, { internal: 'B' }, { internal: 'C' }];
    const optionsB = [{ internal: 'A' }, { internal: 'B' }];
    const optionsC = [{ internal: 'A' }];

    const { container } = render(<FormFieldSelect {...props} options={optionsA} value="B" />);
    const select = container.querySelector('select') as HTMLSelectElement;

    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');

    userEvent.selectOptions(select, 'C');

    expect(props.onChange).toHaveBeenCalledWith('C');

    act(() => {
      render(<FormFieldSelect {...props} options={optionsC} value="B" />, { container });
    });

    // Change required, as C is no longer a valid option
    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenCalledWith('A');

    act(() => {
      render(<FormFieldSelect {...props} options={optionsB} value="A" />, { container });
    });
    act(() => {
      render(<FormFieldSelect {...props} options={optionsC} value="A" />, { container });
    });

    // Change not required, as A is still in the options set
    expect(props.onChange).toHaveBeenCalledTimes(2);
  });

  describe('when the option type is generic', () => {
    type ComplexObject = {
      foo: string;
      bar: number;
    };

    const optionsGeneric: SelectOptions<ComplexObject> = [
      { internal: { foo: 'yes', bar: 0 }, external: 'The first option' },
      { internal: { foo: 'no', bar: 1 }, external: 'This is second option' },
    ];

    const propsGeneric = {
      options: optionsGeneric,
      value: optionsGeneric[0].internal,
      onChange: jest.fn(),
    };

    const setupGeneric = (): RenderResult => render(<FormFieldSelect {...propsGeneric} />);

    it('should call onChange with the generic value', () => {
      expect.assertions(1);
      const { getByDisplayValue } = setupGeneric();
      const input = getByDisplayValue('The first option') as HTMLSelectElement;
      userEvent.selectOptions(input, 'This is second option');

      expect(propsGeneric.onChange).toHaveBeenCalledWith({ foo: 'no', bar: 1 });
    });
  });
});
