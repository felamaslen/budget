import { render, RenderResult } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Router } from 'react-router-dom';
import createStore, { MockStore } from 'redux-mock-store';

import { Root } from '.';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';

describe('<Root />', () => {
  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  afterEach(async () => {
    matchMedia.clear();
  });

  const setup = (): RenderResult & { store: MockStore } => {
    const state = {
      ...testState,
      login: {
        ...testState.login,
        uid: '1',
      },
      api: {
        ...testState.api,
        initialLoading: false,
        loading: false,
      },
    };

    const store = createStore<State>()(state);

    const props = {
      store,
      history: {},
    };

    const history = createMemoryHistory({
      initialEntries: ['/'],
    });

    const utils = render(
      <Router history={history}>
        <Root {...props} />
      </Router>,
    );

    return { store, ...utils };
  };

  it('should render a header', () => {
    expect.assertions(1);
    const { getByRole } = setup();
    expect(getByRole('heading')).toBeInTheDocument();
  });
});
