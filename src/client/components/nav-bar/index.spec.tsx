import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { Navbar } from '.';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

describe('<Navbar />', () => {
  const props = {
    onLogout: jest.fn(),
  };

  const getContainer = (customProps = {}): RenderResult =>
    render(
      <MemoryRouter>
        <Navbar {...props} {...customProps} />
      </MemoryRouter>,
    );

  it.each`
    page                        | path
    ${PageNonStandard.Overview} | ${'/'}
    ${PageNonStandard.Analysis} | ${'/analysis'}
    ${PageNonStandard.Funds}    | ${'/funds'}
    ${PageListStandard.Income}  | ${'/income'}
    ${PageListStandard.Bills}   | ${'/bills'}
    ${PageListStandard.Food}    | ${'/food'}
    ${PageListStandard.General} | ${'/general'}
    ${PageListStandard.Holiday} | ${'/holiday'}
    ${PageListStandard.Social}  | ${'/social'}
  `('should render a button for the $page page', async ({ page, path }) => {
    expect.assertions(3);
    const { findByText } = getContainer();

    const link = (await findByText(page)) as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.href).toBe(`http://localhost${path}`);
    expect(link.tabIndex).toBe(-1);
  });

  it('should render a logout button', async () => {
    expect.assertions(3);
    const { getByText } = getContainer();

    const link = getByText('Log out') as HTMLAnchorElement;

    expect(link).toBeInTheDocument();
    expect(link.tabIndex).toBe(-1);

    act(() => {
      fireEvent.click(link);
    });

    expect(props.onLogout).toHaveBeenCalledTimes(1);
  });
});
