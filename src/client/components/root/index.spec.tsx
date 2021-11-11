import { waitFor } from '@testing-library/react';
import 'cross-fetch/polyfill';
import { createMemoryHistory } from 'history';
import MatchMediaMock from 'jest-matchmedia-mock';
import { Router } from 'react-router-dom';
import { makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import App, { Props } from '.';
import * as LoginMutations from '~client/gql/mutations/login';
import { mockClient, renderWithStore } from '~client/test-utils';

describe('<Root />', () => {
  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  afterEach(async () => {
    matchMedia.clear();
  });

  beforeEach(() => {
    jest.spyOn(mockClient, 'executeMutation').mockImplementation((request) => {
      if (request.query === LoginMutations.login) {
        return fromValue({
          operation: makeOperation('mutation', request, {} as OperationContext),
          data: {
            login: {
              uid: 1,
              name: 'Someone',
              apiKey: 'some-api-key',
            },
          },
        });
      }
      return fromValue({
        operation: makeOperation('mutation', request, {} as OperationContext),
        data: null,
      });
    });
  });

  const setup = (): ReturnType<typeof renderWithStore> => {
    const props: Props = {
      loggedIn: true,
      connectionAttempt: 0,
    };

    const history = createMemoryHistory({
      initialEntries: ['/'],
    });

    return renderWithStore(
      <Router history={history}>
        <App {...props} />
      </Router>,
    );
  };

  it('should render an app logo', async () => {
    expect.hasAssertions();
    const { getAllByRole } = setup();
    await waitFor(() => {
      const header = getAllByRole('heading')[1];
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('Budget');
    });
  });
});
