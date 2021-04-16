import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';

import { ListHeadFunds, ListHeadFundsMobile, Props } from '.';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { FundPeriod } from '~client/types/enum';

describe('<ListHeadFunds />', () => {
  const props: Props = {
    totalCost: 400000,
    viewSoldFunds: false,
    historyOptions: {
      period: FundPeriod.Year,
      length: 1,
    },
    annualisedFundReturns: 0.233,
    cachedValue: {
      ageText: '3 hours ago',
      value: 399098,
      gain: -0.0192,
      gainAbs: -11273,
      dayGain: 0.0329,
      dayGainAbs: 9964.92,
    },
    onViewSoldToggle: jest.fn(),
    setSort: jest.fn(),
  };

  const setup = (
    customProps: Partial<Props> = {},
    options: Partial<RenderResult> = {},
  ): RenderResult =>
    render(
      <GQLProviderMock>
        <ListHeadFunds {...props} {...customProps} />
      </GQLProviderMock>,
      options,
    );

  it.each`
    thing                        | value
    ${'current value'}           | ${'£4k'}
    ${'XIRR (annualised) gains'} | ${'XIRR 23.3%'}
    ${'overall (absolute) gain'} | ${'(£113)'}
    ${'overall (relative) gain'} | ${'(1.92%)'}
    ${'daily (absolute) gain'}   | ${'£100'}
    ${'daily (relative) gain'}   | ${'3.29%'}
  `('should render the $thing', ({ value }) => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText(value)).toBeInTheDocument();
  });

  it('should call an onViewSoldToggle function when a tickbox is toggled', () => {
    expect.assertions(3);
    const { getAllByRole, container } = setup();

    const tickbox = getAllByRole('checkbox')[0] as HTMLInputElement;
    expect(tickbox.checked).toBe(false);

    act(() => {
      fireEvent.click(tickbox);
    });

    expect(props.onViewSoldToggle).toHaveBeenCalledTimes(1);

    act(() => {
      setup({ viewSoldFunds: true }, { container });
    });

    expect(tickbox.checked).toBe(true);
  });
});

describe('<ListHeadFundsMobile />', () => {
  const props = {
    totalCost: 400000,
    annualisedFundReturns: 0.27,
    cachedValue: {
      ageText: '3 hours ago',
      value: 399098,
      gain: 0.0237,
      gainAbs: 107194,
      dayGain: 0.0329,
      dayGainAbs: 9964.92,
    },
  };

  const setup = (): RenderResult =>
    render(
      <Provider store={createStore<State>()(testState)}>
        <GQLProviderMock>
          <ListHeadFundsMobile {...props} />
        </GQLProviderMock>
      </Provider>,
    );

  it('should render the value unabbreviated', () => {
    expect.assertions(2);
    const { queryByText } = setup();
    expect(queryByText('£3,990.98')).toBeInTheDocument();
    expect(queryByText('£4k')).not.toBeInTheDocument();
  });

  it.each`
    thing                          | value
    ${'XIRR (annualised) returns'} | ${'XIRR 27.0%'}
    ${'overall (absolute) gain'}   | ${'£1.1k'}
    ${'overall (relative) gain'}   | ${'2.37%'}
    ${'daily (absolute) gain'}     | ${'£100'}
    ${'daily (relative) gain'}     | ${'3.29%'}
  `('should render the $thing', ({ value }) => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText(value)).toBeInTheDocument();
  });
});
