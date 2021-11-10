import { render, RenderResult, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import format from 'date-fns/format';
import { removeAtIndex } from 'replace-array';

import { FormFieldStockSplits, FormFieldTransactions } from './modal';
import type { PropsFormFieldModalStockSplits, PropsFormFieldModalTransactions } from './types';

import { partialModification } from '~client/modules/data';
import type { StockSplitNative, TransactionNative } from '~client/types';

const transactions: TransactionNative[] = [
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

      userEvent.type(inputDate, '{selectall}2020-01-02');
      userEvent.tab();

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

      userEvent.type(inputRatio, '{selectall}4');
      userEvent.tab();

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

      userEvent.click(removeButtons[displayIndex]);

      expect(props.onChange).toHaveBeenCalledWith(removeAtIndex(value, valueIndex));
    });
  });

  it('should handle adding a stock split', () => {
    expect.assertions(5);
    const { getByTestId, getByText } = setupModal();

    const inputGroup = getByTestId('stock-split-create-input');
    expect(inputGroup).toBeInTheDocument();

    const inputs = inputGroup.querySelectorAll('input');
    const inputDate = inputs[0];
    const inputRatio = inputs[1];

    [inputDate, inputRatio].forEach((input) => expect(input).toBeInTheDocument());

    const buttonAdd = getByText('+');

    userEvent.type(inputDate, '2020-02-11');
    userEvent.type(inputRatio, '{selectall}15');

    expect(props.onChange).not.toHaveBeenCalled();

    userEvent.click(buttonAdd);

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

    userEvent.type(inputDate, '{selectall}2019-02-11');
    userEvent.type(inputRatio, `{selectall}${String(ratio)}`);

    userEvent.click(buttonAdd);

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
    field        | label
    ${'date'}    | ${'Date:'}
    ${'units'}   | ${'Units:'}
    ${'price'}   | ${'Price:'}
    ${'fees'}    | ${'Fees:'}
    ${'taxes'}   | ${'Taxes:'}
    ${'drip'}    | ${'DRIP:'}
    ${'pension'} | ${'Pension:'}
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

      userEvent.type(inputDate, '{selectall}2017-04-03');
      userEvent.tab();

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

      userEvent.type(inputUnits, '{selectall}34.2219');
      userEvent.tab();

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

      userEvent.type(inputPrice, '{selectall}126.7692');
      userEvent.tab();

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
      const { getAllByLabelText } = setupModal();

      const inputDRIP = getAllByLabelText('DRIP:')[displayIndex + 1];
      expect(inputDRIP).toBeInTheDocument();

      userEvent.click(inputDRIP);

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

    it('should handle toggling pension', async () => {
      expect.hasAssertions();
      const { getAllByLabelText } = setupModal();

      const inputPension = getAllByLabelText('Pension:')[displayIndex + 1];
      expect(inputPension).toBeInTheDocument();

      userEvent.click(inputPension);

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
            pension: true,
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

      userEvent.type(inputPrice, '{selectall}126.7692');
      userEvent.type(inputUnits, '{selectall}34.2219');
      userEvent.type(inputDate, '{selectall}2017-04-03');

      userEvent.tab();

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

      userEvent.click(removeButtons[displayIndex]);

      expect(props.onChange).toHaveBeenCalledWith(removeAtIndex(value, valueIndex));
    });
  });

  it('should handle adding a transaction', () => {
    expect.assertions(10);
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
    const inputPension = inputs[6];

    [inputDate, inputUnits, inputPrice, inputFees, inputTaxes, inputDRIP, inputPension].forEach(
      (input) => expect(input).toBeInTheDocument(),
    );

    const buttonAdd = getByText('+');

    userEvent.type(inputDate, '{selectall}2019-02-11');
    userEvent.type(inputUnits, '{selectall}562.23');
    userEvent.type(inputPrice, '{selectall}1095.91');
    userEvent.type(inputFees, '{selectall}43.56');
    userEvent.type(inputTaxes, '{selectall}112.02');

    userEvent.click(inputDRIP);
    userEvent.click(inputPension);

    expect(props.onChange).not.toHaveBeenCalled();

    userEvent.click(buttonAdd);

    expect(props.onChange).toHaveBeenCalledWith([
      ...value,
      expect.objectContaining<TransactionNative>({
        date: new Date('2019-02-11'),
        units: 562.23,
        price: 1095.91,
        fees: 4356,
        taxes: 11202,
        drip: true,
        pension: true,
      }),
    ]);
  });

  it.each`
    property   | unitsInput              | costInput
    ${'units'} | ${'{rightArrow}'}       | ${'{selectall}562.23'}
    ${'cost'}  | ${'{selectall}1095.91'} | ${'{rightArrow}'}
  `('should not add a transaction with zero $property', ({ unitsInput, costInput }) => {
    expect.assertions(1);

    const { getByTestId, getByText } = setupModal();
    const buttonAdd = getByText('+') as HTMLButtonElement;

    const inputGroup = getByTestId('transaction-create-input');

    const inputs = inputGroup.querySelectorAll('input');

    const inputDate = inputs[0];
    const inputUnits = inputs[1];
    const inputCost = inputs[2];

    userEvent.type(inputDate, '{selectall}2019-02-11');
    userEvent.type(inputUnits, unitsInput);
    userEvent.type(inputCost, costInput);

    userEvent.click(buttonAdd);

    expect(props.onChange).not.toHaveBeenCalled();
  });
});
