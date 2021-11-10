import { waitFor } from '@testing-library/react';
import { act, renderHook, RenderHookResult } from '@testing-library/react-hooks';

import { FieldOptions, Result, useField } from './field';

describe(useField.name, () => {
  const onChange = jest.fn();
  const myFieldOptions: FieldOptions<string, React.ChangeEvent<HTMLInputElement>> = {
    value: 'my-initial-value',
    onChange,
  };

  it('should set currentValue to the initial value', () => {
    expect.assertions(1);
    const { result } = renderHook(() => useField(myFieldOptions));
    expect(result.current.currentValue).toBe('my-initial-value');
  });

  it('should set inputValue to the initial value', () => {
    expect.assertions(1);
    const { result } = renderHook(() => useField(myFieldOptions));
    expect(result.current.inputValue).toBe('my-initial-value');
  });

  describe('when changing the input value', () => {
    const setup = (
      extraFieldOptions: Partial<FieldOptions<string, React.ChangeEvent<HTMLInputElement>>> = {},
    ): RenderHookResult<
      FieldOptions<string, React.ChangeEvent<HTMLInputElement>>,
      Result<string, React.ChangeEvent<HTMLInputElement>>
    > => {
      const hookResult = renderHook<
        FieldOptions<string, React.ChangeEvent<HTMLInputElement>>,
        Result<string, React.ChangeEvent<HTMLInputElement>>
      >((props) => useField(props), { initialProps: { ...myFieldOptions, ...extraFieldOptions } });

      act(() => {
        hookResult.result.current.onChange({
          target: { value: 'new-value' } as React.ChangeEvent<HTMLInputElement>['target'],
        } as React.ChangeEvent<HTMLInputElement>);
      });

      return hookResult;
    };

    it('should set the currentValue to the changed value', () => {
      expect.assertions(1);
      const { result } = setup();
      expect(result.current.currentValue).toBe('new-value');
    });

    it('should set the inputValue to the changed value', () => {
      expect.assertions(1);
      const { result } = setup();
      expect(result.current.inputValue).toBe('new-value');
    });

    it('should call onChange only after onBlur is called', () => {
      expect.assertions(3);
      const { result } = setup();

      expect(onChange).not.toHaveBeenCalled();
      act(() => {
        result.current.onBlur();
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('new-value');
    });

    describe('if the immediate option is set', () => {
      it('should not wait for the blur to call onChange', () => {
        expect.assertions(3);
        const { result } = setup({ immediate: true });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('new-value');

        act(() => {
          result.current.onBlur();
        });

        expect(onChange).toHaveBeenCalledTimes(1);
      });

      it('should not call onChange as a result of an external change', () => {
        expect.assertions(3);

        const { rerender, result } = renderHook<
          FieldOptions<string, React.ChangeEvent<HTMLInputElement>>,
          Result<string, React.ChangeEvent<HTMLInputElement>>
        >((props) => useField(props), {
          initialProps: { ...myFieldOptions, immediate: true, value: 'old-value' },
        });

        expect(result.current.inputValue).toBe('old-value');

        act(() => {
          rerender({ ...myFieldOptions, immediate: true, value: 'new-value' });
        });

        expect(result.current.inputValue).toBe('new-value');
        expect(onChange).not.toHaveBeenCalled();
      });
    });

    it('should work on generalised "inputs"', () => {
      expect.assertions(4);

      type MyGeneralValue = {
        complex: number;
        field: string;
      };

      type MyGeneralChangeEvent = MyGeneralValue;

      const oldValue: MyGeneralValue = { complex: 201, field: 'old-field' };
      const newValue: MyGeneralValue = { complex: 1983, field: 'new-field' };

      const { result } = renderHook<
        FieldOptions<MyGeneralValue, MyGeneralChangeEvent>,
        Result<MyGeneralValue, MyGeneralChangeEvent>
      >((props) => useField(props), {
        initialProps: {
          value: oldValue,
          onChange,
          immediate: true,
        },
      });

      expect(result.current.currentValue).toBe(oldValue);

      act(() => {
        result.current.onChange(newValue);
      });

      expect(result.current.currentValue).toBe(newValue);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(newValue);
    });
  });

  describe('when calling onBlur', () => {
    it('should not call onChange if the input value did not change', () => {
      expect.assertions(1);
      const { result } = renderHook(() => useField(myFieldOptions));
      act(() => {
        result.current.onBlur();
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('when cancelling the input', () => {
    const setup = (): RenderHookResult<
      FieldOptions<string>,
      Result<string, React.ChangeEvent<HTMLInputElement>>
    > => {
      const hookResult = renderHook<
        FieldOptions<string>,
        Result<string, React.ChangeEvent<HTMLInputElement>>
      >(useField, {
        initialProps: {
          ...myFieldOptions,
          value: 'old-value',
        },
      });

      act(() => {
        hookResult.result.current.onChange({
          target: { value: 'new-value' } as React.ChangeEvent<HTMLInputElement>['target'],
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        hookResult.result.current.onCancel();
      });

      return hookResult;
    };

    it('should not call onChange', () => {
      expect.assertions(1);
      setup();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should restore the original input value', () => {
      expect.assertions(1);
      const { result } = setup();
      expect(result.current.inputValue).toBe('old-value');
    });
  });

  describe('when the input is displayed inline', () => {
    describe('when setting the field to active', () => {
      it('should focus and select the input ref', async () => {
        expect.hasAssertions();
        const { rerender, result } = renderHook<
          FieldOptions<string>,
          Result<string, React.ChangeEvent<HTMLInputElement>>
        >(useField, {
          initialProps: {
            ...myFieldOptions,
            inline: true,
            active: false,
          },
        });

        const inputRef = result.current.inputRef;
        inputRef.current = document.createElement('input');
        inputRef.current.value = result.current.inputValue;

        const focusSpy = jest.spyOn(inputRef.current, 'focus');

        act(() => {
          rerender({ ...myFieldOptions, inline: true, active: true, value: 'old-value' });
        });

        await waitFor(() => {
          expect(focusSpy).toHaveBeenCalledTimes(1);
          expect(inputRef.current?.selectionStart).toBe(0);
          expect(inputRef.current?.selectionEnd).toBe('my-initial-value'.length);
        });
      });
    });

    describe('when setting the field to inactive', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      const setup = (
        newValue = myFieldOptions.value,
      ): RenderHookResult<
        FieldOptions<string>,
        Result<string, React.ChangeEvent<HTMLInputElement>>
      > => {
        const hookResult = renderHook<
          FieldOptions<string>,
          Result<string, React.ChangeEvent<HTMLInputElement>>
        >(useField, {
          initialProps: {
            ...myFieldOptions,
            inline: true,
            active: true,
          },
        });

        act(() => {
          hookResult.result.current.onChange({
            target: { value: newValue } as React.ChangeEvent<HTMLInputElement>['target'],
          } as React.ChangeEvent<HTMLInputElement>);
        });

        jest.advanceTimersByTime(100);

        act(() => {
          hookResult.rerender({ ...myFieldOptions, inline: true, active: false });
        });

        return hookResult;
      };

      it('should not blur the input ref', async () => {
        expect.assertions(1);
        const { result } = setup();
        result.current.inputRef.current = document.createElement('input');
        const blurSpy = jest.spyOn(result.current.inputRef.current, 'blur');
        act(() => {
          jest.runAllTimers();
        });
        expect(blurSpy).not.toHaveBeenCalled();
      });

      describe('if the value was updated', () => {
        it('should keep the new inputValue', () => {
          expect.assertions(1);
          const { result } = setup('new-value');
          expect(result.current.inputValue).toBe('new-value');
        });

        it('should not call onChange', () => {
          expect.assertions(1);
          setup('new-value');
          expect(onChange).not.toHaveBeenCalled();
        });
      });
    });

    describe('when manually blurring the input', () => {
      const setup = (
        newValue = myFieldOptions.value,
      ): RenderHookResult<
        FieldOptions<string>,
        Result<string, React.ChangeEvent<HTMLInputElement>>
      > => {
        const hookResult = renderHook<
          FieldOptions<string>,
          Result<string, React.ChangeEvent<HTMLInputElement>>
        >(useField, {
          initialProps: {
            ...myFieldOptions,
            inline: true,
          },
        });

        act(() => {
          hookResult.result.current.onChange({
            target: { value: newValue } as React.ChangeEvent<HTMLInputElement>['target'],
          } as React.ChangeEvent<HTMLInputElement>);
        });

        act(() => {
          hookResult.result.current.onBlur();
        });

        return hookResult;
      };

      describe('if the value was not updated', () => {
        it('should not call onChange', () => {
          expect.assertions(1);
          setup();
          expect(onChange).not.toHaveBeenCalled();
        });
      });

      describe('if the value was updated', () => {
        it('should call onChange', () => {
          expect.assertions(2);
          setup('new-value');
          expect(onChange).toHaveBeenCalledTimes(1);
          expect(onChange).toHaveBeenCalledWith('new-value');
        });
      });
    });

    describe('when the value of the field was updated externally', () => {
      const setup = async (): Promise<
        RenderHookResult<FieldOptions<string>, Result<string, React.ChangeEvent<HTMLInputElement>>>
      > => {
        const hookResult = renderHook<
          FieldOptions<string>,
          Result<string, React.ChangeEvent<HTMLInputElement>>
        >(useField, {
          initialProps: {
            ...myFieldOptions,
            inline: true,
          },
        });

        act(() => {
          hookResult.rerender({
            ...myFieldOptions,
            inline: true,
            active: true,
          });
        });

        await new Promise<void>((resolve) =>
          setTimeout(() => {
            hookResult.rerender({
              ...myFieldOptions,
              inline: true,
              active: true,
              value: 'new-value',
            });
            resolve();
          }, 0),
        );

        return hookResult;
      };

      it('should update the input value accordingly', async () => {
        expect.assertions(1);
        const { result } = await setup();
        expect(result.current.inputValue).toBe('new-value');
      });
    });
  });
});
