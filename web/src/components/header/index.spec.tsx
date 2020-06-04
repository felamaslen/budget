import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import createStore, { MockStore } from 'redux-mock-store';

import { Header } from '.';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';

describe('<Header />', () => {
  const setup = (
    customState: State = testState,
  ): RenderResult & {
    store: MockStore<State>;
  } => {
    const store = createStore<State>()(customState);

    const utils = render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>,
    );

    return { ...utils, store };
  };

  it('should render a header', () => {
    expect.assertions(1);
    const { getByRole } = setup();
    const header = getByRole('heading');
    expect(header).toBeInTheDocument();
  });

  it('should render a nav', () => {
    expect.assertions(1);
    const { getByRole } = setup();
    const nav = getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  describe('when logged out', () => {
    const setupLoggedOut = (): RenderResult & {
      store: MockStore<State>;
    } =>
      setup({
        ...testState,
        login: {
          ...testState.login,
          uid: null,
        },
      });

    it('should not render a nav', () => {
      expect.assertions(1);
      const { queryByRole } = setupLoggedOut();
      expect(queryByRole('navigation')).not.toBeInTheDocument();
    });
  });
});
