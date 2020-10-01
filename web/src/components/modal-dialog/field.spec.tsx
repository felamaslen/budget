import { render, fireEvent, RenderResult, act } from '@testing-library/react';
import React from 'react';
import { ModalDialogField, makeField, FieldTransactions } from './field';
import { FormFieldText } from '~client/components/form-field';
import { getTransactionsList } from '~client/modules/data';

describe('<ModalDialogField />', () => {
  const props = {
    id: 'some-field-id',
    field: 'item' as const,
    Field: makeField('item', FormFieldText),
    value: 'bar',
    invalid: false,
    onChange: jest.fn(),
  };

  const setup = (customProps = {}): RenderResult =>
    render(<ModalDialogField {...props} {...customProps} />);

  it('should render a label', () => {
    expect.assertions(2);
    const { getByText } = setup();
    const label = getByText('item') as HTMLLabelElement;
    expect(label).toBeInTheDocument();
    expect(label.htmlFor).toBe('some-field-id');
  });

  it('should render an input', () => {
    expect.assertions(1);
    const { getByDisplayValue } = setup();
    const input = getByDisplayValue('bar');
    expect(input).toBeInTheDocument();
  });

  describe('when the item is transactions', () => {
    const setupTransactions = (): RenderResult =>
      setup({
        field: 'transactions' as const,
        Field: FieldTransactions,
        value: getTransactionsList([
          { date: '2020-04-20', units: 130, price: 8.5, fees: 0, taxes: 0 },
        ]),
      });

    it('should render a transactions field', () => {
      expect.assertions(5);
      const { getAllByText } = setupTransactions();
      expect(getAllByText('Date:')).toHaveLength(2);
      expect(getAllByText('Units:')).toHaveLength(2);
      expect(getAllByText('Price:')).toHaveLength(2);
      expect(getAllByText('Fees:')).toHaveLength(2);
      expect(getAllByText('Taxes:')).toHaveLength(2);
    });
  });

  it('should call onChange when blurring the field', () => {
    expect.assertions(2);
    const { getByDisplayValue } = setup();
    const input = getByDisplayValue('bar');

    act(() => {
      fireEvent.change(input, { target: { value: 'hello' } });
    });

    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.blur(input);
    });

    expect(props.onChange).toHaveBeenCalledWith('item', 'hello');
  });
});
