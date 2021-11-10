import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
      userEvent.type(button, '{enter}');
    };

    it.each`
      event                            | handler
      ${'pressed'}                     | ${userEvent.click}
      ${'activated with the keyboard'} | ${activateByKeyboard}
    `('should call onInput when $event', ({ handler }) => {
      expect.assertions(2);
      const { getByText } = setup();
      const button = getByText(String(digit)) as HTMLButtonElement;

      handler(button);

      expect(props.onInput).toHaveBeenCalledTimes(1);
      expect(props.onInput).toHaveBeenCalledWith(digit);
    });
  });
});
