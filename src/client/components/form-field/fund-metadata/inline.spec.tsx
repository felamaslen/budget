import { render, fireEvent, act, RenderResult, within } from '@testing-library/react';
import format from 'date-fns/format';
import React from 'react';
import { removeAtIndex } from 'replace-array';

import { FormFieldFundMetadata, PropsComposite } from './inline';
import type { CompositeValue } from './types';

import { partialModification } from '~client/modules/data';
import type {
  StockSplitNative,
  TransactionNative as Transaction,
  TransactionNative,
} from '~client/types';

describe(FormFieldFundMetadata.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const transactions: Transaction[] = [
    { date: new Date('2017-11-10'), units: 10.5, price: 9.76, fees: 10, taxes: 3 },
    { date: new Date('2018-09-05'), units: -3, price: 1.3, fees: 4, taxes: 2 },
  ];
  const stockSplits: StockSplitNative[] = [
    { date: new Date('2020-04-20'), ratio: 10 },
    { date: new Date('2021-02-05'), ratio: 3 },
  ];

  const value: CompositeValue = { transactions, stockSplits };

  const props: PropsComposite = {
    value,
    onChange: jest.fn(),
  };

  describe('when not focused', () => {
    it('should render only a preview of the number of transactions', () => {
      expect.assertions(1);
      const { container } = render(<FormFieldFundMetadata {...props} />);
      expect(container).toHaveTextContent('2');
    });
  });

  const renderAsActive = (): RenderResult => render(<FormFieldFundMetadata {...props} active />);
  const renderAndFocus = (): RenderResult => {
    const renderResult = render(<FormFieldFundMetadata {...props} />);
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
  `('when $case', ({ setup }: { setup: () => RenderResult }) => {
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

    it('should render a tab bar', () => {
      expect.assertions(2);
      const { getByText } = setup();
      expect(getByText('Transactions')).toBeInTheDocument();
      expect(getByText('Stock splits')).toBeInTheDocument();
    });

    describe('when editing stock splits', () => {
      const setupStockSplits = (): RenderResult => {
        const renderResult: RenderResult = setup();
        act(() => {
          fireEvent.click(renderResult.getByText('Stock splits'));
        });
        return renderResult;
      };

      it('should handle adding a stock split', () => {
        expect.assertions(6);
        const { getByTestId, getByText } = setupStockSplits();

        const inputGroup = getByTestId('stock-split-create-input');
        expect(inputGroup).toBeInTheDocument();

        const inputs = inputGroup.querySelectorAll('input');

        const inputDate = inputs[0];
        const inputRatio = inputs[1];

        [inputDate, inputRatio].forEach((input) => expect(input).toBeInTheDocument());

        const buttonAdd = getByText('+');

        act(() => {
          fireEvent.change(inputDate, { target: { value: '12/4/20' } });
        });
        act(() => {
          fireEvent.blur(inputDate);
        });
        expect(props.onChange).not.toHaveBeenCalled();

        act(() => {
          fireEvent.change(inputRatio, { target: { value: '6' } });
        });
        act(() => {
          fireEvent.blur(inputRatio);
        });

        expect(props.onChange).not.toHaveBeenCalled();

        act(() => {
          fireEvent.click(buttonAdd);
          jest.runAllTimers();
        });

        expect(props.onChange).toHaveBeenCalledWith({
          transactions: value.transactions,
          stockSplits: [
            ...value.stockSplits,
            expect.objectContaining<StockSplitNative>({
              date: new Date('2020-04-12'),
              ratio: 6,
            }),
          ],
        });
      });

      it.each`
        case          | ratio
        ${'zero'}     | ${0}
        ${'negative'} | ${-2}
      `('should not add a stock split with $case ratio', ({ ratio }) => {
        expect.assertions(1);

        const { getByTestId, getByText } = setupStockSplits();
        const buttonAdd = getByText('+') as HTMLButtonElement;

        const inputGroup = getByTestId('stock-split-create-input');

        const inputs = inputGroup.querySelectorAll('input');

        const inputDate = inputs[0];
        const inputRatio = inputs[1];

        act(() => {
          fireEvent.change(inputDate, { target: { value: '2020-04-20' } });
        });
        act(() => {
          fireEvent.blur(inputDate);
        });

        act(() => {
          fireEvent.change(inputRatio, { target: { value: String(ratio) } });
        });
        act(() => {
          fireEvent.blur(inputRatio);
        });

        act(() => {
          fireEvent.click(buttonAdd);
          jest.runAllTimers();
        });

        expect(props.onChange).not.toHaveBeenCalled();
      });

      describe.each`
        description | valueIndex | displayIndex
        ${'newest'} | ${1}       | ${0}
        ${'oldest'} | ${0}       | ${1}
      `('for the $description stock split', ({ valueIndex, displayIndex }) => {
        it('should be rendered in the right order', () => {
          expect.assertions(2);
          const { getAllByRole } = setupStockSplits();
          const listItems = getAllByRole('listitem');
          const displayedItem = listItems[displayIndex + 1]; // the first one is the add form
          const { getByDisplayValue } = within(displayedItem);
          expect(
            getByDisplayValue(format(new Date(stockSplits[valueIndex].date), 'dd/MM/yyyy')),
          ).toBeInTheDocument();
          expect(getByDisplayValue(String(stockSplits[valueIndex].ratio))).toBeInTheDocument();
        });

        it('should handle date input', () => {
          expect.assertions(4);
          const { getByDisplayValue } = setupStockSplits();

          const inputDate = getByDisplayValue(
            format(new Date(stockSplits[valueIndex].date), 'dd/MM/yyyy'),
          );
          expect(inputDate).toBeInTheDocument();

          act(() => {
            fireEvent.change(inputDate, { target: { value: '1/9/20' } });
          });

          expect(props.onChange).not.toHaveBeenCalled();

          act(() => {
            fireEvent.blur(inputDate);
          });

          act(() => {
            jest.runAllTimers();
          });
          expect(props.onChange).toHaveBeenCalledTimes(1);
          expect(props.onChange).toHaveBeenCalledWith({
            transactions: value.transactions,
            stockSplits: expect.arrayContaining(
              partialModification(value.stockSplits, valueIndex, {
                date: new Date('2020-09-01'),
              }),
            ),
          });
        });

        it('should handle ratio input', () => {
          expect.assertions(4);

          const field = 'ratio';
          const inputValue = 25;
          const displayValue = '25';
          const oldDisplayValue = String(stockSplits[valueIndex].ratio);

          const { getByDisplayValue } = setupStockSplits();

          const inputRatio = getByDisplayValue(oldDisplayValue);
          expect(inputRatio).toBeInTheDocument();

          act(() => {
            fireEvent.change(inputRatio, { target: { value: displayValue } });
          });

          expect(props.onChange).not.toHaveBeenCalled();

          act(() => {
            fireEvent.blur(inputRatio);
          });

          act(() => {
            jest.runAllTimers();
          });
          expect(props.onChange).toHaveBeenCalledTimes(1);
          expect(props.onChange).toHaveBeenCalledWith({
            transactions: value.transactions,
            stockSplits: expect.arrayContaining(
              partialModification(value.stockSplits, valueIndex, {
                [field]: inputValue,
              }),
            ),
          });
        });

        it('should handle removing the stock split', () => {
          expect.assertions(2);
          const { getAllByText } = setupStockSplits();

          const removeButtons = getAllByText('−');
          expect(removeButtons).toHaveLength(2);

          act(() => {
            fireEvent.click(removeButtons[displayIndex]);
          });

          expect(props.onChange).toHaveBeenCalledWith({
            stockSplits: removeAtIndex(value.stockSplits, valueIndex),
            transactions: value.transactions,
          });
        });
      });
    });

    describe('when editing transactions', () => {
      it('should handle adding a transaction', () => {
        expect.assertions(10);
        const { getByTestId, getByText } = setup();

        const inputGroup = getByTestId('transaction-create-input');
        expect(inputGroup).toBeInTheDocument();

        const inputs = inputGroup.querySelectorAll('input');

        const inputDate = inputs[0];
        const inputUnits = inputs[1];
        const inputPrice = inputs[2];
        const inputFees = inputs[3];
        const inputTaxes = inputs[4];

        [inputDate, inputUnits, inputPrice, inputFees, inputTaxes].forEach((input) =>
          expect(input).toBeInTheDocument(),
        );

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

        act(() => {
          fireEvent.change(inputTaxes, { target: { value: '4.37' } });
        });
        act(() => {
          fireEvent.blur(inputTaxes);
        });

        act(() => {
          fireEvent.change(inputFees, { target: { value: '5.22' } });
        });
        act(() => {
          fireEvent.blur(inputFees);
        });

        expect(props.onChange).not.toHaveBeenCalled();

        act(() => {
          fireEvent.click(buttonAdd);
          jest.runAllTimers();
        });

        expect(props.onChange).toHaveBeenCalledWith({
          stockSplits: value.stockSplits,
          transactions: [
            ...value.transactions,
            expect.objectContaining<TransactionNative>({
              date: new Date('2019-02-11'),
              units: 562.23,
              price: 1.72,
              taxes: 437,
              fees: 522,
            }),
          ],
        });
      });

      it.each`
        property
        ${'units'}
        ${'price'}
      `('should not add a transaction with zero $property', ({ property }) => {
        expect.assertions(1);

        const { getByTestId, getByText } = setup();
        const buttonAdd = getByText('+') as HTMLButtonElement;

        const inputGroup = getByTestId('transaction-create-input');

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
          jest.runAllTimers();
        });

        expect(props.onChange).not.toHaveBeenCalled();
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
          expect.assertions(4);
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
            jest.runAllTimers();
          });

          expect(props.onChange).toHaveBeenCalledTimes(1);
          expect(props.onChange).toHaveBeenCalledWith({
            stockSplits: value.stockSplits,
            transactions: expect.arrayContaining(
              partialModification(value.transactions, valueIndex, {
                date: new Date('2017-04-03'),
              }),
            ),
          });
        });

        it.each`
          field      | inputValue  | displayValue  | oldDisplayValue
          ${'units'} | ${34.2219}  | ${'34.2219'}  | ${String(transactions[valueIndex].units)}
          ${'price'} | ${126.7692} | ${'126.7692'} | ${String(transactions[valueIndex].price)}
          ${'fees'}  | ${6754}     | ${'67.54'}    | ${(transactions[valueIndex].fees / 100).toFixed(2)}
          ${'taxes'} | ${1806}     | ${'18.06'}    | ${(transactions[valueIndex].taxes / 100).toFixed(2)}
        `('should handle $field input', ({ field, inputValue, displayValue, oldDisplayValue }) => {
          expect.assertions(4);
          const { getByDisplayValue } = setup();

          const inputPrice = getByDisplayValue(oldDisplayValue);
          expect(inputPrice).toBeInTheDocument();

          act(() => {
            fireEvent.change(inputPrice, { target: { value: displayValue } });
          });

          expect(props.onChange).not.toHaveBeenCalled();

          act(() => {
            fireEvent.blur(inputPrice);
            jest.runAllTimers();
          });

          expect(props.onChange).toHaveBeenCalledTimes(1);
          expect(props.onChange).toHaveBeenCalledWith({
            stockSplits: value.stockSplits,
            transactions: expect.arrayContaining(
              partialModification(value.transactions, valueIndex, {
                [field]: inputValue,
              }),
            ),
          });
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

          act(() => {
            jest.runAllTimers();
          });

          expect(props.onChange).toHaveBeenCalledTimes(3);
          expect(props.onChange).toHaveBeenCalledWith({
            stockSplits: value.stockSplits,
            transactions: expect.arrayContaining(
              partialModification(value.transactions, valueIndex, {
                date: new Date('2017-04-03'),
                units: 34.2219,
                price: 126.7692,
              }),
            ),
          });
        });

        it('should handle removing the transaction', () => {
          expect.assertions(2);
          const { getAllByText } = setup();

          const removeButtons = getAllByText('−');
          expect(removeButtons).toHaveLength(2);

          act(() => {
            fireEvent.click(removeButtons[displayIndex]);
          });

          expect(props.onChange).toHaveBeenCalledWith({
            stockSplits: value.stockSplits,
            transactions: removeAtIndex(value.transactions, valueIndex),
          });
        });
      });
    });
  });
});
