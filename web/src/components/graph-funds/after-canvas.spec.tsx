import { render, act, fireEvent } from '@testing-library/react';
import React from 'react';

import { AfterCanvas } from './after-canvas';
import { Period, Mode } from '~client/constants/graph';

describe('<AfterCanvas /> (funds graph)', () => {
  const props = {
    isMobile: false,
    period: Period.month1,
    mode: Mode.Price,
    fundItems: [],
    toggleList: {},
    setToggleList: jest.fn(),
    changePeriod: jest.fn(),
  };

  describe('Period list', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<AfterCanvas {...props} />);

      const periodSelector = getByDisplayValue('1 month') as HTMLSelectElement;
      expect(periodSelector).toBeInTheDocument();
    });

    it.each`
      period           | description
      ${Period.year5}  | ${'year5'}
      ${Period.year1}  | ${'year1'}
      ${Period.month3} | ${'month3'}
    `('should fire an event for the $description period', ({ period }) => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<AfterCanvas {...props} />);
      const periodSelector = getByDisplayValue('1 month') as HTMLSelectElement;

      act(() => {
        fireEvent.change(periodSelector, { target: { value: period } });
      });
      act(() => {
        fireEvent.blur(periodSelector);
      });

      expect(props.changePeriod).toHaveBeenCalledWith(period);
    });
  });
});
