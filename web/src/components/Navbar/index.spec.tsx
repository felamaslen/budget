import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

import Navbar from '.';
import { Page } from '~client/types/app';

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

  it.each`
    page             | path
    ${Page.overview} | ${'/'}
    ${Page.analysis} | ${'/analysis'}
    ${Page.funds}    | ${'/funds'}
    ${Page.income}   | ${'/income'}
    ${Page.bills}    | ${'/bills'}
    ${Page.food}     | ${'/food'}
    ${Page.general}  | ${'/general'}
    ${Page.holiday}  | ${'/holiday'}
    ${Page.social}   | ${'/social'}
  `('should render a button for the $page page', async ({ page, path }) => {
    expect.assertions(2);
    const { findByText } = getContainer();

    const link = (await findByText(page)) as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.href).toBe(`http://localhost${path}`);
  });

  it('should render a logout button', async () => {
    expect.assertions(2);
    const { getByText } = getContainer();

    const link = getByText('Log out') as HTMLAnchorElement;

    expect(link).toBeInTheDocument();

    act(() => {
      fireEvent.click(link);
    });

    expect(props.onLogout).toHaveBeenCalledTimes(1);
  });
});
