import { RenderResult, render, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';

import { FundRow, Props } from './row';
import * as listMutationHooks from '~client/hooks/mutations/list';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import { FundNative as Fund, PageNonStandard } from '~client/types';

describe('<FundRow />', () => {
  const onCreate = jest.fn();
  const onUpdate = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.spyOn(listMutationHooks, 'useListCrudFunds').mockReturnValue({
      onCreate,
      onUpdate,
      onDelete,
    });
  });

  const state: State = {
    ...testState,
    [PageNonStandard.Funds]: {
      ...testState[PageNonStandard.Funds],
      items: [
        {
          id: numericHash('fund-1'),
          item: 'Fund 1',
          transactions: [],
          allocationTarget: 30,
        },
        {
          id: numericHash('fund-2'),
          item: 'Fund 2',
          transactions: [],
          allocationTarget: 45,
        },
      ],
    },
  };

  const createStore = createMockStore<State>();

  const fund: Fund = {
    id: numericHash('fund-1'),
    item: 'My fund',
    transactions: [],
    allocationTarget: 35,
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

    it('should call onUpdate when changed', () => {
      expect.assertions(2);
      const { getByDisplayValue } = setup();
      const input = getByDisplayValue('35');

      act(() => {
        fireEvent.change(input, { target: { value: '25' } });
      });
      act(() => {
        fireEvent.blur(input);
      });

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(numericHash('fund-1'), { allocationTarget: 25 }, fund);
    });

    it('should respond to updates from the store', () => {
      expect.assertions(1);
      const { getByDisplayValue, container } = setup();
      setup(
        {
          item: {
            ...fund,
            allocationTarget: 45,
          },
        },
        state,
        { container },
      );

      expect(getByDisplayValue('45')).toBeInTheDocument();
    });

    describe('if the max allocation is zero', () => {
      it('should render a disabled field', () => {
        expect.assertions(1);
        const { getByDisplayValue } = setup(
          {},
          {
            ...state,
            [PageNonStandard.Funds]: {
              ...state[PageNonStandard.Funds],
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
                  allocationTarget: 100,
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
