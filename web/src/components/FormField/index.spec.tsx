import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';

import { FormFieldText, FormFieldTextInline } from '.';

describe('<FormFieldText />', () => {
  const props = {
    value: 'foo',
    onChange: jest.fn(),
    onType: jest.fn(),
  };

  it('should render a text input with the initial value', () => {
    expect.assertions(1);
    const { getByDisplayValue } = render(<FormFieldText {...props} />);
    const input = getByDisplayValue('foo');

    expect(input).toBeInTheDocument();
  });

  it('should accept an id prop', () => {
    expect.assertions(1);
    const { getByDisplayValue } = render(<FormFieldText {...props} id="my-field-id-101" />);
    const input = getByDisplayValue('foo') as HTMLInputElement;

    expect(input.id).toBe('my-field-id-101');
  });

  describe.each`
    case            | Component
    ${'non-inline'} | ${FormFieldText}
    ${'inline'}     | ${FormFieldTextInline}
  `('[as $case] for all cases', ({ Component }) => {
    it('should render per-instance children after the input', () => {
      expect.assertions(3);

      const { getByDisplayValue, getByText } = render(
        <Component {...props}>
          <span>foo child</span>
        </Component>,
      );

      const input = getByDisplayValue('foo');
      const child = getByText('foo child');

      let inputIndex = -1;
      let childIndex = -1;

      const childNodes = (input.parentNode?.childNodes as NodeListOf<HTMLElement>) ?? [];
      childNodes.forEach((node: HTMLElement, index: number) => {
        if (node === input) {
          inputIndex = index;
        } else if (node === child) {
          childIndex = index;
        }
      });

      expect(inputIndex).not.toBe(-1);
      expect(childIndex).not.toBe(-1);
      expect(childIndex).toBeGreaterThan(inputIndex);
    });
  });

  describe('when rendering inline', () => {
    it('should accept undefined as a value', () => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<FormFieldTextInline {...props} value={undefined} />);
      const input = getByDisplayValue('');
      expect(input).toBeInTheDocument();
    });

    it('should be a controlled input even if the initial value is undefined', () => {
      expect.assertions(2);

      const consoleSpy = jest.spyOn(global.console, 'error');
      const { getByDisplayValue } = render(<FormFieldTextInline {...props} value={undefined} />);
      const input = getByDisplayValue('') as HTMLInputElement;
      act(() => {
        fireEvent.change(input, { target: { value: 'some value' } });
      });

      expect(input.value).toBe('some value');
      // A warning is logged to the console if an uncontrolled input has its value changed in React,
      // but an error isn't thrown so we have to assert that the log wasn't called
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    describe('if no value has been entered on blur', () => {
      const setup = (): HTMLInputElement => {
        const { getByDisplayValue } = render(<FormFieldTextInline {...props} />);
        const input = getByDisplayValue('foo') as HTMLInputElement;
        act(() => {
          fireEvent.change(input, { target: { value: '' } });
        });
        return input;
      };

      it('should not call onChange', () => {
        expect.assertions(1);
        const input = setup();
        act(() => {
          fireEvent.blur(input);
        });

        expect(props.onChange).not.toHaveBeenCalled();
      });

      it('should reset the input value', () => {
        expect.assertions(2);
        const input = setup();
        expect(input.value).toBe('');
        act(() => {
          fireEvent.blur(input);
        });
        expect(input.value).toBe('foo');
      });
    });

    describe('if allowEmpty is set', () => {
      it('should call onChange with an empty value', () => {
        expect.assertions(2);
        const { getByDisplayValue } = render(<FormFieldTextInline {...props} allowEmpty />);
        const input = getByDisplayValue('foo');
        act(() => {
          fireEvent.change(input, { target: { value: '' } });
        });
        act(() => {
          fireEvent.blur(input);
        });

        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onChange).toHaveBeenCalledWith('');
      });
    });

    it.each`
      initialValue | initialInputValue
      ${undefined} | ${''}
      ${''}        | ${''}
      ${'f'}       | ${'f'}
    `(
      'should update the input value from $initialValue if the external value changes',
      ({ initialValue, initialInputValue }) => {
        expect.assertions(1);
        const { container, getByDisplayValue } = render(
          <FormFieldTextInline {...props} value={initialValue} />,
        );
        const input = getByDisplayValue(initialInputValue) as HTMLInputElement;
        act(() => {
          render(<FormFieldTextInline {...props} value="foo" />, { container });
        });
        expect(input.value).toBe('foo');
      },
    );
  });

  describe('if inactive', () => {
    it('should still render the input', () => {
      expect.assertions(1);
      const { container } = render(<FormFieldText {...props} active={false} />);
      expect(container.querySelector('input')).toBeInTheDocument();
    });
  });

  it('should call onChange when changing the value, after the blur', () => {
    expect.assertions(3);
    const { getByDisplayValue } = render(<FormFieldText {...props} />);
    const input = getByDisplayValue('foo');

    fireEvent.change(input, { target: { value: 'bar' } });
    expect(props.onChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith('bar');
  });

  it('should call onType when changing the value, before the blur', () => {
    expect.assertions(4);
    const { getByDisplayValue } = render(<FormFieldText {...props} />);
    const input = getByDisplayValue('foo');

    expect(props.onType).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'b' } });
    expect(props.onType).toHaveBeenCalledTimes(1);
    expect(props.onType).toHaveBeenCalledWith('b');

    fireEvent.blur(input);
    expect(props.onType).toHaveBeenCalledTimes(1);
  });

  it('should call an onFocus input prop when focusing manually', () => {
    expect.assertions(2);
    const onFocus = jest.fn();
    const { getByDisplayValue } = render(<FormFieldText {...props} inputProps={{ onFocus }} />);

    expect(onFocus).toHaveBeenCalledTimes(0);
    act(() => {
      fireEvent.focus(getByDisplayValue('foo'));
    });
    expect(onFocus).toHaveBeenCalledTimes(1);
  });
});
