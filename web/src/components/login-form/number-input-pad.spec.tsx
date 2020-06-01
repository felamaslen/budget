import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import React from 'react';

import { NumberInputPad } from './number-input-pad';

describe('<NumberInputPad />', () => {
  const props = {
    onInput: jest.fn(),
  };
  const setup = (): RenderResult => render(<NumberInputPad {...props} />);

  describe.each`
    digit
    ${1}
    ${2}
    ${3}
    ${4}
    ${5}
    ${6}
    ${7}
    ${8}
    ${9}
    ${0}
  `('the digit $digit', ({ digit }) => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = setup();
      const button = getByText(String(digit)) as HTMLButtonElement;
      expect(button).toBeInTheDocument();
    });

    const activateByKeyboard = (button: HTMLButtonElement): void => {
      fireEvent.keyDown(button, { key: 'Enter' });
    };

    it.each`
      event                            | handler
      ${'pressed'}                     | ${fireEvent.mouseDown}
      ${'activated with the keyboard'} | ${activateByKeyboard}
    `('should call onInput when $event', ({ handler }) => {
      expect.assertions(2);
      const { getByText } = setup();
      const button = getByText(String(digit)) as HTMLButtonElement;

      act(() => {
        handler(button);
      });

      expect(props.onInput).toHaveBeenCalledTimes(1);
      expect(props.onInput).toHaveBeenCalledWith(digit);
    });
  });
});
