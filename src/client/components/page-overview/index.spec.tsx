import { render, RenderResult } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { PageOverview } from '.';
import { ResizeContext, TodayContext } from '~client/hooks';
import { State } from '~client/reducers';
import { testNow, testState as state } from '~client/test-data/state';
import '~client/test-utils/match-media';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { mockRandom } from '~client/test-utils/random';

describe('<PageOverview />', () => {
  const mockStore = configureStore<State>();
  const today = endOfDay(testNow);

  beforeEach(() => {
    mockRandom();
  });

  const getContainer = (): RenderResult =>
    render(
      <MemoryRouter>
        <Provider store={mockStore(state)}>
          <GQLProviderMock>
            <TodayContext.Provider value={today}>
              <ResizeContext.Provider value={1020}>
                <PageOverview />
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
