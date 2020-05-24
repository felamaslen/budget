import { RenderResult, render, within } from '@testing-library/react';
import addSeconds from 'date-fns/addSeconds';
import format from 'date-fns/format';
import getUnixTime from 'date-fns/getUnixTime';
import startOfDay from 'date-fns/startOfDay';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';

import { Funds } from '.';
import { Period } from '~client/constants/graph';
import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import { Page } from '~client/types';

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

  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  afterEach(async () => {
    matchMedia.clear();
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

  describe('sort order', () => {
    const testStateWithMany: State = {
      ...testState,
      [Page.funds]: {
        ...testState[Page.funds],
        items: [
          {
            id: 'very-large-value',
            item: 'My fat fund',
            transactions: getTransactionsList([
              {
                date: '2020-04-20',
                units: 420,
                cost: 6900000, // £69k
              },
            ]),
          },
          {
            id: 'small-value',
            item: 'My small fund',
            transactions: getTransactionsList([
              {
                date: '2020-04-03',
                units: 1234,
                cost: 102401, // £1024.01
              },
            ]),
          },
          {
            id: 'null-value',
            item: 'My fund without a price',
            transactions: getTransactionsList([
              {
                date: '2020-04-05',
                units: 10,
                cost: 99,
              },
            ]),
          },
          {
            id: 'large-value',
            item: 'My large fund',
            transactions: getTransactionsList([
              {
                date: '2020-04-02',
                units: 1776.229,
                cost: 603866, // £6038.66,
              },
            ]),
          },
          {
            id: 'middle-value',
            item: 'My medium fund',
            transactions: getTransactionsList([
              {
                date: '2020-04-10',
                units: 996,
                cost: 15032, // £150.32 (note that size is based on value, not cost)
              },
            ]),
          },
        ],
        period: Period.month1,
        cache: {
          [Period.month1]: {
            startTime: getUnixTime(new Date('2020-05-01')),
            cacheTimes: [0],
            prices: {
              'very-large-value': {
                values: [(100000 * 100) / 420], // => £100k value
                startIndex: 0,
              },
              'small-value': {
                values: [(500 * 100) / 1234], // => £500 value
                startIndex: 0,
              },
              'large-value': {
                values: [(18000 * 100) / 1776.229], // => £18k value
                startIndex: 0,
              },
              'middle-value': {
                values: [(2300 * 100) / 996], // => £2300 value
                startIndex: 0,
              },
            },
          },
        },
      },
    };

    const setupForSort = (): RenderResult & { store: MockStore<State> } => setup(testStateWithMany);

    it('should be by fund value, descending', () => {
      expect.assertions(5);
      const { getAllByRole } = setupForSort();
      const inputs = getAllByRole('textbox') as HTMLInputElement[];

      expect(inputs[0].value).toBe('My fat fund');
      expect(inputs[1].value).toBe('My large fund');
      expect(inputs[2].value).toBe('My medium fund');
      expect(inputs[3].value).toBe('My small fund');
      expect(inputs[4].value).toBe('My fund without a price');
    });
  });
});
