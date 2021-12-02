import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addSeconds, getUnixTime, startOfDay } from 'date-fns';
import { MemoryRouter, Route } from 'react-router';
import numericHash from 'string-hash';

import { Funds } from '.';
import type { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import { renderWithStore } from '~client/test-utils';
import { FundPeriod, PageNonStandard } from '~client/types/enum';

describe('<PageFunds />', () => {
  const state: Pick<State, 'api' | PageNonStandard.Funds> = {
    api: {
      ...testState.api,
      appConfig: {
        ...testState.api.appConfig,
        historyOptions: { period: FundPeriod.Month, length: 3 },
      },
    },
    [PageNonStandard.Funds]: {
      ...testState[PageNonStandard.Funds],
      items: [
        {
          id: numericHash('fund-id-some-active-fund'),
          item: 'Fund A',
          transactions: [
            {
              date: new Date('2019-03-20'),
              units: 69,
              price: 6086.9,
              fees: 10,
              taxes: 3,
              drip: false,
              pension: false,
            },
          ],
          stockSplits: [],
          allocationTarget: 0,
        },
        {
          id: numericHash('fund-id-some-sold-fund'),
          item: 'Fund B',
          transactions: [
            {
              date: new Date('2019-04-09'),
              units: 130.0312,
              price: 7622.5,
              fees: 5,
              taxes: 11,
              drip: false,
              pension: false,
            },
            {
              date: startOfDay(addSeconds(new Date('2019-04-10'), 86400 * 3.4)),
              units: -130.0312,
              price: 8482.8,
              fees: 165,
              taxes: 143,
              drip: false,
              pension: false,
            },
          ],
          stockSplits: [],
          allocationTarget: 0,
        },
      ],
      viewSoldFunds: true,
      startTime: getUnixTime(new Date('2019-04-10T11:05:03Z')),
      cacheTimes: [0, 86400, 86400 * 3.5],
      prices: {
        [numericHash('fund-id-some-sold-fund')]: [{ startIndex: 0, values: [7992.13, 7421.97] }],
        [numericHash('fund-id-some-active-fund')]: [{ startIndex: 1, values: [6081.9, 6213.7] }],
      },
      todayPrices: {},
    },
  };

  const setup = (customState: Partial<State> = state): ReturnType<typeof renderWithStore> =>
    renderWithStore(
      <MemoryRouter initialEntries={['/funds']}>
        <Route path="/funds" component={Funds} />
      </MemoryRouter>,
      { customState },
    );

  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should render', () => {
    expect.assertions(1);
    const { container } = setup();
    expect(container).toBeInTheDocument();
  });

  it('should render header fields', () => {
    expect.assertions(2);
    const { getByTestId } = setup();
    const header = getByTestId('fund-header');
    const { getByText } = within(header);
    expect(getByText('Item')).toBeInTheDocument();
    expect(getByText('Transactions')).toBeInTheDocument();
  });

  it('should show the current total value', () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    const header = getByTestId('fund-header');
    const { getByText } = within(header);
    // total value is 6213.7 * 69 = 428745.30p = £4287.453
    expect(getByText('£4.3k')).toBeInTheDocument();
  });

  it('should show the overall gain, including percentage', () => {
    expect.assertions(2);
    const { getByTestId } = setup();
    const header = getByTestId('fund-header');
    const { getByText } = within(header);

    // expectedPaperValue = 69 * 6213.7;
    // expectedRealisedValue = 130.0312 * 8482.8 - (165 + 143);
    // expectedCost = 130.0312 * 7622.5 + 5 + 11 + 69 * 6086.9 + 10 + 3;
    // expectedGainAbs = expectedPaperValue + expectedRealisedValue - expectedCost ~ 1200;

    expect(getByText('£1.2k')).toBeInTheDocument();
    expect(getByText('8.52%')).toBeInTheDocument();
  });

  it('should show the daily gain, including percentage', () => {
    expect.assertions(2);
    const { getByTestId } = setup();

    const header = getByTestId('fund-header');
    const { getByText } = within(header);

    // previous cost was £(4200.091 + 9911.78822) = £14111.87922 (see above)
    // previous value was 6081.9 * 69 + 7421.97 * 130.0312 = 1384738.765464p = £13847.38765464
    // latest cost is £(14111.87922 - 130.0312*84.828 + 1.65+1.43) = £3084.6725864
    // latest value is £4287.453 (see above)
    // day gain is thus £4287.453 - £13847.38... - (3084.67... - £14111.87...) = £1467.27197896
    // in percentage terms this is £1467.27 / £13847.38 = 10.596%
    expect(getByText('£1.5k')).toBeInTheDocument();
    expect(getByText('10.60%')).toBeInTheDocument();
  });

  describe.each`
    index | description | name        | value
    ${0}  | ${'first'}  | ${'Fund B'} | ${'£11k'}
    ${1}  | ${'second'} | ${'Fund A'} | ${'£4.3k'}
  `('the $description fund', ({ index, name, value }) => {
    const setupItem = (): HTMLLIElement => {
      const { getAllByRole } = setup();
      const items = getAllByRole('listitem') as HTMLLIElement[];
      return items[index + 1];
    };

    it('should render a graph', () => {
      expect.assertions(1);
      const { getByTestId } = within(setupItem());
      expect(getByTestId('fund-graph')).toBeInTheDocument();
    });

    it('should render the value of the fund', () => {
      expect.assertions(1);
      const { getByText } = within(setupItem());
      expect(getByText(value)).toBeInTheDocument();
    });

    it('should render an input with the name of the fund', () => {
      expect.assertions(1);
      const { getByDisplayValue } = within(setupItem());
      expect(getByDisplayValue(name)).toBeInTheDocument();
    });
  });

  it('should render a funds graph', () => {
    expect.assertions(1);
    expect(setup().getByTestId('graph-funds')).toBeInTheDocument();
  });

  describe('when hiding sold funds', () => {
    const setupSoldHidden = (): ReturnType<typeof renderWithStore> =>
      setup({
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          viewSoldFunds: false,
        },
      });

    it('should not show sold funds', () => {
      expect.assertions(1);
      const { queryByDisplayValue } = setupSoldHidden();
      expect(queryByDisplayValue('Fund B')).not.toBeInTheDocument();
    });
  });

  const generateTestFund =
    ({
      key,
      value,
      gainPercent,
      gainAbs,
    }: {
      key: string;
      value: number;
      gainAbs?: number;
      gainPercent?: number;
    }) =>
    (prevState: Pick<State, PageNonStandard.Funds>): Pick<State, PageNonStandard.Funds> => {
      const units = 100;
      const scrapedPrice = value / units;
      const valueAtPurchase = gainAbs ? value - gainAbs : value / (1 + (gainPercent ?? 0));
      const priceAtPurchase = valueAtPurchase / units;

      return {
        ...prevState,
        [PageNonStandard.Funds]: {
          ...prevState[PageNonStandard.Funds],
          items: [
            ...prevState[PageNonStandard.Funds].items,
            {
              id: numericHash(key),
              item: key,
              transactions: [
                {
                  date: new Date('2010-04-20'),
                  units,
                  price: priceAtPurchase,
                  fees: 0,
                  taxes: 0,
                  pension: false,
                  drip: false,
                },
              ],
              stockSplits: [],
            },
          ],
          prices: {
            ...prevState[PageNonStandard.Funds].prices,
            [numericHash(key)]: [{ startIndex: 2, values: [scrapedPrice] }],
          },
        },
      };
    };

  const stateWithGeneratedFunds = [
    generateTestFund({
      key: 'highest-value',
      value: 10000000,
      gainAbs: 2000,
    }),
    generateTestFund({
      key: 'lowest-value',
      value: 10000,
      gainAbs: 2500,
    }),
    generateTestFund({
      key: 'highest-gain-abs',
      value: 5000000,
      gainAbs: 2000000,
    }),
    generateTestFund({
      key: 'lowest-gain-abs',
      value: 2800000,
      gainAbs: -1500000,
    }),
    generateTestFund({
      key: 'highest-gain-rel',
      value: 2900000,
      gainPercent: 0.7,
    }),
    generateTestFund({
      key: 'lowest-gain-rel',
      value: 260000,
      gainPercent: -0.55,
    }),
  ].reduce<Pick<typeof state, PageNonStandard.Funds>>(
    (reduction, composer) => composer(reduction),
    {
      [PageNonStandard.Funds]: {
        ...state[PageNonStandard.Funds],
        items: [],
        startTime: getUnixTime(new Date('2020-04-20')),
        cacheTimes: [0],
        prices: {},
      },
    },
  );

  describe.each<[string, { option: string; expectedOrder: string[] }]>([
    [
      'value-descending (default)',
      {
        option: 'Value ↓',
        expectedOrder: [
          'highest-value', // 10000000
          'highest-gain-abs', // 5000000
          'highest-gain-rel', // 2900000
          'lowest-gain-abs', // 2800000
          'lowest-gain-rel', // 260000
          'lowest-value', // 10000
        ],
      },
    ],
    [
      'value-ascending',
      {
        option: 'Value ↑',
        expectedOrder: [
          'lowest-value', // 10000
          'lowest-gain-rel', // 260000
          'lowest-gain-abs', // 2800000
          'highest-gain-rel', // 2900000
          'highest-gain-abs', // 5000000
          'highest-value', // 10000000
        ],
      },
    ],
    [
      'gain (absolute)-descending',
      {
        option: 'Gain (abs) ↓',
        expectedOrder: [
          'highest-gain-abs', // 2000000
          'highest-gain-rel', // 843262
          'lowest-value', // 2500
          'highest-value', // 2000
          'lowest-gain-rel', // -317778
          'lowest-gain-abs', // -1500000
        ],
      },
    ],
    [
      'gain (absolute)-ascending',
      {
        option: 'Gain (abs) ↑',
        expectedOrder: [
          'lowest-gain-abs', // -1500000
          'lowest-gain-rel', // -317778
          'highest-value', // 2000
          'lowest-value', // 2500
          'highest-gain-rel', // 843262
          'highest-gain-abs', // 2000000
        ],
      },
    ],
    [
      'gain (relative)-descending',
      {
        option: 'Gain ↓',
        expectedOrder: [
          'highest-gain-rel', // 0.7
          'highest-gain-abs', // 0.6667
          'lowest-value', // 0.25
          'highest-value', // 0.02
          'lowest-gain-abs', // -0.3488
          'lowest-gain-rel', // -0.55
        ],
      },
    ],
    [
      'gain (relative)-ascending',
      {
        option: 'Gain ↑',
        expectedOrder: [
          'lowest-gain-rel', // -0.55
          'lowest-gain-abs', // -0.3488
          'highest-value', // 0.02
          'lowest-value', // 0.25
          'highest-gain-abs', // 0.6667
          'highest-gain-rel', // 0.7
        ],
      },
    ],
  ])('when sorting by %s', (_, { expectedOrder, option }) => {
    it('should render the funds in the desired order', () => {
      expect.hasAssertions();
      const { getAllByRole, getByDisplayValue } = setup(stateWithGeneratedFunds);

      const select = getByDisplayValue('Value ↓') as HTMLSelectElement;
      userEvent.selectOptions(select, option);

      const inputs = getAllByRole('textbox') as HTMLInputElement[];
      const values = inputs.map((input) => input.value);

      expect(values).toStrictEqual(expectedOrder);
    });
  });
});
