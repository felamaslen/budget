import { render, RenderResult, waitFor } from '@testing-library/react';
import 'cross-fetch/polyfill';
import { createMemoryHistory } from 'history';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import createStore, { MockStore } from 'redux-mock-store';
import { OperationResult } from 'urql';

import App, { Props } from '.';
import { State } from '~client/reducers';
import { testState as state } from '~client/test-data/state';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
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

    const props: Props = {
      loggedIn: true,
    };

    const history = createMemoryHistory({
      initialEntries: ['/'],
    });

    const utils = render(
      <Provider store={store}>
        <Router history={history}>
          <GQLProviderMock>
            <App {...props} />
          </GQLProviderMock>
        </Router>
      </Provider>,
    );

    return { store, ...utils };
  };

  it('should render an app logo', async () => {
    expect.hasAssertions();
    const { getByText } = setup();
    await waitFor(() => {
      const header = getByText('Budget') as HTMLHeadingElement;
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('H1');
    });
  });
});
