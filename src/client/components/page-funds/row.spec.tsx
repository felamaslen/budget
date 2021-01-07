import { RenderResult, render, act, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';

import { FundRow, Props } from './row';
import * as listMutationHooks from '~client/hooks/mutations/list';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import type { FundNative as Fund } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

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
    it('should render the value', () => {
      expect.assertions(1);
      const { getByText } = setup();
      const input = getByText('35%') as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });

    it('should call onUpdate when changed', async () => {
      expect.hasAssertions();
      jest.useFakeTimers();
      const { getByText } = setup();
      const input = getByText('35%');

      act(() => {
        fireEvent.wheel(input.parentNode as HTMLDivElement, { deltaY: -43 });
      });
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledTimes(1);
      });
      expect(onUpdate).toHaveBeenCalledWith(numericHash('fund-1'), { allocationTarget: 36 }, fund);
      jest.useRealTimers();
    });

    it('should respond to updates from the store', async () => {
      expect.hasAssertions();
      jest.useFakeTimers();
      const { getByText, container } = setup();
      act(() => {
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
      });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('45%')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });
});
