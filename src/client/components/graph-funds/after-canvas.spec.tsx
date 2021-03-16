import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import { AfterCanvas, Props } from './after-canvas';

import { Mode } from '~client/constants/graph';
import type { HistoryOptions } from '~client/types';
import { FundPeriod } from '~client/types/enum';

describe('<AfterCanvas /> (funds graph)', () => {
  const changePeriod = jest.fn();
  const changeMode = jest.fn();

  const props: Props = {
    historyOptions: {
      period: FundPeriod.Year,
      length: 1,
    },
    modeList: [Mode.Price, Mode.Value],
    mode: Mode.Price,
    changeMode,
    fundItems: [],
    toggleList: {},
    setToggleList: jest.fn(),
    sidebarOpen: false,
    setSidebarOpen: jest.fn(),
    changePeriod,
  };

  describe('Changing resolution', () => {
    it('should change the length', async () => {
      expect.hasAssertions();

      const { getByDisplayValue } = render(<AfterCanvas {...props} />);

      const inputLength = getByDisplayValue('1');

      act(() => {
        fireEvent.change(inputLength, { target: { value: '2' } });
      });

      await waitFor(() => {
        expect(changePeriod).toHaveBeenCalledTimes(1);
      });

      expect(changePeriod).toHaveBeenCalledWith<[HistoryOptions]>({
        period: FundPeriod.Year,
        length: 2,
      });
    });

    it('should change the period', async () => {
      expect.hasAssertions();

      const { getByDisplayValue } = render(<AfterCanvas {...props} />);

      const inputPeriod = getByDisplayValue('Year');

      act(() => {
        fireEvent.change(inputPeriod, { target: { value: 'Month' } });
      });

      await waitFor(() => {
        expect(changePeriod).toHaveBeenCalledTimes(1);
      });

      expect(changePeriod).toHaveBeenCalledWith<[HistoryOptions]>({
        period: FundPeriod.Month,
        length: 6,
      });
    });

    describe('when switching periods', () => {
      it('should remember the last length for the given period', async () => {
        expect.hasAssertions();

        const { getByDisplayValue } = render(<AfterCanvas {...props} />);

        const inputPeriod = getByDisplayValue('Year');
        const inputLength = getByDisplayValue('1');

        act(() => {
          fireEvent.change(inputLength, { target: { value: '7' } });
        });

        await waitFor(() => {
          expect(changePeriod).toHaveBeenCalledTimes(1);
        });

        expect(changePeriod).toHaveBeenCalledWith<[HistoryOptions]>({
          period: FundPeriod.Year,
          length: 7,
        });

        changePeriod.mockClear();

        act(() => {
          fireEvent.change(inputPeriod, { target: { value: 'Month' } });
        });

        await waitFor(() => {
          expect(changePeriod).toHaveBeenCalledTimes(1);
        });

        expect(changePeriod).toHaveBeenCalledWith<[HistoryOptions]>({
          period: FundPeriod.Month,
          length: 6,
        });

        changePeriod.mockClear();

        act(() => {
          fireEvent.change(inputLength, { target: { value: '17' } });
        });

        await waitFor(() => {
          expect(changePeriod).toHaveBeenCalledTimes(1);
        });

        expect(changePeriod).toHaveBeenCalledWith<[HistoryOptions]>({
          period: FundPeriod.Month,
          length: 17,
        });

        changePeriod.mockClear();

        act(() => {
          fireEvent.change(inputPeriod, { target: { value: 'Year' } });
        });

        await waitFor(() => {
          expect(changePeriod).toHaveBeenCalledTimes(1);
        });

        expect(changePeriod).toHaveBeenCalledWith<[HistoryOptions]>({
          period: FundPeriod.Year,
          length: 7,
        });

        changePeriod.mockClear();

        act(() => {
          fireEvent.change(inputPeriod, { target: { value: 'Month' } });
        });

        await waitFor(() => {
          expect(changePeriod).toHaveBeenCalledTimes(1);
        });

        expect(changePeriod).toHaveBeenCalledWith<[HistoryOptions]>({
          period: FundPeriod.Month,
          length: 17,
        });
      });
    });
  });

  describe('Mode list', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<AfterCanvas {...props} />);

      const modeSelector = getByDisplayValue('Price') as HTMLSelectElement;
      expect(modeSelector).toBeInTheDocument();
    });

    it.each`
      mode          | description
      ${Mode.Value} | ${'value'}
    `('should fire an event for the $description mode', ({ mode }) => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<AfterCanvas {...props} />);
      const modeSelector = getByDisplayValue('Price') as HTMLSelectElement;

      act(() => {
        fireEvent.change(modeSelector, { target: { value: mode } });
      });
      act(() => {
        fireEvent.blur(modeSelector);
      });

      expect(changeMode).toHaveBeenCalledWith(mode);
    });
  });
});
