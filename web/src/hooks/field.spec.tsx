import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import React from 'react';

import { useField } from '~client/hooks/field';

describe('Field hook', () => {
  type Props = {
    value: string;
    onChange: (value: string) => void;
    isString?: boolean;
  };

  const props: Props = {
    value: 'my-initial-value',
    onChange: jest.fn(),
  };

  const TestComponent: React.FC<Props> = ({ value, onChange, isString = false }) => {
    const [active, setActive] = React.useState<boolean>(false);
    const [focused, setFocused] = React.useState<boolean>(false);

    const [currentValue, inputValue, onChangeInput, inputRef, onBlurInput] = useField({
      value,
      onChange,
      active,
      string: isString,
    });

    const onFocus = React.useCallback(() => setFocused(true), []);
    const onBlur = React.useCallback(() => {
      setFocused(false);
      onBlurInput();
    }, [onBlurInput]);

    return (
      <div>
        <span data-testid="current-value">{currentValue}</span>
        <span data-testid="input-value">{inputValue}</span>
        <input
          ref={inputRef}
          data-testid="input"
          onChange={onChangeInput}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <button
          data-testid="button-activate-toggle"
          onClick={(): void => setActive(last => !last)}
        />
        <span data-testid="focus-status">{focused ? 'true' : 'false'}</span>
      </div>
    );
  };

  it('should set currentValue to the initial value', async () => {
    const { findByTestId } = render(<TestComponent {...props} />);
    expect(await findByTestId('current-value')).toHaveTextContent('my-initial-value');
  });

  it('should set inputValue to the initial value', async () => {
    const { findByTestId } = render(<TestComponent {...props} />);
    expect(await findByTestId('input-value')).toHaveTextContent('my-initial-value');
  });

  describe('when calling onChangeInput', () => {
    const setup = async (): Promise<RenderResult> => {
      const renderProps = render(<TestComponent {...props} />);
      const input = await renderProps.findByTestId('input');

      act(() => {
        fireEvent.change(input, { target: { value: 'new-value' } });
      });

      return renderProps;
    };

    it('should set the currentValue to the changed value', async () => {
      const { findByTestId } = await setup();
      expect(await findByTestId('current-value')).toHaveTextContent('new-value');
    });

    it('should set the inputValue to the changed value', async () => {
      const { findByTestId } = await setup();
      expect(await findByTestId('input-value')).toHaveTextContent('new-value');
    });

    it('should NOT immediately call onChange', async () => {
      await setup();
      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('should call onChange after blurring the input', async () => {
      const { findByTestId } = await setup();
      const input = await findByTestId('input');
      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).toHaveBeenCalledWith('new-value');
    });
  });

  describe('when blurring the input', () => {
    const setup = async (): Promise<RenderResult> => {
      const renderProps = render(<TestComponent {...props} />);
      const input = await renderProps.findByTestId('input');

      act(() => {
        fireEvent.blur(input);
      });

      return renderProps;
    };

    it('should focus and select the input ref', async () => {
      await setup();
      expect(props.onChange).toHaveBeenCalledWith('my-initial-value');
    });
  });

  describe('when the input is of "string" type', () => {
    describe('when setting the field to active', () => {
      const setup = async (): Promise<RenderResult> => {
        const renderProps = render(<TestComponent {...props} isString />);
        const activateButton = await renderProps.findByTestId('button-activate-toggle');

        act(() => {
          fireEvent.click(activateButton);
        });

        return renderProps;
      };

      it('should focus and select the input ref', async () => {
        const { findByTestId } = await setup();
        const focusStatus = await findByTestId('focus-status');

        expect(focusStatus).toHaveTextContent('true');
      });
    });

    describe('when setting the field to inactive', () => {
      const setup = async (): Promise<RenderResult> => {
        const renderProps = render(<TestComponent {...props} isString />);
        const activateButton = await renderProps.findByTestId('button-activate-toggle');

        act(() => {
          fireEvent.click(activateButton);
        });

        await new Promise(resolve => {
          setImmediate(() => {
            act(() => {
              fireEvent.click(activateButton);
            });
            resolve();
          });
        });

        return renderProps;
      };

      it('should blur the input ref', async () => {
        const { findByTestId } = await setup();
        const focusStatus = await findByTestId('focus-status');

        expect(focusStatus).toHaveTextContent('false');
      });

      it('should not call onChange', async () => {
        await setup();
        expect(props.onChange).not.toHaveBeenCalled();
      });
    });
  });
});
