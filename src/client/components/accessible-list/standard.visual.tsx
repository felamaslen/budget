import MatchMediaMock from 'jest-matchmedia-mock';
import { generateImage } from 'jsdom-screenshot';
import React from 'react';
import { MemoryRouter } from 'react-router';

import { AccessibleListStandard } from './standard';

import { RootContainer } from '~client/components/root';
import { breakpoints, colors } from '~client/styled/variables';
import { renderWithStore } from '~client/test-utils';
import { PageListStandard } from '~client/types/gql';

describe(AccessibleListStandard.name, () => {
  let matchMedia: MatchMediaMock;

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  describe('when rendering on mobiles', () => {
    const mobileQuery = `(max-width: ${breakpoints.mobile - 1}px)`;
    const setupMobile = (): ReturnType<typeof renderWithStore> => {
      matchMedia.useMediaQuery(mobileQuery);
      const renderResult = renderWithStore(
        <MemoryRouter initialEntries={['/food']}>
          <RootContainer loggedIn={true} onLogout={jest.fn()}>
            <AccessibleListStandard
              page={PageListStandard.Food}
              color={colors[PageListStandard.Food].main}
            />
          </RootContainer>
        </MemoryRouter>,
      );

      return renderResult;
    };

    it('should render a mobile list view', async () => {
      expect.assertions(2);
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        value: 520,
      });
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        value: 360,
      });
      const { getAllByRole } = setupMobile();
      const listItems = getAllByRole('listitem');

      expect(listItems).toHaveLength(4);

      const screenshot = await generateImage({
        serve: ['src/client/images'],
        viewport: {
          height: 520,
          width: 360,
        },
      });
      expect(screenshot).toMatchImageSnapshot();
    });
  });
});
