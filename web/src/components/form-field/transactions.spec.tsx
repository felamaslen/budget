import { render, fireEvent, act, RenderResult, within } from '@testing-library/react';
import format from 'date-fns/format';
import React from 'react';
import { removeAtIndex } from 'replace-array';
import sinon from 'sinon';

import { FormFieldTransactions, FormFieldTransactionsInline } from './transactions';
import { modifyTransaction } from '~client/modules/data';
import { TransactionNative as Transaction } from '~client/types';

describe('<FormFieldTransactions />', () => {
  const transactions: Transaction[] = [
    { date: new Date('2017-11-10'), units: 10.5, price: 9.76, fees: 10, taxes: 3 },
    { date: new Date('2018-09-05'), units: -3, price: 1.3, fees: 4, taxes: 2 },
  ];

  const value = transactions;

  const props = {
    value,
    onChange: jest.fn(),
  };

  describe('when not focused', () => {
    it('should render only a preview of the number of transactions', () => {
      expect.assertions(1);
      const { container } = render(<FormFieldTransactionsInline {...props} />);
      expect(container).toHaveTextContent('2');
    });
  });

  const renderAsActive = (): RenderResult =>
    render(<FormFieldTransactionsInline {...props} active />);
  const renderAndFocus = (): RenderResult => {
    const renderResult = render(<FormFieldTransactionsInline {...props} />);
    const button = renderResult.getByText('2') as HTMLButtonElement;
    act(() => {
      fireEvent.click(button);
    });
    return renderResult;
  };

  describe.each`
    case         | setup
    ${'active'}  | ${renderAsActive}
    ${'focused'} | ${renderAndFocus}
  `('when $case', ({ setup }) => {
    let clock: sinon.SinonFakeTimers;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });
    afterEach(() => {
      clock.restore();
    });

    it('should render a preview of the number of transactions', () => {
      expect.assertions(1);
      const { getByText } = setup();
      expect(getByText('2')).toBeInTheDocument();
    });

    it('should render a modal dialog header', () => {
      expect.assertions(3);
      const { getByText } = setup();
      expect(getByText('Date')).toBeInTheDocument();
      expect(getByText('Units')).toBeInTheDocument();
      expect(getByText('Price')).toBeInTheDocument();
    });

    describe.each`
      description | valueIndex | displayIndex
      ${'newest'} | ${1}       | ${0}
      ${'oldest'} | ${0}       | ${1}
    `('for the $description transaction', ({ valueIndex, displayIndex }) => {
      it('should be rendered in the right order', () => {
        expect.assertions(5);
        const { getAllByRole } = setup();
        const listItems = getAllByRole('listitem');
        const displayedItem = listItems[displayIndex + 1]; // the first one is the add form
        const { getByDisplayValue } = within(displayedItem);
        expect(
          getByDisplayValue(format(new Date(transactions[valueIndex].date), 'dd/MM/yyyy')),
        ).toBeInTheDocument();
        expect(getByDisplayValue(String(transactions[valueIndex].units))).toBeInTheDocument();
        expect(getByDisplayValue(String(transactions[valueIndex].price))).toBeInTheDocument();
        expect(
          getByDisplayValue((transactions[valueIndex].fees / 100).toFixed(2)),
        ).toBeInTheDocument();
        expect(
          getByDisplayValue((transactions[valueIndex].taxes / 100).toFixed(2)),
        ).toBeInTheDocument();
      });

      it('should handle date input', () => {
        expect.assertions(3);
        const { getByDisplayValue } = setup();

        const inputDate = getByDisplayValue(
          format(new Date(transactions[valueIndex].date), 'dd/MM/yyyy'),
        );
        expect(inputDate).toBeInTheDocument();

        act(() => {
          fireEvent.change(inputDate, { target: { value: '3/4/17' } });
        });

        expect(props.onChange).not.toHaveBeenCalled();

        act(() => {
          fireEvent.blur(inputDate);
        });
        act(() => {
          clock.next();
        });

        expect(props.onChange).toHaveBeenCalledWith(
          expect.arrayContaining(
            modifyTransaction(value, valueIndex, {
              date: new Date('2017-04-03'),
            }),
          ),
        );
      });

      it.each`
        field      | inputValue  | displayValue  | oldDisplayValue
        ${'units'} | ${34.2219}  | ${'34.2219'}  | ${String(transactions[valueIndex].units)}
        ${'price'} | ${126.7692} | ${'126.7692'} | ${String(transactions[valueIndex].price)}
        ${'fees'}  | ${6754}     | ${'67.54'}    | ${(transactions[valueIndex].fees / 100).toFixed(2)}
        ${'taxes'} | ${1806}     | ${'18.06'}    | ${(transactions[valueIndex].taxes / 100).toFixed(2)}
      `('should handle $field input', ({ field, inputValue, displayValue, oldDisplayValue }) => {
        expect.assertions(3);
        const { getByDisplayValue } = setup();

        const inputPrice = getByDisplayValue(oldDisplayValue);
        expect(inputPrice).toBeInTheDocument();

        act(() => {
          fireEvent.change(inputPrice, { target: { value: displayValue } });
        });

        expect(props.onChange).not.toHaveBeenCalled();

        act(() => {
          fireEvent.blur(inputPrice);
        });
        act(() => {
          clock.next();
        });

        expect(props.onChange).toHaveBeenCalledWith(
          expect.arrayContaining(
            modifyTransaction(value, valueIndex, {
              [field]: inputValue,
            }),
          ),
        );
      });

      it('should handle input of multiple fields', () => {
        expect.assertions(2);
        const { getByDisplayValue } = setup();

        const inputDate = getByDisplayValue(
          format(new Date(transactions[valueIndex].date), 'dd/MM/yyyy'),
        );
        const inputUnits = getByDisplayValue(String(transactions[valueIndex].units));
        const inputPrice = getByDisplayValue(String(transactions[valueIndex].price));

        act(() => {
          fireEvent.change(inputPrice, { target: { value: '126.7692' } });
        });
        act(() => {
          fireEvent.blur(inputPrice);
        });

        act(() => {
          fireEvent.change(inputUnits, { target: { value: '34.2219' } });
        });
        act(() => {
          fireEvent.blur(inputUnits);
        });

        act(() => {
          fireEvent.change(inputDate, { target: { value: '3/4/17' } });
        });
        act(() => {
          fireEvent.blur(inputDate);
        });

        expect(props.onChange).toHaveBeenCalledTimes(3);
        expect(props.onChange).toHaveBeenCalledWith(
          expect.arrayContaining(
            modifyTransaction(value, valueIndex, {
              date: new Date('2017-04-03'),
              units: 34.2219,
              price: 126.7692,
            }),
          ),
        );
      });

      it('should handle removing the transaction', () => {
        expect.assertions(2);
        const { getAllByText } = setup();

        const removeButtons = getAllByText('−');
        expect(removeButtons).toHaveLength(2);

        act(() => {
          fireEvent.click(removeButtons[displayIndex]);
        });

        expect(props.onChange).toHaveBeenCalledWith(removeAtIndex(value, valueIndex));
      });
    });

    it('should handle adding a transaction', () => {
      expect.assertions(8);
      const { getByTestId, getByText } = setup();

      const inputGroup = getByTestId('create-input');
      expect(inputGroup).toBeInTheDocument();

      const inputs = inputGroup.querySelectorAll('input');

      const inputDate = inputs[0];
      const inputUnits = inputs[1];
      const inputPrice = inputs[2];

      [inputDate, inputUnits, inputPrice].forEach((input) => expect(input).toBeInTheDocument());

      const buttonAdd = getByText('+');

      act(() => {
        fireEvent.change(inputDate, { target: { value: '11/2/19' } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });
      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(inputUnits, { target: { value: '562.23' } });
      });
      act(() => {
        fireEvent.blur(inputUnits);
      });
      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(inputPrice, { target: { value: '1.72' } });
      });
      act(() => {
        fireEvent.blur(inputPrice);
      });

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.click(buttonAdd);
      });

      expect(props.onChange).toHaveBeenCalledWith([
        ...value,
        expect.objectContaining({
          date: new Date('2019-02-11'),
          units: 562.23,
          price: 1.72,
        }),
      ]);
    });

    it.each`
      property
      ${'units'}
      ${'price'}
    `('should not add a transaction with zero $property', ({ property }) => {
      expect.assertions(1);

      const { getByTestId, getByText } = setup();
      const buttonAdd = getByText('+') as HTMLButtonElement;

      const inputGroup = getByTestId('create-input');

      const inputs = inputGroup.querySelectorAll('input');

      const inputDate = inputs[0];
      const inputUnits = inputs[1];
      const inputPrice = inputs[2];

      act(() => {
        fireEvent.change(inputDate, { target: { value: '2019-02-11' } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });

      if (property !== 'units') {
        act(() => {
          fireEvent.change(inputUnits, { target: { value: '562.23' } });
        });
        act(() => {
          fireEvent.blur(inputUnits);
        });
      }
      if (property !== 'price') {
        act(() => {
          fireEvent.change(inputPrice, { target: { value: '1095.91' } });
        });
        act(() => {
          fireEvent.blur(inputPrice);
        });
      }

      act(() => {
        fireEvent.click(buttonAdd);
      });

      expect(props.onChange).not.toHaveBeenCalled();
    });
  });

  describe('when rendering as part of a modal dialog', () => {
    const setupModal = (): RenderResult => render(<FormFieldTransactions {...props} />);

    let clock: sinon.SinonFakeTimers;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });
    afterEach(() => {
      clock.restore();
    });

    it.each`
      field      | label
      ${'date'}  | ${'Date:'}
      ${'units'} | ${'Units:'}
      ${'price'} | ${'Price:'}
      ${'fees'}  | ${'Fees:'}
      ${'taxes'} | ${'Taxes:'}
    `('should render labels for the $field fields', ({ label }) => {
      expect.assertions(1);
      const { queryAllByText } = setupModal();
      expect(queryAllByText(label)).toHaveLength(3); // one for the add form
    });

    describe.each`
      description | valueIndex | displayIndex
      ${'newest'} | ${1}       | ${0}
      ${'oldest'} | ${0}       | ${1}
    `('for the $description transaction', ({ valueIndex, displayIndex }) => {
      it('should be rendered in the right order', () => {
        expect.assertions(5);
        const { getAllByRole } = setupModal();
        const listItems = getAllByRole('listitem');
        const displayedItem = listItems[displayIndex + 1]; // the first one is the add form
        const { getByDisplayValue } = within(displayedItem);
        expect(
          getByDisplayValue(format(new Date(transactions[valueIndex].date), 'yyyy-MM-dd')),
        ).toBeInTheDocument();
        expect(getByDisplayValue(String(transactions[valueIndex].units))).toBeInTheDocument();
        expect(getByDisplayValue(String(transactions[valueIndex].price))).toBeInTheDocument();
        expect(
          getByDisplayValue((transactions[valueIndex].fees / 100).toFixed(2)),
        ).toBeInTheDocument();
        expect(
          getByDisplayValue((transactions[valueIndex].taxes / 100).toFixed(2)),
        ).toBeInTheDocument();
      });

      it('should handle date input', () => {
        expect.assertions(3);
        const { getByDisplayValue } = setupModal();

        const inputDate = getByDisplayValue(
          format(new Date(transactions[valueIndex].date), 'yyyy-MM-dd'),
        );
        expect(inputDate).toBeInTheDocument();

        act(() => {
          fireEvent.change(inputDate, { target: { value: '2017-04-03' } });
        });
        act(() => {
          fireEvent.blur(inputDate);
        });
        act(() => {
          clock.next();
        });

        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onChange).toHaveBeenCalledWith(
          expect.arrayContaining(
            modifyTransaction(value, valueIndex, {
              date: new Date('2017-04-03'),
            }),
          ),
        );
      });

      it('should handle units input', () => {
        expect.assertions(3);
        const { getByDisplayValue } = setupModal();

        const inputUnits = getByDisplayValue(String(transactions[valueIndex].units));
        expect(inputUnits).toBeInTheDocument();

        act(() => {
          fireEvent.change(inputUnits, { target: { value: '34.2219' } });
        });
        act(() => {
          fireEvent.blur(inputUnits);
        });
        act(() => {
          clock.next();
        });

        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onChange).toHaveBeenCalledWith(
          expect.arrayContaining(
            modifyTransaction(value, valueIndex, {
              units: 34.2219,
            }),
          ),
        );
      });

      it('should handle price input', () => {
        expect.assertions(3);
        const { getByDisplayValue } = setupModal();

        const inputPrice = getByDisplayValue(String(transactions[valueIndex].price));
        expect(inputPrice).toBeInTheDocument();

        act(() => {
          fireEvent.change(inputPrice, { target: { value: '126.7692' } });
        });
        act(() => {
          fireEvent.blur(inputPrice);
        });
        act(() => {
          clock.next();
        });

        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onChange).toHaveBeenCalledWith(
          expect.arrayContaining(
            modifyTransaction(value, valueIndex, {
              price: 126.7692,
            }),
          ),
        );
      });

      it('should handle input of multiple fields', () => {
        expect.assertions(2);
        const { getByDisplayValue } = setupModal();

        const inputDate = getByDisplayValue(
          format(new Date(transactions[valueIndex].date), 'yyyy-MM-dd'),
        );
        const inputUnits = getByDisplayValue(String(transactions[valueIndex].units));
        const inputPrice = getByDisplayValue(String(transactions[valueIndex].price));

        act(() => {
          fireEvent.change(inputPrice, { target: { value: '126.7692' } });
        });
        act(() => {
          fireEvent.blur(inputPrice);
        });

        act(() => {
          fireEvent.change(inputUnits, { target: { value: '34.2219' } });
        });
        act(() => {
          fireEvent.blur(inputUnits);
        });

        act(() => {
          fireEvent.change(inputDate, { target: { value: '2017-04-03' } });
        });
        act(() => {
          fireEvent.blur(inputDate);
        });

        expect(props.onChange).toHaveBeenCalledTimes(3);
        expect(props.onChange).toHaveBeenCalledWith(
          expect.arrayContaining(
            modifyTransaction(value, valueIndex, {
              date: new Date('2017-04-03'),
              units: 34.2219,
              price: 126.7692,
            }),
          ),
        );
      });

      it('should handle removing the transaction', () => {
        expect.assertions(2);
        const { getAllByText } = setupModal();

        const removeButtons = getAllByText('−');
        expect(removeButtons).toHaveLength(2);

        act(() => {
          fireEvent.click(removeButtons[displayIndex]);
        });

        expect(props.onChange).toHaveBeenCalledWith(removeAtIndex(value, valueIndex));
      });
    });

    it('should handle adding a transaction', () => {
      expect.assertions(8);
      const { getByTestId, getByText } = setupModal();

      const inputGroup = getByTestId('create-input');
      expect(inputGroup).toBeInTheDocument();

      const inputs = inputGroup.querySelectorAll('input');

      const inputDate = inputs[0];
      const inputUnits = inputs[1];
      const inputPrice = inputs[2];

      [inputDate, inputUnits, inputPrice].forEach((input) => expect(input).toBeInTheDocument());

      const buttonAdd = getByText('+');

      act(() => {
        fireEvent.change(inputDate, { target: { value: '2019-02-11' } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });
      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(inputUnits, { target: { value: '562.23' } });
      });
      act(() => {
        fireEvent.blur(inputUnits);
      });
      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(inputPrice, { target: { value: '1095.91' } });
      });
      act(() => {
        fireEvent.blur(inputPrice);
      });

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.click(buttonAdd);
      });

      expect(props.onChange).toHaveBeenCalledWith([
        ...value,
        expect.objectContaining({
          date: new Date('2019-02-11'),
          units: 562.23,
          price: 1095.91,
        }),
      ]);
    });

    it.each`
      property
      ${'units'}
      ${'cost'}
    `('should not add a transaction with zero $property', ({ property }) => {
      expect.assertions(1);

      const { getByTestId, getByText } = setupModal();
      const buttonAdd = getByText('+') as HTMLButtonElement;

      const inputGroup = getByTestId('create-input');

      const inputs = inputGroup.querySelectorAll('input');

      const inputDate = inputs[0];
      const inputUnits = inputs[1];
      const inputCost = inputs[2];

      act(() => {
        fireEvent.change(inputDate, { target: { value: '2019-02-11' } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });

      if (property !== 'units') {
        act(() => {
          fireEvent.change(inputUnits, { target: { value: '562.23' } });
        });
        act(() => {
          fireEvent.blur(inputUnits);
        });
      }
      if (property !== 'cost') {
        act(() => {
          fireEvent.change(inputCost, { target: { value: '1095.91' } });
        });
        act(() => {
          fireEvent.blur(inputCost);
        });
      }

      act(() => {
        fireEvent.click(buttonAdd);
      });

      expect(props.onChange).not.toHaveBeenCalled();
    });
  });
});
