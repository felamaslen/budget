import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';

import { AppLogo } from '.';
import { VOID } from '~client/modules/data';
import { GlobalStylesProvider } from '~client/styled/global';
import { renderVisualTest, renderWithStore } from '~client/test-utils';

describe('[visual] AppLogo', () => {
  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  afterEach(() => {
    matchMedia.clear();
  });

  it('should render a logo', async () => {
    expect.assertions(1);
    renderWithStore(
      <GlobalStylesProvider>
        <AppLogo loading={false} setSettingsOpen={VOID} />
      </GlobalStylesProvider>,
    );
    const screenshot = await renderVisualTest();
    expect(screenshot).toMatchImageSnapshot();
  });
});
