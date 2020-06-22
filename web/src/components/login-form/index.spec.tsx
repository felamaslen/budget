import { render, fireEvent, act, RenderResult, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';
import { LoginForm } from '.';
import { loginRequested } from '~client/actions';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';

describe('<LoginForm />', () => {
  const state: State = {
    ...testState,
    login: {
      uid: null,
      name: null,
      initialised: true,
      loading: false,
      error: null,
    },
  };

  const setup = (
    customProps = {},
    customState: State = state,
    renderOptions: Partial<Pick<RenderResult, 'container'>> = {},
  ): RenderResult & {
    store: MockStore;
  } => {
    const store = createStore<State>()(customState);

    const utils = render(
      <Provider store={store}>
        <LoginForm {...customProps} />
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
    // eslint-disable-next-line jest/prefer-expect-assertions
    it('should focus each pin element when entering an item', async () => {
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

    it('should dispatch an action once the pin is entered', () => {
      expect.assertions(1);
      const { store } = setupEnterPin();
      expect(store.getActions()).toStrictEqual([loginRequested(1735)]);
    });

    describe('if the login was successful', () => {
      it('should not render anything', () => {
        expect.assertions(1);
        const { container } = setupEnterPin();
        setup(
          {},
          {
            ...testState,
            login: {
              ...testState.login,
              uid: numericHash('some-uid'),
            },
            api: {
              ...testState.api,
              key: 'some-api-key',
            },
          },
          { container },
        );

        expect(container).toHaveTextContent('');
      });
    });

    describe('if the login was unsuccessful', () => {
      // eslint-disable-next-line jest/prefer-expect-assertions
      it('should refocus the login form', async () => {
        const { container, getAllByRole } = setupEnterPin();
        act(() => {
          setup(
            {},
            {
              ...testState,
              login: {
                ...testState.login,
                uid: null,
              },
              api: {
                ...testState.api,
                key: null,
              },
            },
            { container },
          );
        });

        const inputs = getAllByRole('spinbutton') as HTMLInputElement[];
        const [pin0] = inputs;
        await waitFor(() => {
          expect(document.activeElement).toBe(pin0);
        });
      });
    });
  });

  describe("if the state isn't initialised", () => {
    it('should not render anything', () => {
      expect.assertions(1);
      const { container } = setup(
        {},
        {
          ...state,
          login: {
            ...state.login,
            initialised: false,
          },
        },
      );

      expect(container).toMatchInlineSnapshot(`<div />`);
    });
  });
});
