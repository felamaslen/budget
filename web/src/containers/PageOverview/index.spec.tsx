import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import sinon from 'sinon';

import PageOverview from '.';
import '~client/mocks/match-media';
import { mockRandom } from '~client/mocks/random';
import { State } from '~client/reducers';
import { testState as state } from '~client/test-data/state';

describe('<PageOverview />', () => {
  const mockStore = configureStore<State>();
  const now = new Date('2020-04-20T16:29Z');
  let clock: sinon.SinonFakeTimers;
  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
    mockRandom();
  });
  afterEach(() => {
    clock.restore();
  });

  const getContainer = (): RenderResult =>
    render(
      <MemoryRouter>
        <Provider store={mockStore(state)}>
          <PageOverview />
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