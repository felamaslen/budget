import { render, RenderResult } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Router } from 'react-router-dom';
import createStore, { MockStore } from 'redux-mock-store';
import { createClient, Provider as URQLProvider, OperationResult } from 'urql';

import { Root } from '.';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import * as gql from '~client/types/gql';

describe('<Root />', () => {
  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  afterEach(async () => {
    matchMedia.clear();
  });

  const setup = (): RenderResult & { store: MockStore } => {
    const mockRun = async (): Promise<
      OperationResult<gql.LoginMutation, gql.LoginMutationVariables>
    > => ({} as OperationResult<gql.LoginMutation, gql.LoginMutationVariables>);

    jest.spyOn(gql, 'useLoginMutation').mockReturnValue([
      {
        fetching: false,
        stale: false,
        data: {
          login: {
            uid: 1,
            name: 'Someone',
            apiKey: 'some-api-key',
          },
        },
      },
      mockRun,
    ]);

    const state: State = {
      ...testState,
      api: {
        ...testState.api,
        initialLoading: false,
        dataLoaded: true,
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

    const client = createClient({ url: '/graphql' });

    const utils = render(
      <Router history={history}>
        <URQLProvider value={client}>
          <Root {...props} />
        </URQLProvider>
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
