import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { FormFieldCost, FormFieldCostInline } from './cost';

describe('<FormFieldCost />', () => {
  const props = {
    active: false,
    value: 10345,
    onChange: jest.fn(),
  };

  it('should render an input with the value (in pounds)', async () => {
    expect.assertions(3);
    const { findByDisplayValue } = render(<FormFieldCost {...props} />);
    const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('number');
    expect(input.step).toBe('0.01');
  });

  it('should call onChange when changing the value, after the blur', async () => {
    expect.assertions(4);
    const { findByDisplayValue } = render(<FormFieldCost {...props} />);
    const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

    userEvent.type(input, '{selectall}{backspace}10.93');

    expect(props.onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('10.93');

    userEvent.tab();

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith(1093);
  });

  it('should accept a placeholder', () => {
    expect.assertions(1);
    const { getByDisplayValue } = render(
      <FormFieldCost {...props} inputProps={{ placeholder: 'my placeholder' }} />,
    );
    const input = getByDisplayValue('103.45') as HTMLInputElement;
    expect(input.placeholder).toBe('my placeholder');
  });

  describe.each`
    case            | Component
    ${'non-inline'} | ${FormFieldCost}
    ${'inline'}     | ${FormFieldCostInline}
  `('when rendering $case', ({ Component }) => {
    it('should render a pound symbol before the input', () => {
      expect.assertions(1);
      const { container } = render(<Component {...props} />);
      expect(container).toHaveTextContent('£');
    });
  });

  describe('when rendering inline', () => {
    it('should render as a text input', async () => {
      expect.assertions(2);
      const { findByDisplayValue } = render(<FormFieldCostInline {...props} />);
      const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

      expect(input).toBeInTheDocument();
      expect(input.type).toBe('text');
    });

    it('should call onChange on blur', () => {
      expect.assertions(5);
      const { getByDisplayValue } = render(<FormFieldCostInline {...props} />);
      const input = getByDisplayValue('103.45') as HTMLInputElement;

      userEvent.type(input, '{selectall}{backspace}229.119330');

      expect(props.onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('229.119330');

      userEvent.tab();

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(22912);
      expect(input.value).toBe('229.12');
    });

    it('should update the input value if the external value changes', () => {
      expect.assertions(3);
      const { container, getByDisplayValue } = render(<FormFieldCostInline {...props} />);
      const input = getByDisplayValue('103.45') as HTMLInputElement;

      userEvent.type(input, '{selectall}{backspace}229.119330');

      expect(input.value).toBe('229.119330');

      act(() => {
        render(<FormFieldCostInline {...props} value={undefined} />, { container });
      });

      expect(props.onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('');
    });

    describe.each`
      value    | initial    | fixed
      ${100}   | ${'1'}     | ${'1.00'}
      ${140}   | ${'1.4'}   | ${'1.40'}
      ${150}   | ${'1.5'}   | ${'1.50'}
      ${199}   | ${'1.99'}  | ${'1.99'}
      ${199.6} | ${'1.996'} | ${'2.00'}
    `('when rendering the value $initial with trailing zeroes', ({ value, initial, fixed }) => {
      it('should render a fixed value if initially inactive', () => {
        expect.assertions(1);
        const { getByDisplayValue } = render(
          <FormFieldCostInline {...props} value={value} active={false} />,
        );
        expect(getByDisplayValue(fixed)).toBeInTheDocument();
      });

      it('should convert an input value to a fixed value when deactivating', () => {
        expect.assertions(4);
        const { getByDisplayValue, container } = render(
          <FormFieldCostInline {...props} value={undefined} active={true} />,
        );

        const input = getByDisplayValue('') as HTMLInputElement;

        userEvent.type(input, `{selectall}{backspace}${initial}`);

        expect(input.value).toBe(initial);

        userEvent.tab();

        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onChange).toHaveBeenCalledWith(Math.round(value));

        act(() => {
          render(<FormFieldCostInline {...props} value={Math.round(value)} active={false} />, {
            container,
          });
        });

        expect(input.value).toBe(fixed);
      });

      it('should not convert to a fixed value on blur', () => {
        expect.assertions(2);
        const { getByDisplayValue } = render(
          <FormFieldCostInline {...props} value={value} active={false} />,
        );

        const input = getByDisplayValue(fixed) as HTMLInputElement;

        userEvent.type(input, `{selectall}{backspace}${initial}`);

        expect(input.value).toBe(initial);

        userEvent.tab();

        expect(input.value).toBe(fixed);
      });

      it('should keep the fixed value upon reactivating', () => {
        expect.assertions(1);
        const { getByDisplayValue, container } = render(
          <FormFieldCostInline {...props} value={undefined} active={true} />,
        );

        const input = getByDisplayValue('') as HTMLInputElement;

        userEvent.type(input, `{selectall}{backspace}${initial}`);
        userEvent.tab();
        act(() => {
          render(<FormFieldCostInline {...props} value={Math.round(value)} active={false} />, {
            container,
          });
        });
        act(() => {
          render(<FormFieldCostInline {...props} value={Math.round(value)} active={true} />, {
            container,
          });
        });

        expect(input.value).toBe(fixed);
      });
    });

    describe('when entering an empty string', () => {
      const setup = (): HTMLInputElement => {
        const { getByDisplayValue } = render(<FormFieldCostInline {...props} />);
        const input = getByDisplayValue('103.45') as HTMLInputElement;

        userEvent.type(input, '{selectall}{backspace}');

        return input;
      };

      it('should clear the input box', () => {
        expect.assertions(1);
        const input = setup();

        expect(input.value).toBe('');
      });

      it('should reset the input on blur, and not call onChange', () => {
        expect.assertions(2);
        const input = setup();

        userEvent.tab();

        expect(input.value).toBe('103.45');
        expect(props.onChange).not.toHaveBeenCalled();
      });
    });

    describe('decimal fraction input', () => {
      const propsDecimal = { ...props, value: undefined, label: 'cost-input' };

      it('should start with an empty value', () => {
        expect.assertions(1);
        const renderProps = render(<FormFieldCostInline {...propsDecimal} />);
        const input = renderProps.getByDisplayValue('') as HTMLInputElement;
        expect(input.value).toBe('');
      });

      it.each`
        case                              | value      | expectedCalls
        ${'without zeroes'}               | ${'1.5'}   | ${[100, 150]}
        ${'with a zero in the middle'}    | ${'1.05'}  | ${[100, 105]}
        ${'when less than 1'}             | ${'.3'}    | ${[0, 30]}
        ${'when less than 1 with a zero'} | ${'.05'}   | ${[0, 5]}
        ${'when the value is negative'}   | ${'-1.09'} | ${[-100, -109]}
      `(
        'should handle the case $case',
        ({ value, expectedCalls }: { value: string; expectedCalls: number[] }) => {
          expect.assertions(expectedCalls.length + 1);

          const { getByLabelText } = render(<FormFieldCostInline {...propsDecimal} />);
          const input = getByLabelText('cost-input') as HTMLInputElement;

          value.split('').forEach((_, index) => {
            userEvent.type(input, `{selectall}{backspace}${value.substring(0, index + 1)}`);
            userEvent.tab();
          });

          expect(propsDecimal.onChange).toHaveBeenCalledTimes(expectedCalls.length);
          expectedCalls.forEach((expectedCall, index) => {
            expect(propsDecimal.onChange).toHaveBeenNthCalledWith(index + 1, expectedCall);
          });
        },
      );

      it('should handle the case from an integer to a float (after initial activation of int)', () => {
        expect.assertions(3);
        const { getByLabelText } = render(<FormFieldCostInline {...propsDecimal} />);
        const input = getByLabelText('cost-input') as HTMLInputElement;

        userEvent.type(input, '{selectall}{backspace}1005');
        userEvent.tab();

        userEvent.type(
          input,
          '{end}{backspace}{backspace}{backspace}{arrowLeft}{arrowLeft}{arrowLeft}.',
        );
        userEvent.tab();

        expect(propsDecimal.onChange).toHaveBeenCalledTimes(2);
        expect(propsDecimal.onChange).toHaveBeenNthCalledWith(1, 100500);
        expect(propsDecimal.onChange).toHaveBeenNthCalledWith(2, 101);
      });

      it('should handle invalid input', () => {
        expect.assertions(2);
        const renderProps = render(<FormFieldCostInline {...propsDecimal} />);
        const input = renderProps.getByDisplayValue('') as HTMLInputElement;

        userEvent.type(input, 'not-a-number');
        userEvent.tab();

        expect(props.onChange).not.toHaveBeenCalled();
        expect(input.value).toBe('');
      });

      it('should not overwrite on invalid input', () => {
        expect.assertions(3);
        const renderProps = render(<FormFieldCostInline {...propsDecimal} />);
        const input = renderProps.getByDisplayValue('') as HTMLInputElement;

        userEvent.type(input, '1.5f');

        expect(input.value).toBe('1.5');

        userEvent.tab();

        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onChange).toHaveBeenCalledWith(150);
      });
    });
  });
});
