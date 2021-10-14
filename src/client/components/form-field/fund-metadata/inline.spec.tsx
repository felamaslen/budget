import { render, act, RenderResult, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  const transactions: Transaction[] = [
    {
      date: new Date('2017-11-10'),
      units: 10.5,
      price: 9.76,
      fees: 10,
      taxes: 3,
      drip: false,
      pension: false,
    },
    {
      date: new Date('2018-09-05'),
      units: -3,
      price: 1.3,
      fees: 4,
      taxes: 2,
      drip: false,
      pension: false,
    },
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
    userEvent.click(button);
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
        userEvent.click(renderResult.getByText('Stock splits'));
        return renderResult;
      };

      it('should handle adding a stock split', () => {
        expect.assertions(5);
        const { getByTestId, getByText } = setupStockSplits();

        const inputGroup = getByTestId('stock-split-create-input');
        expect(inputGroup).toBeInTheDocument();

        const inputs = inputGroup.querySelectorAll('input');

        const inputDate = inputs[0];
        const inputRatio = inputs[1];

        [inputDate, inputRatio].forEach((input) => expect(input).toBeInTheDocument());

        const buttonAdd = getByText('+');

        userEvent.type(inputDate, '{selectall}{backspace}12/4/20');
        userEvent.type(inputRatio, '6');

        expect(props.onChange).not.toHaveBeenCalled();

        userEvent.click(buttonAdd);
        act(() => {
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

        userEvent.type(inputDate, '{selectall}{backspace}2020-04-20');
        userEvent.type(inputRatio, `{selectall}{backspace}${ratio}`);

        userEvent.click(buttonAdd);

        act(() => {
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

          userEvent.type(inputDate, '{selectall}{backspace}1/9/20');
          expect(props.onChange).not.toHaveBeenCalled();

          userEvent.tab();

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

          userEvent.type(inputRatio, `{selectall}{backspace}${displayValue}`);

          expect(props.onChange).not.toHaveBeenCalled();

          userEvent.tab();

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

          userEvent.click(removeButtons[displayIndex]);

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
        const inputDRIP = inputs[1];
        const inputPension = inputs[2];
        const inputUnits = inputs[3];
        const inputPrice = inputs[4];
        const inputFees = inputs[5];
        const inputTaxes = inputs[6];

        [
          inputDate,
          inputDRIP,
          inputPension,
          inputUnits,
          inputPrice,
          inputFees,
          inputTaxes,
        ].forEach((input) => expect(input).toBeInTheDocument());

        const buttonAdd = getByText('+');

        userEvent.type(inputDate, '{selectall}{backspace}11/2/19');

        userEvent.click(inputDRIP);
        userEvent.click(inputPension);

        userEvent.type(inputUnits, '{selectall}{backspace}562.23');
        userEvent.type(inputPrice, '{selectall}{backspace}1.72');
        userEvent.type(inputTaxes, '{selectall}{backspace}4.37');
        userEvent.type(inputFees, '{selectall}{backspace}5.22');

        expect(props.onChange).not.toHaveBeenCalled();

        userEvent.click(buttonAdd);

        act(() => {
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
              drip: true,
              pension: true,
            }),
          ],
        });
      });

      it.each`
        property   | unitsInput                        | priceInput
        ${'price'} | ${'{selectall}{backspace}562.23'} | ${'{rightArrow}'}
        ${'units'} | ${'rightArrow'}                   | ${'{selectall}{backspace}1095.91'}
      `('should not add a transaction with zero $property', ({ unitsInput, priceInput }) => {
        expect.assertions(1);

        const { getByTestId, getByText } = setup();
        const buttonAdd = getByText('+') as HTMLButtonElement;

        const inputGroup = getByTestId('transaction-create-input');

        const inputs = inputGroup.querySelectorAll('input');

        const inputDate = inputs[0];
        const inputUnits = inputs[1];
        const inputPrice = inputs[2];

        userEvent.type(inputDate, '2019-02-11');

        userEvent.type(inputUnits, unitsInput);
        userEvent.type(inputPrice, priceInput);

        userEvent.click(buttonAdd);

        act(() => {
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

          userEvent.type(inputDate, '{selectall}{backspace}3/4/17');
          expect(props.onChange).not.toHaveBeenCalled();

          userEvent.tab();

          act(() => {
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

        it('should handle drip input', () => {
          expect.assertions(3);
          const { getAllByRole } = setup();

          const inputDrip = getAllByRole('checkbox')[(displayIndex + 1) * 2];
          expect(inputDrip).toBeInTheDocument();

          userEvent.click(inputDrip);

          act(() => {
            jest.runAllTimers();
          });

          expect(props.onChange).toHaveBeenCalledTimes(1);
          expect(props.onChange).toHaveBeenCalledWith({
            stockSplits: value.stockSplits,
            transactions: expect.arrayContaining(
              partialModification(value.transactions, valueIndex, {
                drip: true,
              }),
            ),
          });
        });

        it('should handle pension input', () => {
          expect.assertions(3);
          const { getAllByRole } = setup();

          const inputPension = getAllByRole('checkbox')[(displayIndex + 1) * 2 + 1];
          expect(inputPension).toBeInTheDocument();

          userEvent.click(inputPension);

          act(() => {
            jest.runAllTimers();
          });

          expect(props.onChange).toHaveBeenCalledTimes(1);
          expect(props.onChange).toHaveBeenCalledWith({
            stockSplits: value.stockSplits,
            transactions: expect.arrayContaining(
              partialModification(value.transactions, valueIndex, {
                pension: true,
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

          userEvent.type(inputPrice, `{selectall}{backspace}${displayValue}`);
          expect(props.onChange).not.toHaveBeenCalled();

          userEvent.tab();

          act(() => {
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

          userEvent.type(inputPrice, '{selectall}{backspace}126.7692');
          userEvent.type(inputUnits, '{selectall}{backspace}34.2219');
          userEvent.type(inputDate, '{selectall}{backspace}3/4/17');

          userEvent.tab();

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

          userEvent.click(removeButtons[displayIndex]);

          expect(props.onChange).toHaveBeenCalledWith({
            stockSplits: value.stockSplits,
            transactions: removeAtIndex(value.transactions, valueIndex),
          });
        });
      });
    });
  });
});
