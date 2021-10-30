import userEvent from '@testing-library/user-event';
import React from 'react';

import { AppLogo, Props } from '.';
import { settingsToggled } from '~client/actions';
import { renderWithStore } from '~client/test-utils';

describe('<AppLogo />', () => {
  const props: Props = {
    loading: false,
  };

  const setup = (): ReturnType<typeof renderWithStore> => renderWithStore(<AppLogo {...props} />);

  it('should render a settings link', () => {
    expect.assertions(3);
    const { getByText, store } = setup();
    const button = getByText('⚙');
    expect(button).toBeInTheDocument();
    expect(store.getActions()).toHaveLength(0);
    userEvent.click(button);
    expect(store.getActions()).toStrictEqual([settingsToggled(true)]);
  });
});
