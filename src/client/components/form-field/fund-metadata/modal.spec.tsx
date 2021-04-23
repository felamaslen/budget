import { render, fireEvent, act, RenderResult, waitFor, within } from '@testing-library/react';
import format from 'date-fns/format';
import React from 'react';
import { removeAtIndex } from 'replace-array';

import { FormFieldStockSplits, FormFieldTransactions } from './modal';
import type { PropsFormFieldModalStockSplits, PropsFormFieldModalTransactions } from './types';

import { partialModification } from '~client/modules/data';
import type { StockSplitNative, TransactionNative } from '~client/types';

const transactions: TransactionNative[] = [
  { date: new Date('2017-11-10'), units: 10.5, price: 9.76, fees: 10, taxes: 3, drip: false },
  { date: new Date('2018-09-05'), units: -3, price: 1.3, fees: 4, taxes: 2, drip: false },
];
const stockSplits: StockSplitNative[] = [
  { date: new Date('2020-04-20'), ratio: 10 },
  { date: new Date('2021-02-05'), ratio: 3 },
];

describe(FormFieldStockSplits.name, () => {
  const value = stockSplits;
  const props: PropsFormFieldModalStockSplits = {
    value,
    onChange: jest.fn(),
  };

  const setupModal = (): RenderResult => render(<FormFieldStockSplits {...props} />);

  it.each`
    field      | label
    ${'date'}  | ${'Date:'}
    ${'ratio'} | ${'Ratio:'}
  `('should render labels for the $field fields', ({ label }) => {
    expect.assertions(1);
    const { queryAllByText } = setupModal();
    expect(queryAllByText(label)).toHaveLength(3); // one for the add form
  });

  describe.each`
    description | valueIndex | displayIndex
    ${'newest'} | ${1}       | ${0}
    ${'oldest'} | ${0}       | ${1}
  `('for the $description stock split', ({ valueIndex, displayIndex }) => {
    it('should be rendered in the right order', () => {
      expect.assertions(2);
      const { getAllByRole } = setupModal();
      const listItems = getAllByRole('listitem');
      const displayedItem = listItems[displayIndex + 1]; // the first one is the add form
      const { getByDisplayValue } = within(displayedItem);
      expect(
        getByDisplayValue(format(new Date(stockSplits[valueIndex].date), 'yyyy-MM-dd')),
      ).toBeInTheDocument();
      expect(getByDisplayValue(String(stockSplits[valueIndex].ratio))).toBeInTheDocument();
    });

    it('should handle date input', async () => {
      expect.hasAssertions();
      const { getByDisplayValue } = setupModal();

      const inputDate = getByDisplayValue(
        format(new Date(stockSplits[valueIndex].date), 'yyyy-MM-dd'),
      );
      expect(inputDate).toBeInTheDocument();

      act(() => {
        fireEvent.change(inputDate, { target: { value: '2020-01-02' } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
            date: new Date('2020-01-02'),
          }),
        ),
      );
    });

    it('should handle ratio input', async () => {
      expect.hasAssertions();
      const { getByDisplayValue } = setupModal();

      const inputRatio = getByDisplayValue(String(stockSplits[valueIndex].ratio));
      expect(inputRatio).toBeInTheDocument();

      act(() => {
        fireEvent.change(inputRatio, { target: { value: '4' } });
      });
      act(() => {
        fireEvent.blur(inputRatio);
      });

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
            ratio: 4,
          }),
        ),
      );
    });

    it('should handle removing the stock split', () => {
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

  it('should handle adding a stock split', () => {
    expect.assertions(6);
    const { getByTestId, getByText } = setupModal();

    const inputGroup = getByTestId('stock-split-create-input');
    expect(inputGroup).toBeInTheDocument();

    const inputs = inputGroup.querySelectorAll('input');
    const inputDate = inputs[0];
    const inputRatio = inputs[1];

    [inputDate, inputRatio].forEach((input) => expect(input).toBeInTheDocument());

    const buttonAdd = getByText('+');

    act(() => {
      fireEvent.change(inputDate, { target: { value: '2020-02-11' } });
    });
    act(() => {
      fireEvent.blur(inputDate);
    });
    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.change(inputRatio, { target: { value: '15' } });
    });
    act(() => {
      fireEvent.blur(inputRatio);
    });
    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.click(buttonAdd);
    });

    expect(props.onChange).toHaveBeenCalledWith([
      ...value,
      expect.objectContaining({
        date: new Date('2020-02-11'),
        ratio: 15,
      }),
    ]);
  });

  it.each`
    case          | ratio
    ${'zero'}     | ${0}
    ${'negative'} | ${-2}
  `('should not add a stock split with $case ratio', ({ ratio }) => {
    expect.assertions(1);

    const { getByTestId, getByText } = setupModal();
    const buttonAdd = getByText('+') as HTMLButtonElement;

    const inputGroup = getByTestId('stock-split-create-input');

    const inputs = inputGroup.querySelectorAll('input');

    const inputDate = inputs[0];
    const inputRatio = inputs[1];

    act(() => {
      fireEvent.change(inputDate, { target: { value: '2019-02-11' } });
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
    });

    expect(props.onChange).not.toHaveBeenCalled();
  });
});

describe(FormFieldTransactions.name, () => {
  const value = transactions;
  const props: PropsFormFieldModalTransactions = {
    value,
    onChange: jest.fn(),
  };

  const setupModal = (): RenderResult => render(<FormFieldTransactions {...props} />);

  it.each`
    field      | label
    ${'date'}  | ${'Date:'}
    ${'units'} | ${'Units:'}
    ${'price'} | ${'Price:'}
    ${'fees'}  | ${'Fees:'}
    ${'taxes'} | ${'Taxes:'}
    ${'drip'}  | ${'DRIP:'}
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

    it('should handle date input', async () => {
      expect.hasAssertions();
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

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
            date: new Date('2017-04-03'),
          }),
        ),
      );
    });

    it('should handle units input', async () => {
      expect.hasAssertions();
      const { getByDisplayValue } = setupModal();

      const inputUnits = getByDisplayValue(String(transactions[valueIndex].units));
      expect(inputUnits).toBeInTheDocument();

      act(() => {
        fireEvent.change(inputUnits, { target: { value: '34.2219' } });
      });
      act(() => {
        fireEvent.blur(inputUnits);
      });

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
            units: 34.2219,
          }),
        ),
      );
    });

    it('should handle price input', async () => {
      expect.hasAssertions();
      const { getByDisplayValue } = setupModal();

      const inputPrice = getByDisplayValue(String(transactions[valueIndex].price));
      expect(inputPrice).toBeInTheDocument();

      act(() => {
        fireEvent.change(inputPrice, { target: { value: '126.7692' } });
      });
      act(() => {
        fireEvent.blur(inputPrice);
      });

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
            price: 126.7692,
          }),
        ),
      );
    });

    it('should handle toggling DRIP', async () => {
      expect.hasAssertions();
      const { getAllByRole } = setupModal();

      const inputDRIP = getAllByRole('checkbox')[displayIndex + 1];
      expect(inputDRIP).toBeInTheDocument();

      act(() => {
        fireEvent.click(inputDRIP);
      });

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
            drip: true,
          }),
        ),
      );
    });

    it('should handle input of multiple fields', async () => {
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

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(3);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
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
    expect.assertions(14);
    const { getByTestId, getByText } = setupModal();

    const inputGroup = getByTestId('transaction-create-input');
    expect(inputGroup).toBeInTheDocument();

    const inputs = inputGroup.querySelectorAll('input');

    const inputDate = inputs[0];
    const inputUnits = inputs[1];
    const inputPrice = inputs[2];
    const inputFees = inputs[3];
    const inputTaxes = inputs[4];
    const inputDRIP = inputs[5];

    [inputDate, inputUnits, inputPrice, inputFees, inputTaxes, inputDRIP].forEach((input) =>
      expect(input).toBeInTheDocument(),
    );

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
      fireEvent.change(inputFees, { target: { value: '43.56' } });
    });
    act(() => {
      fireEvent.blur(inputFees);
    });

    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.change(inputTaxes, { target: { value: '112.02' } });
    });
    act(() => {
      fireEvent.blur(inputTaxes);
    });

    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.click(inputDRIP);
    });

    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.click(buttonAdd);
    });

    expect(props.onChange).toHaveBeenCalledWith([
      ...value,
      expect.objectContaining<TransactionNative>({
        date: new Date('2019-02-11'),
        units: 562.23,
        price: 1095.91,
        fees: 4356,
        taxes: 11202,
        drip: true,
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

    const inputGroup = getByTestId('transaction-create-input');

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
