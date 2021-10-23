import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';

import { Header, Props } from '.';
import { State } from '~client/reducers';
import { renderWithStore } from '~client/test-utils';

describe('<Header />', () => {
  const props: Props = {
    loggedIn: true,
    onLogout: jest.fn(),
    setSettingsOpen: jest.fn(),
  };

  const setup = (
    customState: Partial<State> = {},
    customProps: Partial<Props> = {},
  ): ReturnType<typeof renderWithStore> =>
    renderWithStore(
      <Router>
        <Header {...props} {...customProps} />
      </Router>,
      { customState },
    );

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
    const setupLoggedOut = (): ReturnType<typeof setup> => setup({}, { loggedIn: false });

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
      userEvent.click(getByText('Log out'));

      expect(props.onLogout).toHaveBeenCalledTimes(1);
    });
  });
});
