import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';
import numericHash from 'string-hash';

import { FundWeights, Props } from '.';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';

describe('<FundWeights />', () => {
  const props: Props = {
    portfolio: [
      {
        id: numericHash('fund-id-1'),
        item: 'My Fund 1',
        value: 2003,
      },
      {
        id: numericHash('fund-id-2'),
        item: 'My Fund 2',
        value: 19865,
      },
    ],
  };

  const setup = (): RenderResult =>
    render(
      <Provider store={createStore<State>()(testState)}>
        <FundWeights {...props} />
        );
      </Provider>,
    );

  it('should render a block tree', () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    const graph = getByTestId('block-tree');
    expect(graph).toBeInTheDocument();
  });
});
