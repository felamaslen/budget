import { RenderResult, act, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import numericHash from 'string-hash';

import { FundRow, Props } from './row';
import * as listMutationHooks from '~client/hooks/mutations/list';
import { testState } from '~client/test-data';
import { renderWithStore } from '~client/test-utils';
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

  const fund: Fund = {
    id: numericHash('fund-1'),
    item: 'My fund',
    transactions: [],
    stockSplits: [],
    allocationTarget: 35,
  };

  const baseProps: Props = {
    isMobile: false,
    item: fund,
  };

  const setup = (
    props: Partial<Props> = {},
    renderOptions: Partial<RenderResult> = {},
  ): ReturnType<typeof renderWithStore> =>
    renderWithStore(<FundRow {...baseProps} {...props} />, {
      customState: {
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('fund-1'),
              item: 'Fund 1',
              transactions: [],
              stockSplits: [],
              allocationTarget: 30,
            },
            {
              id: numericHash('fund-2'),
              item: 'Fund 2',
              transactions: [],
              stockSplits: [],
              allocationTarget: 45,
            },
          ],
        },
      },
      renderOptions,
    });

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
          { container },
        );
      });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('45%')).toBeInTheDocument();
      });
    });
  });
});
