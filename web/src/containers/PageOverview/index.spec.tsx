import { render, RenderResult } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { PageOverview } from '.';
import { TodayContext } from '~client/hooks';
import '~client/mocks/match-media';
import { mockRandom } from '~client/mocks/random';
import { State } from '~client/reducers';
import { testState as state } from '~client/test-data/state';

describe('<PageOverview />', () => {
  const mockStore = configureStore<State>();
  const today = endOfDay(new Date('2020-04-20T16:29Z'));

  beforeEach(() => {
    mockRandom();
  });

  const getContainer = (): RenderResult =>
    render(
      <MemoryRouter>
        <Provider store={mockStore(state)}>
          <TodayContext.Provider value={today}>
            <PageOverview />
          </TodayContext.Provider>
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
