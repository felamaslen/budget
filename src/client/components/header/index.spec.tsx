import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import createStore, { MockStore } from 'redux-mock-store';

import { Header, Props } from '.';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';

describe('<Header />', () => {
  const props: Props = {
    loggedIn: true,
    onLogout: jest.fn(),
    setSettingsOpen: jest.fn(),
  };

  const setup = (
    customState: State = testState,
    customProps: Partial<Props> = {},
  ): RenderResult & {
    store: MockStore<State>;
  } => {
    const store = createStore<State>()(customState);

    const utils = render(
      <Provider store={store}>
        <Router>
          <Header {...props} {...customProps} />
        </Router>
      </Provider>,
    );

    return { ...utils, store };
  };

  it('should render a header', () => {
    expect.assertions(1);
    const { getAllByRole } = setup();
    const headers = getAllByRole('heading');
    expect(headers).toHaveLength(2);
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
    } => setup(testState, { loggedIn: false });

    it('should not render a nav', () => {
      expect.assertions(1);
      const { queryByRole } = setupLoggedOut();
      expect(queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('when clicking the logout button', () => {
    it('should call onLogout', () => {
      expect.assertions(1);

      const { getByText } = setup();
      act(() => {
        fireEvent.click(getByText('Log out'));
      });

      expect(props.onLogout).toHaveBeenCalledTimes(1);
    });
  });
});
