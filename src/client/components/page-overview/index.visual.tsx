import React from 'react';
import { Route } from 'react-router-dom';

import { PageOverview } from '.';
import { ResizeContext, TodayProvider } from '~client/hooks';
import { testNow } from '~client/test-data/state';
import { mockMatchMedia, renderVisualTest, renderWithStore } from '~client/test-utils';

describe('<PageOverview />', () => {
  beforeEach(() => {
    mockMatchMedia();
    jest.useFakeTimers();
    jest.setSystemTime(testNow);
  });

  const getContainer = (): ReturnType<typeof renderWithStore> =>
    renderWithStore(
      <TodayProvider>
        <ResizeContext.Provider value={1020}>
          <Route path="/" component={PageOverview} />
        </ResizeContext.Provider>
      </TodayProvider>,
      { includeGlobalStyles: true },
    );

  it('should render a table and graphs', async () => {
    expect.assertions(1);
    getContainer();
    const screenshot = await renderVisualTest();

    expect(screenshot).toMatchImageSnapshot();
  });
});
