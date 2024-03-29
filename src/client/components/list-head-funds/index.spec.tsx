import { act, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { startOfSecond, subSeconds } from 'date-fns';

import { ListHeadFunds, ListHeadFundsMobile, Props, PropsMobile } from '.';
import { FundsContext } from '~client/components/page-funds/context';
import type { PageFundsContext } from '~client/components/page-funds/types';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import { renderWithStore } from '~client/test-utils';
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
      value: 399098,
      gain: -0.0192,
      gainAbs: -11273,
      dayGain: 0.0329,
      dayGainAbs: 9964.92,
    },
    onViewSoldToggle: jest.fn(),
  };

  const setup = (
    customProps: Partial<Props> = {},
    renderOptions: Partial<RenderResult> = {},
    customState: Partial<State> = {},
    context: Partial<PageFundsContext> = {},
  ): ReturnType<typeof renderWithStore> =>
    renderWithStore(
      <FundsContext.Provider value={{ setSort: jest.fn(), lastScraped: new Date(), ...context }}>
        <ListHeadFunds {...props} {...customProps} />
      </FundsContext.Provider>,
      {
        customState,
        renderOptions,
      },
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

    userEvent.click(tickbox);

    expect(props.onViewSoldToggle).toHaveBeenCalledTimes(1);

    act(() => {
      setup({ viewSoldFunds: true }, { container });
    });

    expect(tickbox.checked).toBe(true);
  });

  it('should display an arc indicating the age of the current price cache', () => {
    expect.assertions(1);
    const now = new Date('2020-04-20T15:30:11.584+0100');
    jest.useFakeTimers();
    jest.setSystemTime(now);

    const { getByTestId } = setup(
      {},
      {},
      {},
      {
        lastScraped: subSeconds(startOfSecond(now), 175),
      },
    );

    expect(getByTestId('scrape-arc')).toMatchInlineSnapshot(`
      <svg
        data-testid="scrape-arc"
        height="24"
        width="24"
      >
        <path
          d="M12,3 A9,9 0,1,1 11.943451704309972,3.0001776522947665"
          fill="none"
          stroke="#483be4"
          stroke-width="3"
        />
      </svg>
    `);
  });

  describe('when the config option "realTimePrices" is set to false', () => {
    it('should not render the price cache age arc', () => {
      expect.assertions(1);

      const { queryByTestId } = setup(
        {},
        {},
        {
          api: {
            ...testState.api,
            appConfig: {
              ...testState.api.appConfig,
              realTimePrices: false,
            },
          },
        },
      );

      expect(queryByTestId('scrape-arc')).not.toBeInTheDocument();
    });
  });
});

describe('<ListHeadFundsMobile />', () => {
  const props: PropsMobile = {
    totalCost: 400000,
    annualisedFundReturns: 0.27,
    cachedValue: {
      value: 399098,
      gain: 0.0237,
      gainAbs: 107194,
      dayGain: 0.0329,
      dayGainAbs: 9964.92,
    },
  };

  const setup = (): ReturnType<typeof renderWithStore> =>
    renderWithStore(
      <FundsContext.Provider value={{ setSort: jest.fn(), lastScraped: new Date() }}>
        <ListHeadFundsMobile {...props} />
      </FundsContext.Provider>,
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
