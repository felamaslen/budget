import { render, RenderResult, waitFor } from '@testing-library/react';
import 'cross-fetch/polyfill';
import { createMemoryHistory } from 'history';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Router } from 'react-router-dom';
import createStore, { MockStore } from 'redux-mock-store';
import { OperationResult } from 'urql';

import { Root } from '.';
import { State } from '~client/reducers';
import { testState as state } from '~client/test-data/state';
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

  it('should render a header', async () => {
    expect.assertions(1);
    const { getAllByRole } = setup();
    await waitFor(() => {
      expect(getAllByRole('heading')).toHaveLength(2);
    });
  });
});
