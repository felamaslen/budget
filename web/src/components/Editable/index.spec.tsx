import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';

import Editable from '.';
import { Page } from '~client/types/app';

describe('<Editable />', () => {
  const props = {
    page: Page.food,
    onType: jest.fn(),
    onChange: jest.fn(),
  };

  describe('active item', () => {
    const propsActive = { ...props, active: true, item: 'shop', value: 'Tesco' };

    it('should render an active input', async () => {
      const { findByDisplayValue } = render(<Editable {...propsActive} />);
      const input = await findByDisplayValue('Tesco');

      expect(input).toBeInTheDocument();
    });

    it('should call onChange with the column and new value', async () => {
      const { findByDisplayValue, container } = render(<Editable {...propsActive} />);
      const input = await findByDisplayValue('Tesco');

      act(() => {
        fireEvent.change(input, { target: { value: 'Wilko' } });
      });

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<Editable {...propsActive} active={false} />, { container });
      });

      expect(props.onChange).toHaveBeenCalledWith('shop', 'Wilko');
    });
  });

  describe('inactive item', () => {
    it('should render a static field', () => {
      const { container } = render(
        <Editable {...props} active={false} item="shop" value="Tesco" />,
      );

      expect(container).toHaveTextContent('Tesco');
    });
  });

  describe('when the value is undefined', () => {
    it('should render a blank string', () => {
      const { container } = render(<Editable {...props} active={false} item="shop" />);

      expect(container).toHaveTextContent('');
    });
  });

  describe('transactions', () => {
    describe('when the value is falsey', () => {
      it('should render as 0 items', () => {
        const { container } = render(
          <Editable {...props} active={false} item="transactions" value={null} />,
        );

        expect(container).toHaveTextContent('0');
      });
    });
  });
});
