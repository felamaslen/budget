import { render, RenderResult } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { PageOverview } from '.';
import { ResizeContext, TodayContext } from '~client/hooks';
import { State } from '~client/reducers';
import { testNow, testState as state } from '~client/test-data/state';
import '~client/test-utils/match-media';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';

describe('<PageOverview />', () => {
  const mockStore = configureStore<State>();
  const today = endOfDay(testNow);

  const getContainer = (): RenderResult =>
    render(
      <MemoryRouter>
        <Provider store={mockStore(state)}>
          <GQLProviderMock>
            <TodayContext.Provider value={today}>
              <ResizeContext.Provider value={1020}>
                <MemoryRouter initialEntries={['/']}>
                  <Route path="/" component={PageOverview} />
                </MemoryRouter>
              </ResizeContext.Provider>
            </TodayContext.Provider>
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
