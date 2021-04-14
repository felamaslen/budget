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
    isMobile: false,
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
    it.each`
      query         | period              | length
      ${'3 months'} | ${FundPeriod.Month} | ${3}
      ${'YTD'}      | ${FundPeriod.Ytd}   | ${undefined}
      ${'1 year'}   | ${FundPeriod.Year}  | ${1}
      ${'3 years'}  | ${FundPeriod.Year}  | ${3}
      ${'5 years'}  | ${FundPeriod.Year}  | ${5}
      ${'Max'}      | ${FundPeriod.Year}  | ${0}
    `('should change the period and length query to $query', async ({ query, period, length }) => {
      expect.hasAssertions();
      const { getByText } = render(<AfterCanvas {...props} />);
      const button = getByText(query) as HTMLButtonElement;

      expect(button).toBeInTheDocument();

      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(changePeriod).toHaveBeenCalledTimes(1);
      });

      expect(changePeriod).toHaveBeenCalledWith<[HistoryOptions]>({
        period,
        length,
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
