import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LoginForm, Props } from '.';
import { renderWithStore } from '~client/test-utils';

describe('<LoginForm />', () => {
  const baseProps: Props = {
    onLogin: jest.fn(),
    loading: false,
  };

  const setup = (): ReturnType<typeof renderWithStore> =>
    renderWithStore(<LoginForm {...baseProps} />);

  it('should render a title', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('Enter your PIN:')).toBeInTheDocument();
  });

  describe('when entering a pin', () => {
    it('should focus each pin element when entering an item', async () => {
      expect.hasAssertions();
      const { getAllByRole } = setup();
      const inputs = getAllByRole('spinbutton') as HTMLInputElement[];
      const [pin0, pin1, pin2, pin3] = inputs;

      await waitFor(() => {
        expect(document.activeElement).toBe(pin0);
      });

      userEvent.type(pin0, '1');
      await waitFor(() => {
        expect(pin1).toHaveFocus();
      });

      userEvent.type(pin1, '2');
      await waitFor(() => {
        expect(pin2).toHaveFocus();
      });

      userEvent.type(pin2, '3');
      await waitFor(() => {
        expect(pin3).toHaveFocus();
      });

      userEvent.type(pin3, '5');

      // last item
      expect(pin3).toHaveFocus();
    });

    const setupEnterPin = (): ReturnType<typeof setup> => {
      const renderResult = setup();
      const inputs = renderResult.getAllByRole('spinbutton') as HTMLInputElement[];
      const [pin0, pin1, pin2, pin3] = inputs;

      userEvent.type(pin0, '1');
      userEvent.type(pin1, '7');
      userEvent.type(pin2, '3');
      userEvent.type(pin3, '5');

      return renderResult;
    };

    it('should call onLogin once the pin is entered', () => {
      expect.assertions(2);
      setupEnterPin();
      expect(baseProps.onLogin).toHaveBeenCalledTimes(1);
      expect(baseProps.onLogin).toHaveBeenCalledWith(1735);
    });
  });
});
