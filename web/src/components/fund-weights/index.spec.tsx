import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';

import { FundWeights } from '.';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';

describe('<FundWeights />', () => {
  const setup = (): RenderResult =>
    render(
      <Provider store={createStore<State>()(testState)}>
        <FundWeights />
      </Provider>,
    );

  it('should render a block tree', () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    const graph = getByTestId('block-tree');
    expect(graph).toBeInTheDocument();
  });
});
