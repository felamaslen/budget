import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

import Navbar from '.';

describe('<Navbar />', () => {
  const props = {
    onLogout: jest.fn(),
  };

  const getContainer = (customProps = {}): RenderResult => {
    return render(
      <MemoryRouter>
        <Navbar {...props} {...customProps} />
      </MemoryRouter>,
    );
  };

  const pageCases = [
    ['overview', '/'],
    ['analysis', '/analysis'],
    ['funds', '/funds'],
    ['income', '/income'],
    ['bills', '/bills'],
    ['food', '/food'],
    ['general', '/general'],
    ['holiday', '/holiday'],
    ['social', '/social'],
  ];

  it.each(pageCases)('should render a button for the %s page', async (page, path) => {
    const { findByText } = getContainer();

    const link = (await findByText(page)) as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.href).toBe(`http://localhost${path}`);
  });

  it('should render a logout button', async () => {
    const { findByText } = getContainer();

    const link = (await findByText('Log out')) as HTMLButtonElement;

    expect(link).toBeInTheDocument();

    act(() => {
      fireEvent.click(link);
    });

    expect(props.onLogout).toHaveBeenCalledTimes(1);
  });
});
