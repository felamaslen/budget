import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MatchMediaMock from 'jest-matchmedia-mock';
import { MemoryRouter } from 'react-router-dom';

import { Navbar } from '.';
import { breakpoints } from '~client/styled/variables';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

describe('<Navbar />', () => {
  let matchMedia: MatchMediaMock;
  const mobileQuery = `(max-width: ${breakpoints.mobile - 1}px)`;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
    matchMedia.useMediaQuery(mobileQuery);
  });
  afterEach(() => {
    matchMedia.clear();
  });

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
  `('should render a button for the $page page', ({ page, path }) => {
    expect.assertions(3);
    const { getAllByRole } = getContainer();

    const links = getAllByRole('link');
    const matchingLink = links.find((link) => link.textContent === page) as HTMLAnchorElement;

    expect(matchingLink).toBeInTheDocument();

    expect(matchingLink.href).toBe(`http://localhost${path}`);
    expect(matchingLink.tabIndex).toBe(-1);
  });

  it('should render a logout button', async () => {
    expect.assertions(3);
    const { getByText } = getContainer();

    const link = getByText('Log out') as HTMLAnchorElement;

    expect(link).toBeInTheDocument();
    expect(link.tabIndex).toBe(-1);

    userEvent.click(link);

    expect(props.onLogout).toHaveBeenCalledTimes(1);
  });
});
