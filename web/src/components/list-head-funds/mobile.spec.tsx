import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';

import { ListHeadFundsMobile } from './mobile';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';

describe('<ListHeadFundsMobile />', () => {
  const props = {
    totalCost: 400000,
    cachedValue: {
      ageText: '3 hours ago',
      value: 399098,
      dayGain: 0.0329,
      dayGainAbs: 9964.92,
    },
    onReloadPrices: jest.fn(),
  };

  const setup = (): RenderResult =>
    render(
      <Provider store={createStore<State>()(testState)}>
        <ListHeadFundsMobile {...props} />
      </Provider>,
    );

  it('should render the value unabbreviated', () => {
    expect.assertions(2);
    const { queryByText } = setup();
    expect(queryByText('£3,990.98')).toBeInTheDocument();
    expect(queryByText('£4k')).not.toBeInTheDocument();
  });

  it.each`
    thing                        | value
    ${'overall (absolute) gain'} | ${'(£9)'}
    ${'overall (relative) gain'} | ${'(0.23%)'}
    ${'daily (absolute) gain'}   | ${'£100'}
    ${'daily (relative) gain'}   | ${'3.29%'}
  `('should render the $thing', ({ value }) => {
    expect.assertions(1);
    const { queryByText } = setup();
    expect(queryByText(value)).toBeInTheDocument();
  });

  it('should call onReloadPrices when clicked', () => {
    expect.assertions(1);
    const { getByRole } = setup();
    const button = getByRole('button');
    act(() => {
      fireEvent.click(button);
    });
    expect(props.onReloadPrices).toHaveBeenCalledTimes(1);
  });
});
