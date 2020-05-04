import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { removeAtIndex } from 'replace-array';

import FormFieldTransactions, { Props } from './transactions';
import { getTransactionsList, modifyTransaction } from '~client/modules/data';
import { Transaction, TransactionRaw } from '~client/types/funds';

describe('<FormFieldTransactions />', () => {
  const transactions: TransactionRaw[] = [
    { date: '2017-11-10', units: 10.5, cost: 50 },
    { date: '2018-09-05', units: -3, cost: -40 },
  ];

  const value: Transaction[] = getTransactionsList(transactions);

  const props = {
    value,
    onChange: jest.fn(),
  };

  describe('when inactive', () => {
    const propsInactive: Props = {
      ...props,
      active: false,
    };

    it('should render a preview of the number of transactions', () => {
      expect.assertions(2);
      const { container, getByText } = render(<FormFieldTransactions {...propsInactive} />);

      expect(container.childNodes).toHaveLength(1);
      expect(getByText('2')).toBeInTheDocument();
    });
  });

  describe('when active', () => {
    const propsActive = {
      ...props,
      active: true,
      create: true,
      onChange: jest.fn(),
    };

    it('should render a preview of the number of transactions', () => {
      expect.assertions(1);
      const { getByText } = render(<FormFieldTransactions {...propsActive} />);
      expect(getByText('2')).toBeInTheDocument();
    });

    it('should render a modal dialog', () => {
      expect.assertions(3);
      const { getByText } = render(<FormFieldTransactions {...propsActive} />);

      expect(getByText('Date')).toBeInTheDocument();
      expect(getByText('Units')).toBeInTheDocument();
      expect(getByText('Cost')).toBeInTheDocument();
    });

    it.each([[0], [1]])('should handle date input', async index => {
      expect.assertions(4);
      const { container, findByDisplayValue } = render(<FormFieldTransactions {...propsActive} />);

      const inputDate = await findByDisplayValue(transactions[index].date);
      expect(inputDate).toBeInTheDocument();

      act(() => {
        fireEvent.change(inputDate, { target: { value: '2017-04-03' } });
      });

      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(inputDate);
      });

      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldTransactions {...propsActive} active={false} />, { container });
      });

      expect(propsActive.onChange).toHaveBeenCalledWith(
        modifyTransaction(value, index, {
          date: new Date('2017-04-03'),
        }),
      );
    });

    it.each([[0], [1]])('should handle units input', async index => {
      expect.assertions(4);
      const { container, findByDisplayValue } = render(<FormFieldTransactions {...propsActive} />);

      const inputUnits = await findByDisplayValue(String(transactions[index].units));
      expect(inputUnits).toBeInTheDocument();

      act(() => {
        fireEvent.change(inputUnits, { target: { value: '34.2219' } });
      });

      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(inputUnits);
      });

      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldTransactions {...propsActive} active={false} />, { container });
      });

      expect(propsActive.onChange).toHaveBeenCalledWith(
        modifyTransaction(value, index, {
          units: 34.2219,
        }),
      );
    });

    it.each([[0], [1]])('should handle cost input', async index => {
      expect.assertions(4);
      const { container, findByDisplayValue } = render(<FormFieldTransactions {...propsActive} />);

      const inputCost = await findByDisplayValue(String(transactions[index].cost / 100));
      expect(inputCost).toBeInTheDocument();

      act(() => {
        fireEvent.change(inputCost, { target: { value: '126.7692' } });
      });

      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(inputCost);
      });

      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldTransactions {...propsActive} active={false} />, { container });
      });

      expect(propsActive.onChange).toHaveBeenCalledWith(
        modifyTransaction(value, index, {
          cost: 12677,
        }),
      );
    });

    it('should handle adding a transaction', async () => {
      expect.assertions(9);
      const { container, findByTestId, findByText } = render(
        <FormFieldTransactions {...propsActive} />,
      );

      const inputGroup = await findByTestId('create-input');
      expect(inputGroup).toBeInTheDocument();

      const inputs = inputGroup.querySelectorAll('input');

      const inputDate = inputs[0];
      const inputUnits = inputs[1];
      const inputCost = inputs[2];

      [inputDate, inputUnits, inputCost].forEach(input => expect(input).toBeInTheDocument());

      const buttonAdd = await findByText('+');

      act(() => {
        fireEvent.change(inputDate, { target: { value: '2019-02-11' } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });
      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(inputUnits, { target: { value: '562.23' } });
      });
      act(() => {
        fireEvent.blur(inputUnits);
      });
      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(inputCost, { target: { value: '1095.91' } });
      });
      act(() => {
        fireEvent.blur(inputCost);
      });

      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.click(buttonAdd);
      });

      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldTransactions {...propsActive} active={false} />, { container });
      });

      expect(propsActive.onChange).toHaveBeenCalledWith([
        ...value,
        expect.objectContaining({
          date: new Date('2019-02-11'),
          units: 562.23,
          cost: 109591,
        }),
      ]);
    });

    it.each([[0], [1]])('should handle removing a transaction', async index => {
      expect.assertions(3);
      const { container, findAllByText } = render(<FormFieldTransactions {...propsActive} />);

      const removeButtons = await findAllByText('−');
      expect(removeButtons).toHaveLength(2);

      act(() => {
        fireEvent.click(removeButtons[index]);
      });

      expect(propsActive.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldTransactions {...propsActive} active={false} />, { container });
      });

      expect(propsActive.onChange).toHaveBeenCalledWith(removeAtIndex(value, index));
    });
  });
});
