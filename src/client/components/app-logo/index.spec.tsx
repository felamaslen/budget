import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AppLogo, Props } from '.';

describe('<AppLogo />', () => {
  const props: Props = {
    loading: false,
    setSettingsOpen: jest.fn(),
  };

  const setup = (customProps = {}): RenderResult => render(<AppLogo {...props} {...customProps} />);

  it('should render a settings link', () => {
    expect.assertions(4);
    const { getByText } = setup();
    const button = getByText('⚙');
    expect(button).toBeInTheDocument();
    expect(props.setSettingsOpen).not.toHaveBeenCalled();
    userEvent.click(button);
    expect(props.setSettingsOpen).toHaveBeenCalledTimes(1);
    expect(props.setSettingsOpen).toHaveBeenCalledWith(true);
  });
});
