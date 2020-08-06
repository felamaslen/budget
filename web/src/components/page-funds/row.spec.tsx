import { RenderResult, render, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';

import { FundRow, Props } from './row';
import { listItemUpdated } from '~client/actions';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import { Page, Fund } from '~client/types';

describe('<FundRow />', () => {
  const state: State = {
    ...testState,
    [Page.funds]: {
      ...testState[Page.funds],
      items: [
        {
          id: numericHash('fund-1'),
          item: 'Fund 1',
          transactions: [],
          allocationTarget: 0.3,
        },
        {
          id: numericHash('fund-2'),
          item: 'Fund 2',
          transactions: [],
          allocationTarget: 0.45,
        },
      ],
    },
  };

  const createStore = createMockStore<State>();

  const fund: Fund = {
    id: numericHash('fund-1'),
    item: 'My fund',
    transactions: [],
    allocationTarget: 0.35,
  };

  const baseProps: Props = {
    isMobile: false,
    item: fund,
  };

  const setup = (
    props: Partial<Props> = {},
    customState: State = state,
    options: Partial<RenderResult> = {},
  ): RenderResult & { store: MockStore } => {
    const store = createStore(customState);
    const renderResult = render(
      <Provider store={store}>
        <FundRow {...baseProps} {...props} />
      </Provider>,
      options,
    );

    return { ...renderResult, store };
  };

  describe('target allocation adjustment', () => {
    it('should render a form element', () => {
      expect.assertions(1);
      const { getByDisplayValue } = setup();
      const input = getByDisplayValue('35') as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });

    it('should dispatch an action when changed', () => {
      expect.assertions(1);
      const { getByDisplayValue, store } = setup();
      const input = getByDisplayValue('35');

      const action = listItemUpdated(Page.funds)(
        numericHash('fund-1'),
        {
          allocationTarget: 0.25,
        },
        fund,
      );

      act(() => {
        fireEvent.change(input, { target: { value: '25' } });
      });
      act(() => {
        fireEvent.blur(input);
      });

      expect(store.getActions()[0]).toStrictEqual(action);
    });

    it('should respond to updates from the store', () => {
      expect.assertions(1);
      const { getByDisplayValue, container } = setup();
      setup(
        {
          item: {
            ...fund,
            allocationTarget: 0.45,
          },
        },
        state,
        { container },
      );

      expect(getByDisplayValue('45')).toBeInTheDocument();
    });

    describe('if the max allocation changes to less than the current value', () => {
      it('should reset the value to the max', () => {
        expect.assertions(1);
        const props = {
          item: {
            ...fund,
            allocationTarget: 0.55,
          },
        };
        const { container } = setup(props);
        const { store } = setup(
          props,
          {
            ...state,
            [Page.funds]: {
              ...state[Page.funds],
              items: [
                {
                  id: numericHash('fund-1'),
                  item: 'Fund 1',
                  transactions: [],
                  allocationTarget: 0.55,
                },
                {
                  id: numericHash('fund-2'),
                  item: 'Fund 2',
                  transactions: [],
                  allocationTarget: 0.65,
                },
              ],
            },
          },
          { container },
        );

        const action = listItemUpdated(Page.funds)(
          numericHash('fund-1'),
          {
            allocationTarget: 0.35,
          },
          props.item,
        );

        expect(store.getActions()[0]).toStrictEqual(action);
      });
    });

    describe('if the max allocation is zero', () => {
      it('should render a disabled field', () => {
        expect.assertions(1);
        const { getByDisplayValue } = setup(
          {},
          {
            ...state,
            [Page.funds]: {
              ...state[Page.funds],
              items: [
                {
                  id: numericHash('fund-1'),
                  item: 'Fund 1',
                  transactions: [],
                  allocationTarget: 0,
                },
                {
                  id: numericHash('fund-2'),
                  item: 'Fund 2',
                  transactions: [],
                  allocationTarget: 1,
                },
              ],
            },
          },
        );

        const input = getByDisplayValue('35') as HTMLInputElement;
        expect(input.disabled).toBe(true);
      });
    });
  });
});
