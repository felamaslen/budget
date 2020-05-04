import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';

import Editable from '.';
import { Page } from '~client/types/app';
import { getTransactionsList } from '~client/modules/data';

describe('<Editable />', () => {
  const props = {
    page: Page.food,
    onType: jest.fn(),
    onChange: jest.fn(),
  };

  describe('active item', () => {
    const propsActive = { ...props, active: true, item: 'shop', value: 'Tesco' };

    it('should render an active input', async () => {
      expect.assertions(1);
      const { findByDisplayValue } = render(<Editable {...propsActive} />);
      const input = await findByDisplayValue('Tesco');

      expect(input).toBeInTheDocument();
    });

    it('should call onChange with the column and new value', async () => {
      expect.assertions(2);
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
      expect.assertions(1);
      const { container } = render(
        <Editable {...props} active={false} item="shop" value="Tesco" />,
      );

      expect(container).toHaveTextContent('Tesco');
    });
  });

  describe('when the value is undefined', () => {
    it('should render a blank string', () => {
      expect.assertions(1);
      const { container } = render(<Editable {...props} active={false} item="shop" />);

      expect(container).toHaveTextContent('');
    });
  });

  describe('date', () => {
    it('should render as a text input using a native Date value', async () => {
      expect.assertions(2);
      const { findByDisplayValue } = render(
        <Editable {...props} item="date" active={true} value={new Date('2020-04-20')} />,
      );
      const dateInput = (await findByDisplayValue('20/04/2020')) as HTMLInputElement;
      expect(dateInput).toBeInTheDocument();
      expect(dateInput.type).toBe('text');
    });
  });

  describe('cost', () => {
    it('should render as a text input', async () => {
      expect.assertions(4);
      const { findByDisplayValue, findByText, container } = render(
        <Editable {...props} item="cost" active={true} value={5643} />,
      );
      const costInput = (await findByDisplayValue('56.43')) as HTMLInputElement;
      expect(costInput).toBeInTheDocument();
      expect(costInput.type).toBe('text');

      act(() => {
        render(<Editable {...props} item="cost" value={5643} />, { container });
      });

      expect(costInput).not.toBeInTheDocument();
      expect(await findByText('£56.43')).toBeInTheDocument();
    });
  });

  describe('transactions', () => {
    it('should render the number of transactions', () => {
      expect.assertions(1);
      const { container } = render(
        <Editable
          {...props}
          active={false}
          item="transactions"
          value={getTransactionsList([{ date: '2020-04-20', units: 10, cost: 13 }])}
        />,
      );

      expect(container).toHaveTextContent('1');
    });

    describe('when the value is falsey', () => {
      it('should render as 0 items', () => {
        expect.assertions(1);
        const { container } = render(
          <Editable {...props} active={false} item="transactions" value={null} />,
        );

        expect(container).toHaveTextContent('0');
      });
    });
  });
});
