import { RenderResult, render, within, fireEvent, act } from '@testing-library/react';
import addDays from 'date-fns/addDays';
import addSeconds from 'date-fns/addSeconds';
import format from 'date-fns/format';
import getUnixTime from 'date-fns/getUnixTime';
import startOfDay from 'date-fns/startOfDay';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';
import shortid from 'shortid';
import sinon from 'sinon';

import { Funds } from '.';
import { Period } from '~client/constants/graph';
import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import { Page, Fund } from '~client/types';

describe('<PageFunds />', () => {
  const state: State = {
    ...testState,
    [Page.funds]: {
      ...testState[Page.funds],
      items: [
        {
          id: 'fund-id-some-active-fund',
          item: 'Fund A',
          transactions: getTransactionsList([
            {
              date: '2019-03-20',
              units: 69,
              cost: 420000,
            },
          ]),
        },
        {
          id: 'fund-id-some-sold-fund',
          item: 'Fund B',
          transactions: getTransactionsList([
            {
              date: '2019-04-09',
              units: 130.0312,
              cost: 992139,
            },
            {
              date: format(
                startOfDay(addSeconds(new Date('2019-04-10'), 86400 * 3.4)),
                'yyyy-MM-dd',
              ),
              units: -130.0312,
              cost: -1103001,
            },
          ]),
        },
      ],
      viewSoldFunds: true,
      period: Period.month1,
      cache: {
        [Period.month1]: {
          startTime: getUnixTime(new Date('2019-04-10')),
          cacheTimes: [0, 86400, 86400 * 3.5],
          prices: {
            'fund-id-some-sold-fund': {
              values: [7992.13, 7421.97],
              startIndex: 0,
            },
            'fund-id-some-active-fund': {
              values: [6081.9, 6213.7],
              startIndex: 1,
            },
          },
        },
      },
    },
  };

  const getStore = createStore<State>();
  const setup = (customState: State = state): RenderResult & { store: MockStore<State> } => {
    const store = getStore(customState);
    const renderResult = render(
      <Provider store={store}>
        <Funds />
      </Provider>,
    );
    return { store, ...renderResult };
  };

  let clock: sinon.SinonFakeTimers;
  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  beforeEach(() => {
    clock = sinon.useFakeTimers(new Date('2020-04-20'));
  });
  afterEach(() => {
    matchMedia.clear();
    clock.restore();
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
    // overall cost is £(4200 + 9921.39 - 11030.01) = £3091.38
    // overall value is £4287.453 (see above)
    // => overall gain is £1196.0730 or 38.690584...%
    expect(getByText('£1.2k')).toBeInTheDocument();
    expect(getByText('38.69%')).toBeInTheDocument();
  });

  it('should show the daily gain, including percentage', () => {
    expect.assertions(2);
    const { getByTestId } = setup();
    const header = getByTestId('fund-header');
    const { getByText } = within(header);
    // previous cost was £(4200 + 9921.39) = £14121.39
    // previous value was 6081.9 * 69 + 7421.97 * 130.0312 = 1384738.765464p = £13847.38765464
    // latest cost is £3091.38, latest value is £4287.453
    // day gain is thus £4287.453 - £13847.38... - (3091.38 - £14121.39) = £1470.07534536
    // in percentage terms this is £1470.07 / £13847.38 = 10.6162%
    expect(getByText('£1.5k')).toBeInTheDocument();
    expect(getByText('10.62%')).toBeInTheDocument();
  });

  describe.each`
    index | description | name        | value
    ${0}  | ${'first'}  | ${'Fund B'} | ${'£11k'}
    ${1}  | ${'second'} | ${'Fund A'} | ${'£4.3k'}
  `('the $description fund', ({ index, name, value }) => {
    const setupItem = (): HTMLLIElement => {
      const { getAllByRole } = setup();
      const items = getAllByRole('listitem') as HTMLLIElement[];
      return items[index];
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
        [Page.funds]: {
          ...state[Page.funds],
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
    case                            | selectValue  | order
    ${'[default] value-descending'} | ${undefined} | ${['FH', 'FLL', 'FL', 'HH', 'HL', 'HLL', 'TL', 'TH', 'TLL']}
    ${'value-ascending'}            | ${'Value ↑'} | ${['TLL', 'TH', 'TL', 'HLL', 'HL', 'HH', 'FL', 'FLL', 'FH']}
    ${'gain-descending'}            | ${'Gain ↓'}  | ${['FH', 'HH', 'TH', 'TL', 'FL', 'HL', 'FLL', 'HLL', 'TLL']}
    ${'gain-ascending'}             | ${'Gain ↑'}  | ${['TLL', 'HLL', 'FLL', 'HL', 'FL', 'TL', 'TH', 'HH', 'FH']}
  `('$case sort order', ({ selectValue, order }) => {
    const makeContrivedFund = ({
      name,
      value,
      cost,
    }: {
      name: string;
      value: number;
      cost: number;
    }): {
      fund: Fund;
      prices: { [id: string]: { values: number[]; startIndex: number } };
    } => {
      const id = shortid.generate();

      return {
        fund: {
          id,
          item: name,
          transactions: getTransactionsList([
            {
              date: addDays(new Date('2020-04-20'), -Math.floor(Math.random() * 100)),
              units: 420,
              cost,
            },
          ]),
        },
        prices: {
          [id]: {
            values: [value / 420],
            startIndex: 0,
          },
        },
      };
    };

    const contrivedFunds = [
      {
        name: 'FH',
        value: 150000 * 1.05,
        cost: (150000 * 1.05) / 1.55,
      },
      {
        name: 'FLL',
        value: 150000 * 1,
        cost: (150000 * 1) / 0.85,
      },
      {
        name: 'HLL',
        value: 100000 * 0.95,
        cost: (100000 * 0.95) / 0.8,
      },
      {
        name: 'HH',
        value: 100000 * 1.05,
        cost: (100000 * 1.05) / 1.5,
      },
      {
        name: 'TL',
        value: 50000 * 1.05,
        cost: (50000 * 1.05) / 1.25,
      },
      {
        name: 'FL',
        value: 150000 * 0.95,
        cost: (150000 * 0.95) / 1.2,
      },
      {
        name: 'HL',
        value: 100000 * 1,
        cost: (100000 * 1) / 1.15,
      },
      {
        name: 'TH',
        value: 50000 * 1,
        cost: (50000 * 1) / 1.45,
      },
      {
        name: 'TLL',
        value: 50000 * 0.95,
        cost: (50000 * 0.95) / 0.75,
      },
    ].map(makeContrivedFund);

    const items = contrivedFunds.map(({ fund }) => fund);
    const prices = contrivedFunds.reduce<{
      [id: string]: { values: number[]; startIndex: number };
    }>((last, next) => ({ ...last, ...next.prices }), {});

    const testStateWithMany: State = {
      ...testState,
      [Page.funds]: {
        ...testState[Page.funds],
        items,
        period: Period.month1,
        cache: {
          [Period.month1]: {
            startTime: getUnixTime(new Date('2020-05-01')),
            cacheTimes: [0],
            prices,
          },
        },
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
