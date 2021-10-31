import { act, render } from '@testing-library/react';
import { renderHook, RenderHookResult } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { CTAEvents, useCTA } from './cta';

describe(useCTA.name, () => {
  const onActivate = jest.fn();

  const setup = (): RenderHookResult<unknown, CTAEvents<HTMLElement>> =>
    renderHook(() => useCTA(onActivate));

  beforeEach(() => {
    jest.useFakeTimers();
  });

  describe('onClick event', () => {
    it('should call onActivate when run', () => {
      expect.assertions(1);
      const { result } = setup();
      result.current.onClick({} as React.MouseEvent<HTMLElement>);

      expect(onActivate).toHaveBeenCalledTimes(1);
    });
  });

  describe('onKeyDown event', () => {
    it('should call onActivate when run with the enter key', () => {
      expect.assertions(1);
      const { result } = setup();
      result.current.onKeyDown({ key: 'Enter' } as React.KeyboardEvent<HTMLElement>);

      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it('should not call onActivate when run without the enter key', () => {
      expect.assertions(1);
      const { result } = setup();
      result.current.onKeyDown({ key: 'F' } as React.KeyboardEvent<HTMLElement>);

      expect(onActivate).not.toHaveBeenCalled();
    });
  });

  describe('when onClick and onKeyDown coincide', () => {
    it('should only call onActivate once', async () => {
      expect.assertions(2);
      jest.useFakeTimers();
      const { result } = setup();

      result.current.onClick({} as React.MouseEvent<HTMLElement>);
      result.current.onKeyDown({ key: 'Enter' } as React.KeyboardEvent<HTMLElement>);

      expect(onActivate).toHaveBeenCalledTimes(1);

      jest.runAllTimers();
      expect(onActivate).toHaveBeenCalledTimes(1);
    });
  });

  describe('when stopPropagation is false', () => {
    it('should let click events bubble', () => {
      expect.assertions(2);

      const onButtonClick = jest.fn();
      const onDivClick = jest.fn();

      const TestComponent: React.FC = () => {
        const buttonClickEvents = useCTA(onButtonClick, { stopPropagation: false });
        return (
          // eslint-disable-next-line
          <div onClick={onDivClick}>
            <button {...buttonClickEvents}>Click me</button>
          </div>
        );
      };

      const { getByRole } = render(<TestComponent />);
      act(() => {
        userEvent.click(getByRole('button'));
      });

      expect(onButtonClick).toHaveBeenCalledTimes(1);
      expect(onDivClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('when stopPropagation is true', () => {
    it('should stop click events from bubbling', () => {
      expect.assertions(2);

      const onButtonClick = jest.fn();
      const onDivClick = jest.fn();

      const TestComponent: React.FC = () => {
        const buttonClickEvents = useCTA(onButtonClick, { stopPropagation: true });
        return (
          // eslint-disable-next-line
          <div onClick={onDivClick}>
            <button {...buttonClickEvents}>Click me</button>
          </div>
        );
      };

      const { getByRole } = render(<TestComponent />);
      act(() => {
        userEvent.click(getByRole('button'));
      });

      expect(onButtonClick).toHaveBeenCalledTimes(1);
      expect(onDivClick).not.toHaveBeenCalled();
    });
  });
});
