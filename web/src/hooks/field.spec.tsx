import { render, fireEvent, act, RenderResult, waitFor } from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import { useField } from './field';

describe('Field hook', () => {
  type Props = {
    value: string;
    onChange: (value: string) => void;
    inline?: boolean;
    immediate?: boolean;
  };

  const props: Props = {
    value: 'my-initial-value',
    onChange: jest.fn(),
  };

  const TestComponent: React.FC<Props> = ({
    value,
    onChange,
    inline = false,
    immediate = false,
  }) => {
    const [active, setActive] = React.useState<boolean>(false);

    const {
      currentValue,
      inputValue,
      onChange: onChangeInput,
      inputRef,
      onBlur,
      onCancel,
    } = useField({
      value,
      onChange,
      active,
      inline,
      immediate,
    });

    return (
      <div>
        <span data-testid="current-value">{currentValue}</span>
        <span data-testid="input-value">{inputValue}</span>
        <input
          ref={inputRef}
          value={inputValue}
          data-testid="input"
          onChange={onChangeInput}
          onBlur={onBlur}
        />
        <button
          data-testid="button-activate-toggle"
          onClick={(): void => setActive((last) => !last)}
        />
        <button data-testid="button-cancel" onClick={(): void => onCancel()} />
      </div>
    );
  };

  it('should set currentValue to the initial value', () => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent {...props} />);
    expect(getByTestId('current-value')).toHaveTextContent('my-initial-value');
  });

  it('should set inputValue to the initial value', () => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent {...props} />);
    expect(getByTestId('input-value')).toHaveTextContent('my-initial-value');
  });

  describe('when changing the input value', () => {
    const setup = (customProps = {}): RenderResult => {
      const renderProps = render(<TestComponent {...props} {...customProps} />);
      const input = renderProps.getByTestId('input');

      act(() => {
        fireEvent.change(input, { target: { value: 'new-value' } });
      });

      return renderProps;
    };

    it('should set the currentValue to the changed value', () => {
      expect.assertions(1);
      const { getByTestId } = setup();
      expect(getByTestId('current-value')).toHaveTextContent('new-value');
    });

    it('should set the inputValue to the changed value', () => {
      expect.assertions(1);
      const { getByTestId } = setup();
      expect(getByTestId('input-value')).toHaveTextContent('new-value');
    });

    it('should NOT immediately call onChange', () => {
      expect.assertions(1);
      setup();
      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('should call onChange after blurring the input', () => {
      expect.assertions(1);
      const { getByTestId } = setup();
      const input = getByTestId('input');
      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).toHaveBeenCalledWith('new-value');
    });

    describe('if the immediate option is set', () => {
      it('should not wait for the blur to call onChange', () => {
        expect.assertions(2);
        const { getByTestId } = setup({ immediate: true });
        const input = getByTestId('input');
        expect(props.onChange).toHaveBeenCalledWith('new-value');
        act(() => {
          fireEvent.blur(input);
        });
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      it('should not call onChange as a result of an external change', () => {
        expect.assertions(3);
        const { container, getByTestId } = render(
          <TestComponent {...props} value="old-value" immediate={true} />,
        );
        const input = getByTestId('input') as HTMLInputElement;
        expect(input.value).toBe('old-value');
        act(() => {
          render(<TestComponent {...props} immediate={true} value="new-value" />, { container });
        });
        expect(props.onChange).not.toHaveBeenCalled();
        expect(input.value).toBe('new-value');
      });
    });

    it('should work on generalised "inputs"', () => {
      expect.assertions(2);

      type MyGeneralValue = {
        complex: number;
        field: string;
      };

      type MyGeneralChangeEvent = MyGeneralValue;

      const oldValue: MyGeneralValue = { complex: 201, field: 'old-field' };
      const newValue: MyGeneralValue = { complex: 1983, field: 'new-field' };

      const GeneralisedField: React.FC<{
        value: MyGeneralValue;
        onChange: (value: MyGeneralValue) => void;
      }> = (generalProps) => {
        const { currentValue, onChange } = useField<MyGeneralValue, MyGeneralChangeEvent>({
          ...generalProps,
          immediate: true,
        });

        return (
          <>
            <span data-testid="current-value">{JSON.stringify(currentValue)}</span>
            <button data-testid="test-button" onClick={(): void => onChange(newValue)} />
          </>
        );
      };

      const onChange = jest.fn();
      const { getByTestId } = render(<GeneralisedField value={oldValue} onChange={onChange} />);
      act(() => {
        fireEvent.click(getByTestId('test-button'));
      });

      expect(JSON.parse((getByTestId('current-value') as HTMLSpanElement).innerHTML)).toStrictEqual(
        newValue,
      );

      expect(onChange).toHaveBeenCalledWith(newValue);
    });
  });

  describe('when blurring the input', () => {
    const setup = (): RenderResult => {
      const renderProps = render(<TestComponent {...props} />);
      const input = renderProps.getByTestId('input');

      act(() => {
        fireEvent.blur(input);
      });

      return renderProps;
    };

    it('should not call onChange if the input value did not change', () => {
      expect.assertions(1);
      setup();
      expect(props.onChange).not.toHaveBeenCalled();
    });
  });

  describe('when cancelling the input', () => {
    const setup = (): RenderResult => {
      const renderProps = render(<TestComponent {...props} value="old-value" />);
      const cancelButton = renderProps.getByTestId('button-cancel');
      const input = renderProps.getByTestId('input');

      act(() => {
        fireEvent.change(input, { target: { value: 'new-value' } });
      });
      act(() => {
        fireEvent.click(cancelButton);
      });

      return renderProps;
    };

    it('should not call onChange', () => {
      expect.assertions(1);
      setup();
      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('should restore the original input value', () => {
      expect.assertions(1);
      const { getByTestId } = setup();
      expect((getByTestId('input') as HTMLInputElement).value).toBe('old-value');
    });
  });

  describe('when the input is displayed inline', () => {
    describe('when setting the field to active', () => {
      const setup = (): RenderResult => {
        const renderProps = render(<TestComponent {...props} inline />);
        const activateButton = renderProps.getByTestId('button-activate-toggle');

        act(() => {
          fireEvent.click(activateButton);
        });

        return renderProps;
      };

      it('should focus and select the input ref', async () => {
        expect.assertions(4);
        const { getByTestId } = setup();
        const input = getByTestId('input') as HTMLInputElement;
        await waitFor(() => {
          expect(document.activeElement).toBe(input);
          expect(input.selectionStart).toBe(0);
          expect(input.selectionEnd).toBe('my-initial-value'.length);
        });
      });
    });

    describe('when setting the field to inactive', () => {
      let clock: sinon.SinonFakeTimers;

      beforeEach(() => {
        clock = sinon.useFakeTimers();
      });
      afterEach(() => {
        clock.restore();
      });

      const setup = (newValue?: string): RenderResult => {
        const renderProps = render(<TestComponent {...props} inline />);
        const input = renderProps.getByTestId('input');
        const activateButton = renderProps.getByTestId('button-activate-toggle');

        act(() => {
          fireEvent.click(activateButton);
        });
        act(() => {
          fireEvent.focus(input);
        });

        if (newValue) {
          act(() => {
            fireEvent.change(input, { target: { value: 'new-value' } });
          });
        }

        clock.tick(100);

        act(() => {
          fireEvent.click(activateButton);
        });

        return renderProps;
      };

      it('should not blur the input ref', async () => {
        expect.assertions(1);
        const { getByTestId } = setup();
        const input = getByTestId('input');
        act(() => {
          clock.runAll();
        });
        await waitFor(() => {
          expect(document.activeElement).toBe(input);
        });
      });

      describe('if the value was updated', () => {
        it('should keep the new inputValue', () => {
          expect.assertions(1);
          const { getByTestId } = setup('new-value');
          expect((getByTestId('input') as HTMLInputElement).value).toBe('new-value');
        });

        it('should not call onChange', () => {
          expect.assertions(1);
          setup('new-value');
          expect(props.onChange).not.toHaveBeenCalled();
        });
      });
    });

    describe('when manually blurring the input', () => {
      const setup = (newValue?: string): RenderResult => {
        const renderProps = render(<TestComponent {...props} inline />);
        const input = renderProps.getByTestId('input');

        if (newValue) {
          act(() => {
            fireEvent.change(input, { target: { value: 'new-value' } });
          });
        }

        act(() => {
          fireEvent.blur(input);
        });

        return renderProps;
      };

      describe('if the value was not updated', () => {
        it('should not call onChange', () => {
          expect.assertions(1);
          setup();
          expect(props.onChange).not.toHaveBeenCalled();
        });
      });

      describe('if the value was updated', () => {
        it('should call onChange', () => {
          expect.assertions(1);
          setup('new-value');
          expect(props.onChange).toHaveBeenCalledWith('new-value');
        });
      });
    });

    describe('when the value of the field was updated externally', () => {
      const setup = async (): Promise<RenderResult> => {
        const renderProps = render(<TestComponent {...props} inline />);
        const activateButton = renderProps.getByTestId('button-activate-toggle');
        act(() => {
          fireEvent.click(activateButton);
        });

        await new Promise<void>((resolve) =>
          setImmediate(() => {
            render(<TestComponent {...props} inline value="new-value" />, {
              container: renderProps.container,
            });
            resolve();
          }),
        );

        return renderProps;
      };

      it('should update the input value accordingly', async () => {
        expect.assertions(1);
        const { getByTestId } = await setup();
        expect((getByTestId('input') as HTMLInputElement).value).toBe('new-value');
      });
    });
  });
});
