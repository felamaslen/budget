import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { PageOverview } from '.';
import { ResizeContext, TodayProvider } from '~client/hooks';
import { State } from '~client/reducers';
import { testNow, testState as state } from '~client/test-data/state';
import '~client/test-utils/match-media';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';

describe('<PageOverview />', () => {
  const mockStore = configureStore<State>();
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(testNow);
  });

  const getContainer = (): RenderResult =>
    render(
      <MemoryRouter>
        <Provider store={mockStore(state)}>
          <GQLProviderMock>
            <TodayProvider>
              <ResizeContext.Provider value={1020}>
                <MemoryRouter initialEntries={['/']}>
                  <Route path="/" component={PageOverview} />
                </MemoryRouter>
              </ResizeContext.Provider>
            </TodayProvider>
          </GQLProviderMock>
        </Provider>
      </MemoryRouter>,
    );

  it('should render a table', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    // eslint-disable-next-line  jest/prefer-inline-snapshots
    expect(getByTestId('overview-table')).toMatchSnapshot();
  });

  it('should render graphs', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    // eslint-disable-next-line  jest/prefer-inline-snapshots
    expect(getByTestId('graph-overview')).toMatchSnapshot();
  });
});
