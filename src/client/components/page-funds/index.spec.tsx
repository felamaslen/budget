import { RenderResult, render, within, fireEvent, act } from '@testing-library/react';
import addDays from 'date-fns/addDays';
import addSeconds from 'date-fns/addSeconds';
import getUnixTime from 'date-fns/getUnixTime';
import startOfDay from 'date-fns/startOfDay';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import createStore, { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';

import { Funds } from '.';
import { generateFakeId } from '~client/modules/data';
import { State } from '~client/reducers';
import { PriceCache } from '~client/selectors';
import { testState } from '~client/test-data/state';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { mockTime } from '~client/test-utils/mock-time';
import type { FundNative as Fund } from '~client/types';
import { FundPeriod, PageNonStandard } from '~client/types/enum';

describe('<PageFunds />', () => {
  const state: State = {
    ...testState,
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
            },
            {
              date: startOfDay(addSeconds(new Date('2019-04-10'), 86400 * 3.4)),
              units: -130.0312,
              price: 8482.8,
              fees: 165,
              taxes: 143,
              drip: false,
            },
          ],
          stockSplits: [],
          allocationTarget: 0,
        },
      ],
      viewSoldFunds: true,
      startTime: getUnixTime(new Date('2019-04-10')),
      cacheTimes: [0, 86400, 86400 * 3.5],
      prices: {
        [numericHash('fund-id-some-sold-fund')]: [
          {
            values: [7992.13, 7421.97],
            startIndex: 0,
          },
        ],
        [numericHash('fund-id-some-active-fund')]: [
          {
            values: [6081.9, 6213.7],
            startIndex: 1,
          },
        ],
      },
    },
  };

  const getStore = createStore<State>();
  const setup = (customState: State = state): RenderResult & { store: MockStore<State> } => {
    const store = getStore(customState);
    const renderResult = render(
      <Provider store={store}>
        <GQLProviderMock>
          <MemoryRouter initialEntries={['/funds']}>
            <Route path="/funds" component={Funds} />
          </MemoryRouter>
        </GQLProviderMock>
      </Provider>,
    );
    return { store, ...renderResult };
  };

  const mockedTime = mockTime(new Date('2020-04-20'));
  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  beforeEach(mockedTime.setup);
  afterEach(() => {
    matchMedia.clear();
    mockedTime.teardown();
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
    // overall cost is £(69*60.869+.1+.03+130.0312*76.225+.05+.11)
    //  = £(4200.091 + 9911.78822) = £14111.87922
    // paper value is £4287.453 (see above)
    // realised value is £(130.0312*84.828-1.65-1.43) = 11027.2066336
    // => overall gain is £(4287.453 + 11027.20... - 14111.87922) = £1202.780416 or 8.5231768%
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

  describe('if hiding sold funds', () => {
    const setupSoldHidden = (): RenderResult & { store: MockStore<State> } =>
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

  describe.each`
    case                            | selectValue       | order
    ${'[default] value-descending'} | ${undefined}      | ${['FH', 'FLL', 'FL', 'HH', 'HL', 'HLL', 'TL', 'TH', 'TLL']}
    ${'value-ascending'}            | ${'Value ↑'}      | ${['TLL', 'TH', 'TL', 'HLL', 'HL', 'HH', 'FL', 'FLL', 'FH']}
    ${'gain-descending'}            | ${'Gain ↓'}       | ${['FH', 'HH', 'TH', 'TL', 'FL', 'HL', 'FLL', 'HLL', 'TLL']}
    ${'gain-ascending'}             | ${'Gain ↑'}       | ${['TLL', 'HLL', 'FLL', 'HL', 'FL', 'TL', 'TH', 'HH', 'FH']}
    ${'gain-abs-descending'}        | ${'Gain (abs) ↓'} | ${['FH', 'HH', 'FL', 'TH', 'HL', 'TL', 'TLL', 'HLL', 'FLL']}
    ${'gain-abs-ascending'}         | ${'Gain (abs) ↑'} | ${['FLL', 'HLL', 'TLL', 'TL', 'HL', 'TH', 'FL', 'HH', 'FH']}
  `('$case sort order', ({ selectValue, order }) => {
    const makeContrivedFund = ({
      name,
      value,
      price,
      fees = 0,
      taxes = 0,
    }: {
      name: string;
      value: number;
      price: number;
      fees?: number;
      taxes?: number;
    }): {
      fund: Fund;
      prices: { [id: string]: { values: number[]; startIndex: number }[] };
    } => {
      const id = generateFakeId();

      return {
        fund: {
          id,
          item: name,
          transactions: [
            {
              date: addDays(new Date('2020-04-20'), -Math.floor(Math.random() * 100)),
              units: 420,
              price,
              fees,
              taxes,
              drip: false,
            },
          ],
          stockSplits: [],
          allocationTarget: 0,
        },
        prices: {
          [id]: [
            {
              values: [value / 420],
              startIndex: 0,
            },
          ],
        },
      };
    };

    const contrivedFunds = [
      {
        name: 'FH', // gainAbs: 0.559
        value: 150000 * 1.05,
        price: (150000 * 1.05) / 1.55 / 420,
      },
      {
        name: 'FLL', // gainAbs: -0.265
        value: 150000 * 1,
        price: (150000 * 1) / 0.85 / 420,
      },
      {
        name: 'HLL', // gainAbs: -0.238
        value: 100000 * 0.95,
        price: (100000 * 0.95) / 0.8 / 420,
      },
      {
        name: 'HH', // gainAbs: 0.350
        value: 100000 * 1.05,
        price: (100000 * 1.05) / 1.5 / 420,
      },
      {
        name: 'TL', // gainAbs: 0.105
        value: 50000 * 1.05,
        price: (50000 * 1.05) / 1.25 / 420,
      },
      {
        name: 'FL', // gainAbs: 0.238
        value: 150000 * 0.95,
        price: (150000 * 0.95) / 1.2 / 420,
      },
      {
        name: 'HL', // gainAbs: 0.130
        value: 100000 * 1,
        price: (100000 * 1) / 1.15 / 420,
      },
      {
        name: 'TH', // gainAbs: 0.155
        value: 50000 * 1,
        price: (50000 * 1) / 1.45 / 420,
      },
      {
        name: 'TLL', // gainAbs: -0.158
        value: 50000 * 0.95,
        price: (50000 * 0.95) / 0.75 / 420,
      },
    ].map(makeContrivedFund);

    const items = contrivedFunds.map(({ fund }) => fund);
    const prices = contrivedFunds.reduce<PriceCache['prices']>(
      (last, next) => ({ ...last, ...next.prices }),
      {},
    );

    const testStateWithMany: State = {
      ...testState,
      api: {
        ...testState.api,
        appConfig: {
          ...testState.api.appConfig,
          historyOptions: { period: FundPeriod.Month, length: 3 },
        },
      },
      [PageNonStandard.Funds]: {
        ...testState[PageNonStandard.Funds],
        items,
        startTime: getUnixTime(new Date('2020-05-01')),
        cacheTimes: [0],
        prices,
      },
    };

    const setupForSort = (): RenderResult & { store: MockStore<State> } => {
      const renderResult = setup(testStateWithMany);

      if (selectValue) {
        const select = renderResult.getByDisplayValue('Value ↓') as HTMLSelectElement;
        act(() => {
          fireEvent.change(select, { target: { value: selectValue } });
        });
        act(() => {
          fireEvent.blur(select);
        });
      }

      return renderResult;
    };

    it('should render the funds in the desired order', () => {
      expect.assertions(1);
      const { getAllByRole } = setupForSort();
      const inputs = getAllByRole('textbox') as HTMLInputElement[];
      const values = inputs.map((input) => input.value);

      expect(values).toStrictEqual(order);
    });
  });
});
