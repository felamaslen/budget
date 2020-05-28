import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';
import { LoginForm } from '.';
import { loginRequested } from '~client/actions/login';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';

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
  ): RenderResult & {
    store: MockStore;
  } => {
    const store = createStore<State>()(customState);

    const utils = render(
      <Provider store={store}>
        <LoginForm {...customProps} />
      </Provider>,
    );

    return { store, ...utils };
  };

  it('should render a title', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('Enter your PIN:')).toBeInTheDocument();
  });

  it('should dispatch an action when entering a pin', () => {
    expect.assertions(1);
    const { store } = setup();
    act(() => {
      fireEvent.keyDown(document.body, { key: '1' });
    });
    act(() => {
      fireEvent.keyDown(document.body, { key: '2' });
    });
    act(() => {
      fireEvent.keyDown(document.body, { key: '3' });
    });
    act(() => {
      fireEvent.keyDown(document.body, { key: '4' });
    });

    expect(store.getActions()).toStrictEqual([loginRequested(1234)]);
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
