import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import React from 'react';

import FormFieldCost from './cost';

describe('<FormFieldCost />', () => {
  const props = {
    active: true,
    value: 10345,
    onChange: jest.fn(),
  };

  it('should render an input with the value (in pounds)', async () => {
    const { findByDisplayValue } = render(<FormFieldCost {...props} />);
    const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('number');
    expect(input.step).toBe('0.01');
  });

  it('should call onChange when changing the value, after the blur', async () => {
    const { findByDisplayValue } = render(<FormFieldCost {...props} />);
    const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '10.93' } });

    expect(props.onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('10.93');

    fireEvent.blur(input);

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith(1093);
  });

  describe('when rendering inline', () => {
    it('should render as a text input', async () => {
      const { findByDisplayValue } = render(<FormFieldCost {...props} inline />);
      const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

      expect(input).toBeInTheDocument();
      expect(input.type).toBe('text');
    });

    it('should call onChange when deactivating', async () => {
      const { container, findByDisplayValue } = render(<FormFieldCost {...props} inline />);
      const input = (await findByDisplayValue('103.45')) as HTMLInputElement;

      act(() => {
        fireEvent.change(input, { target: { value: '229.119330' } });
      });

      expect(props.onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('229.119330');

      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).toHaveBeenCalledTimes(0);

      act(() => {
        render(<FormFieldCost {...props} inline active={false} />, { container });
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(22912);
      expect(input.value).toBe('229.119330');
    });

    describe('decimal fraction input', () => {
      const propsDecimal = { ...props, inline: true, value: undefined };

      const input = (renderProps: RenderResult): HTMLInputElement => {
        const element = renderProps.container.querySelector('input') as HTMLInputElement;
        expect(element).toBeTruthy();
        return element;
      };

      const testInputCharacter = (
        renderProps: RenderResult,
        value: string,
        changeTo: number,
      ): void => {
        const numCalls = propsDecimal.onChange.mock.calls.length;

        act(() => {
          fireEvent.change(input(renderProps), { target: { value } });
        });

        expect(input(renderProps).value).toBe(value);

        act(() => {
          render(<FormFieldCost {...propsDecimal} active={false} />, {
            container: renderProps.container,
          });
        });

        expect(propsDecimal.onChange).toHaveBeenCalledTimes(numCalls + 1);

        expect(propsDecimal.onChange.mock.calls[numCalls]).toEqual([changeTo]);

        act(() => {
          render(<FormFieldCost {...propsDecimal} active={true} />, {
            container: renderProps.container,
          });
        });
      };

      const testInput = (renderProps: RenderResult, value: string, changeTo: number[]): void => {
        const chars = value.split('');

        chars.forEach((_, index) =>
          testInputCharacter(renderProps, value.substring(0, index + 1), changeTo[index]),
        );
      };

      it('should start with an empty value', () => {
        const renderProps = render(<FormFieldCost {...propsDecimal} />);
        expect(input(renderProps).value).toBe('');
      });

      it('should handle a decimal fraction without zeroes', () => {
        const renderProps = render(<FormFieldCost {...propsDecimal} />);
        testInput(renderProps, '1.5', [100, 100, 150]);
      });

      it('should handle a decimal fraction with a zero in the middle', () => {
        const renderProps = render(<FormFieldCost {...propsDecimal} />);
        testInput(renderProps, '1.05', [100, 100, 100, 105]);
      });

      it('should handle turning an integer into a decimal fraction', () => {
        const renderProps = render(<FormFieldCost {...propsDecimal} />);
        testInputCharacter(renderProps, '1', 100);
        testInputCharacter(renderProps, '10', 1000);
        testInputCharacter(renderProps, '100', 10000);
        testInputCharacter(renderProps, '1005', 100500);
        testInputCharacter(renderProps, '1.005', 101);
      });

      it('should handle a decimal fraction less than 1', () => {
        const renderProps = render(<FormFieldCost {...propsDecimal} />);
        testInputCharacter(renderProps, '.', 0);
        testInputCharacter(renderProps, '.3', 30);
      });

      it('should handle a decimal fraction less than 1 with a 0 in the middle', () => {
        const renderProps = render(<FormFieldCost {...propsDecimal} />);
        testInputCharacter(renderProps, '.', 0);
        testInputCharacter(renderProps, '.0', 0);
        testInputCharacter(renderProps, '.05', 5);
      });

      it('should handle invalid input', () => {
        const renderProps = render(<FormFieldCost {...propsDecimal} />);

        act(() => {
          fireEvent.change(input(renderProps), { target: { value: 'not-a-number' } });
        });
        act(() => {
          render(<FormFieldCost {...propsDecimal} active={false} />, {
            container: renderProps.container,
          });
        });

        expect(props.onChange).not.toHaveBeenCalled();
      });

      it('should not overwrite on invalid input', () => {
        const renderProps = render(<FormFieldCost {...propsDecimal} />);

        act(() => {
          fireEvent.change(input(renderProps), { target: { value: '1.5' } });
        });
        act(() => {
          fireEvent.change(input(renderProps), { target: { value: '1.5f' } });
        });

        expect(input(renderProps).value).toBe('1.5');

        act(() => {
          render(<FormFieldCost {...propsDecimal} active={false} />, {
            container: renderProps.container,
          });
        });

        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onChange).toHaveBeenCalledWith(150);
      });
    });
  });
});
