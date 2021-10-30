import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';

import { AccessibleListStandard } from './standard';

import { breakpoints, colors } from '~client/styled/variables';
import { renderWithStore, renderVisualTest, setInfiniteGridViewport } from '~client/test-utils';
import { PageListStandard } from '~client/types/gql';

describe('[visual] AccessibleListStandard', () => {
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
        <AccessibleListStandard
          page={PageListStandard.Food}
          color={colors[PageListStandard.Food].main}
        />,
        { includeGlobalStyles: true, initialRouterEntries: ['/food'] },
      );

      return renderResult;
    };

    it('should render a mobile list view', async () => {
      expect.assertions(2);
      setInfiniteGridViewport({ isMobile: true });
      const { getAllByRole } = setupMobile();
      const listItems = getAllByRole('listitem');

      expect(listItems).toHaveLength(4);

      const screenshot = await renderVisualTest({ isMobile: true });
      expect(screenshot).toMatchImageSnapshot();
    });
  });
});
