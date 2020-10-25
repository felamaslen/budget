import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore } from 'redux-mock-store';

import { CashRow } from './cash-row';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';

describe('<CashRow />', () => {
  const getStore = createMockStore<State>();

  const setup = (): RenderResult & { store: MockStore<State> } => {
    const store = getStore(testState);
    const renderResult = render(
      <Provider store={store}>
        <CashRow />
      </Provider>,
    );
    return { ...renderResult, store };
  };

  it('should render the cash value with target', () => {
    expect.assertions(2);
    const { getByText, getByTitle } = setup();
    expect(getByText('Cash')).toBeInTheDocument();
    expect(getByTitle('Buy £6k of stock to adjust')).toBeInTheDocument();
  });
});
