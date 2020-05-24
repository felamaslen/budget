import { render, RenderResult, act, fireEvent } from '@testing-library/react';
import React from 'react';

import { useCTA } from './cta';

describe('useCTA', () => {
  const onActivate = jest.fn();
  const callback = jest.fn();

  const TestComponent: React.FC = () => {
    const result = useCTA(onActivate);
    React.useEffect(() => {
      callback(result);
    }, [result]);

    return <button {...result}>CTA button</button>;
  };

  const setup = (): RenderResult => render(<TestComponent />);

  describe('onClick event', () => {
    it('should be returned', () => {
      expect.assertions(1);
      setup();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          onClick: expect.any(Function),
        }),
      );
    });

    it('should call onActivate when run', () => {
      expect.assertions(1);
      const { getByRole } = setup();
      const button = getByRole('button');
      act(() => {
        fireEvent.click(button);
      });

      expect(onActivate).toHaveBeenCalledTimes(1);
    });
  });

  describe('onKeyDown event', () => {
    it('should be returned', () => {
      expect.assertions(1);
      setup();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          onKeyDown: expect.any(Function),
        }),
      );
    });

    it('should call onActivate when run with the enter key', () => {
      expect.assertions(1);
      const { getByRole } = setup();
      const button = getByRole('button');
      act(() => {
        fireEvent.keyDown(button, { key: 'Enter' });
      });

      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it('should not call onActivate when run without the enter key', () => {
      expect.assertions(1);
      const { getByRole } = setup();
      const button = getByRole('button');
      act(() => {
        fireEvent.keyDown(button, { key: 'F' });
      });

      expect(onActivate).not.toHaveBeenCalled();
    });
  });
});
