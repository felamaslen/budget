import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStoreEnhanced } from 'redux-mock-store';
import sinon from 'sinon';

import StocksList from '.';
import { stocksListRequested } from '~client/actions';
import { IDENTITY } from '~client/modules/data';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';

describe('<StocksList />', () => {
  const props = {};

  const mockStore = createStore();

  const getContainer = (
    customProps = {},
    customState: (state: State) => State = IDENTITY,
  ): RenderResult & { store: MockStoreEnhanced<State> } => {
    const state: State = customState({
      ...testState,
      stocks: {
        ...testState.stocks,
        loading: false,
        indices: [
          {
            code: 'SPX',
            name: 'S&P 500',
            gain: 0.65,
            up: true,
            down: false,
          },
          {
            code: 'FTSE',
            name: 'FTSE 100',
            gain: -0.21,
            up: false,
            down: true,
          },
        ],
        shares: [
          {
            code: 'CTY.L',
            name: 'City of London Investment Trust',
            weight: 0.3,
            gain: 0.01,
            price: 406.23,
            up: false,
            down: true,
          },
          {
            code: 'SMT.L',
            name: 'Scottish Mortgage Investment Trust',
            weight: 0.7,
            gain: -0.54,
            price: 492.21,
            up: false,
            down: true,
          },
        ],
        history: [],
        lastPriceUpdate: 133,
      },
    });

    const store = mockStore(state);

    const utils = render(
      <Provider store={store}>
        <StocksList {...props} {...customProps} />
      </Provider>,
    );

    return { store, ...utils } as RenderResult & { store: MockStoreEnhanced<State> };
  };

  it('should request a stocks list when it renders', () => {
    expect.assertions(2);
    const clock = sinon.useFakeTimers();

    const { store } = getContainer();

    const action = stocksListRequested();

    expect(store.getActions()).not.toStrictEqual(expect.arrayContaining([action]));
    clock.tick(1);
    expect(store.getActions()).toStrictEqual(expect.arrayContaining([action]));

    clock.restore();
  });

  it.each`
    code       | title                                   | price     | change
    ${'CTY.L'} | ${'City of London Investment Trust'}    | ${406.23} | ${'0.01%'}
    ${'SMT.L'} | ${'Scottish Mortgage Investment Trust'} | ${492.21} | ${'-0.54%'}
  `('should render $code stock', ({ code, title, price, change }) => {
    expect.assertions(9);

    const { queryByText, queryByTitle, getByText } = getContainer();

    const item = queryByTitle(title);
    expect(item).toBeInTheDocument();

    const elemCode = getByText(code);
    const elemTitle = queryByText(title);
    const elemPrice = queryByText(String(price));
    const elemChange = queryByText(change);

    expect(elemCode).toBeInTheDocument();
    expect(elemTitle).toBeInTheDocument();
    expect(elemPrice).toBeInTheDocument();
    expect(elemChange).toBeInTheDocument();

    expect(item).toContainElement(elemCode);
    expect(item).toContainElement(elemTitle);
    expect(item).toContainElement(elemPrice);
    expect(item).toContainElement(elemChange);
  });
});
