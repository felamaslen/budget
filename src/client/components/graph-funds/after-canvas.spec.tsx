import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AfterCanvas, Props } from './after-canvas';

import type { HistoryOptions } from '~client/types';
import { FundMode, FundPeriod } from '~client/types/enum';

describe('<AfterCanvas /> (funds graph)', () => {
  const changePeriod = jest.fn();
  const changeMode = jest.fn();

  const props: Props = {
    historyOptions: {
      period: FundPeriod.Year,
      length: 1,
    },
    mode: FundMode.Price,
    changeMode,
    fundItems: [],
    toggleList: {},
    setToggleList: jest.fn(),
    sidebarOpen: false,
    setSidebarOpen: jest.fn(),
    changePeriod,
  };

  describe('changing resolution', () => {
    it.each`
      query         | period              | length
      ${'3 months'} | ${FundPeriod.Month} | ${3}
      ${'YTD'}      | ${FundPeriod.Ytd}   | ${null}
      ${'1 year'}   | ${FundPeriod.Year}  | ${1}
      ${'3 years'}  | ${FundPeriod.Year}  | ${3}
      ${'5 years'}  | ${FundPeriod.Year}  | ${5}
      ${'Max'}      | ${FundPeriod.Year}  | ${0}
    `('should change the period and length query to $query', async ({ query, period, length }) => {
      expect.hasAssertions();
      const { getByText } = render(<AfterCanvas {...props} />);
      const button = getByText(query) as HTMLButtonElement;

      expect(button).toBeInTheDocument();

      userEvent.click(button);

      await waitFor(() => {
        expect(changePeriod).toHaveBeenCalledTimes(1);
      });

      expect(changePeriod).toHaveBeenCalledWith<[HistoryOptions]>({
        period,
        length,
      });
    });
  });

  describe('mode list', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<AfterCanvas {...props} />);

      const modeSelector = getByDisplayValue('Price') as HTMLSelectElement;
      expect(modeSelector).toBeInTheDocument();
    });

    it.each`
      mode              | description
      ${FundMode.Value} | ${'value'}
    `('should fire an event for the $description mode', ({ mode }) => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<AfterCanvas {...props} />);
      const modeSelector = getByDisplayValue('Price') as HTMLSelectElement;

      userEvent.selectOptions(modeSelector, mode);
      userEvent.tab();

      expect(changeMode).toHaveBeenCalledWith(mode);
    });
  });
});
