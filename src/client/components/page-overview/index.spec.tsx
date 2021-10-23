import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import { PageOverview } from '.';
import { ResizeContext, TodayProvider } from '~client/hooks';
import { testNow } from '~client/test-data/state';
import { mockMatchMedia, renderWithStore } from '~client/test-utils';

describe('<PageOverview />', () => {
  beforeEach(() => {
    mockMatchMedia();
    jest.useFakeTimers();
    jest.setSystemTime(testNow);
  });

  const getContainer = (): ReturnType<typeof renderWithStore> =>
    renderWithStore(
      <MemoryRouter>
        <TodayProvider>
          <ResizeContext.Provider value={1020}>
            <MemoryRouter initialEntries={['/']}>
              <Route path="/" component={PageOverview} />
            </MemoryRouter>
          </ResizeContext.Provider>
        </TodayProvider>
      </MemoryRouter>,
    );

  it('should render a table', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    expect(getByTestId('overview-table')).toMatchSnapshot();
  });

  it('should render graphs', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    expect(getByTestId('graph-overview')).toMatchSnapshot();
  });
});
