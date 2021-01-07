import { render, act, fireEvent } from '@testing-library/react';
import React from 'react';

import { AfterCanvas, Props } from './after-canvas';
import { fundPeriods, Mode } from '~client/constants/graph';

describe('<AfterCanvas /> (funds graph)', () => {
  const changePeriod = jest.fn();
  const changeMode = jest.fn();

  const props: Props = {
    isMobile: false,
    historyOptions: fundPeriods.month1.query,
    modeList: [Mode.Price, Mode.Value],
    mode: Mode.Price,
    changeMode,
    fundItems: [],
    toggleList: {},
    setToggleList: jest.fn(),
    changePeriod,
  };

  describe('Period list', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<AfterCanvas {...props} />);

      const periodSelector = getByDisplayValue('1 month') as HTMLSelectElement;
      expect(periodSelector).toBeInTheDocument();
    });

    it.each`
      historyOptions              | description
      ${fundPeriods.year5.query}  | ${'5 years'}
      ${fundPeriods.year1.query}  | ${'1 year'}
      ${fundPeriods.month3.query} | ${'3 months'}
    `('should fire an event for the "$description" period', ({ historyOptions, description }) => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<AfterCanvas {...props} />);
      const periodSelector = getByDisplayValue('1 month') as HTMLSelectElement;

      act(() => {
        fireEvent.change(periodSelector, { target: { value: description } });
      });
      act(() => {
        fireEvent.blur(periodSelector);
      });

      expect(changePeriod).toHaveBeenCalledWith(historyOptions);
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
