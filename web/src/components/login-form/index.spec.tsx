import { render, fireEvent, act, RenderResult, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';
import { LoginForm, Props } from '.';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';

describe('<LoginForm />', () => {
  const baseProps: Props = {
    onLogin: jest.fn(),
    loading: false,
  };

  const setup = (
    customProps: Partial<Props> = {},
    customState: State = testState,
    renderOptions: Partial<Pick<RenderResult, 'container'>> = {},
  ): RenderResult & {
    store: MockStore;
  } => {
    const store = createStore<State>()(customState);

    const utils = render(
      <Provider store={store}>
        <LoginForm {...baseProps} {...customProps} />
      </Provider>,
      renderOptions,
    );

    return { store, ...utils };
  };

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

      act(() => {
        fireEvent.change(pin0, { target: { value: '1' } });
      });
      await waitFor(() => {
        expect(document.activeElement).toBe(pin1);
      });

      act(() => {
        fireEvent.change(pin1, { target: { value: '2' } });
      });
      await waitFor(() => {
        expect(document.activeElement).toBe(pin2);
      });

      act(() => {
        fireEvent.change(pin2, { target: { value: '3' } });
      });
      await waitFor(() => {
        expect(document.activeElement).toBe(pin3);
      });

      act(() => {
        fireEvent.change(pin3, { target: { value: '5' } });
      });
      await waitFor(() => {
        // last item
        expect(document.activeElement).toBe(pin3);
      });
    });

    const setupEnterPin = (): ReturnType<typeof setup> => {
      const renderResult = setup();
      const inputs = renderResult.getAllByRole('spinbutton') as HTMLInputElement[];
      const [pin0, pin1, pin2, pin3] = inputs;

      act(() => {
        fireEvent.change(pin0, { target: { value: '1' } });
      });
      act(() => {
        fireEvent.change(pin1, { target: { value: '7' } });
      });
      act(() => {
        fireEvent.change(pin2, { target: { value: '3' } });
      });
      act(() => {
        fireEvent.change(pin3, { target: { value: '5' } });
      });

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
