import sinon from 'sinon';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';

import FormFieldColor from './color';

describe('<FormFieldColor />', () => {
  const props = {
    value: '#aa09b3',
    onChange: jest.fn(),
  };

  describe('when inactive', () => {
    it('should render a button', () => {
      const { getByRole } = render(<FormFieldColor {...props} />);
      const activateButton = getByRole('button');

      expect(activateButton).toBeInTheDocument();
      expect(activateButton).toHaveTextContent('Edit colour');
    });

    it('should not render a colour picker', () => {
      const { queryByDisplayValue } = render(<FormFieldColor {...props} />);
      const hexField = queryByDisplayValue('AA09B3');
      expect(hexField).not.toBeInTheDocument();
    });
  });

  describe('when active', () => {
    it('should render a colour picker', () => {
      const { getByText, getByDisplayValue } = render(<FormFieldColor {...props} />);

      const activateButton = getByText('Edit colour');
      act(() => {
        fireEvent.click(activateButton);
      });

      const hexField = getByDisplayValue('AA09B3');
      expect(hexField).toBeInTheDocument();
    });

    it('should fire the onChange event', () => {
      const clock = sinon.useFakeTimers();

      const { getByText, getByDisplayValue } = render(<FormFieldColor {...props} />);

      const activateButton = getByText('Edit colour');
      act(() => {
        fireEvent.click(activateButton);
      });

      const hexField = getByDisplayValue('AA09B3');
      expect(hexField).toBeInTheDocument();

      act(() => {
        fireEvent.change(hexField, { target: { value: 'aBc123' } });
        fireEvent.blur(hexField);
      });

      expect(props.onChange).not.toHaveBeenCalled();

      clock.tick(101);
      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith('#abc123');

      clock.restore();
    });
  });
});
