import { renderHook, RenderHookResult } from '@testing-library/react-hooks';
import React from 'react';

import { CTAEvents, useCTA } from './cta';

describe('useCTA', () => {
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
});
