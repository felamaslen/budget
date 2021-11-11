import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import { Anonymous } from '.';

import { configUpdatedFromApi } from '~client/actions';
import { mockClient, renderWithStore } from '~client/test-utils';
import { ConfigDocument, ConfigQuery, LoginDocument, LoginMutation } from '~client/types/gql';

describe('anonymous wrapper', () => {
  const onLogin = jest.fn();

  const mockConfig: ConfigQuery = {
    __typename: 'Query',
    config: {
      __typename: 'AppConfig',
      birthDate: '1992-03-15',
      realTimePrices: true,
      futureMonths: 5,
    },
  };

  const mockLogin: LoginMutation = {
    __typename: 'Mutation',
    login: {
      __typename: 'LoginResponse',
      error: null,
      uid: 1,
      name: 'Someone',
      apiKey: 'some-api-key',
    },
  };

  beforeEach(() => {
    jest.spyOn(mockClient, 'executeMutation').mockImplementation((request) => {
      if (request.query === LoginDocument) {
        return fromValue({
          operation: makeOperation('mutation', request, {} as OperationContext),
          data: mockLogin,
        });
      }
      return fromValue({
        operation: makeOperation('mutation', request, {} as OperationContext),
        data: null,
      });
    });

    jest.spyOn(mockClient, 'executeQuery').mockImplementation((request) => {
      if (request.query === ConfigDocument) {
        return fromValue({
          operation: makeOperation('query', request, {} as OperationContext),
          data: mockConfig,
        });
      }
      return fromValue({
        operation: makeOperation('query', request, {} as OperationContext),
        data: null,
      });
    });
  });

  it('should render a login form', () => {
    expect.assertions(2);
    const { getAllByRole } = renderWithStore(<Anonymous onLogin={onLogin} />);

    expect(getAllByRole('spinbutton')).toHaveLength(4);
    expect(getAllByRole('button')).toHaveLength(10); // digits
  });

  it('should call onLogin after logging in', async () => {
    expect.hasAssertions();
    const { getByText, store } = renderWithStore(<Anonymous onLogin={onLogin} />);

    userEvent.click(getByText('1'));
    userEvent.click(getByText('2'));
    userEvent.click(getByText('3'));
    userEvent.click(getByText('4'));

    await waitFor(() => {
      expect(store.getActions()).not.toHaveLength(0);
    });

    expect(store.getActions()).toStrictEqual([
      configUpdatedFromApi(mockConfig.config as NonNullable<Required<ConfigQuery>['config']>),
    ]);

    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onLogin).toHaveBeenCalledWith('some-api-key');
  });
});
