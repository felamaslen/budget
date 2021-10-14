import { render, RenderResult, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { removeAtIndex } from 'replace-array';

import { FormFieldIncomeDeductions } from './modal';
import type { PropsFormFieldModalIncomeDeductions } from './types';

import { partialModification } from '~client/modules/data';
import type { IncomeDeductionInput } from '~client/types/gql';
import type { GQL } from '~shared/types';

const incomeDeductions: GQL<IncomeDeductionInput>[] = [
  { name: 'Income tax', value: -195000 },
  { name: 'NI', value: -41300 },
];

describe(FormFieldIncomeDeductions.name, () => {
  const value = incomeDeductions;
  const props: PropsFormFieldModalIncomeDeductions = {
    value,
    onChange: jest.fn(),
  };

  const setupModal = (): RenderResult => render(<FormFieldIncomeDeductions {...props} />);

  it.each`
    field      | label
    ${'name'}  | ${'Name:'}
    ${'value'} | ${'Value:'}
  `('should render labels for the $field fields', ({ label }) => {
    expect.assertions(1);
    const { queryAllByText } = setupModal();
    expect(queryAllByText(label)).toHaveLength(3); // one for the add form
  });

  describe.each`
    description | valueIndex | displayIndex
    ${'first'}  | ${0}       | ${0}
    ${'second'} | ${1}       | ${1}
  `('for the $description income deduction', ({ valueIndex, displayIndex }) => {
    it('should be rendered in the right order', () => {
      expect.assertions(2);
      const { getAllByRole } = setupModal();
      const listItems = getAllByRole('listitem');
      const displayedItem = listItems[displayIndex + 1]; // the first one is the add form
      const { getByDisplayValue } = within(displayedItem);
      expect(getByDisplayValue(incomeDeductions[valueIndex].name)).toBeInTheDocument();
      expect(
        getByDisplayValue(String((incomeDeductions[valueIndex].value / 100).toFixed(2))),
      ).toBeInTheDocument();
    });

    it('should handle name input', async () => {
      expect.hasAssertions();
      const { getByDisplayValue } = setupModal();

      const inputName = getByDisplayValue(incomeDeductions[valueIndex].name);
      expect(inputName).toBeInTheDocument();

      userEvent.type(inputName, '{selectall}Student loan');
      userEvent.tab();

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
            name: 'Student loan',
          }),
        ),
      );
    });

    it('should handle value input', async () => {
      expect.hasAssertions();
      const { getByDisplayValue } = setupModal();

      const inputValue = getByDisplayValue(
        String((incomeDeductions[valueIndex].value / 100).toFixed(2)),
      );
      expect(inputValue).toBeInTheDocument();

      userEvent.type(inputValue, '{selectall}-489.23');
      userEvent.tab();

      await waitFor(() => {
        expect(props.onChange).toHaveBeenCalledTimes(1);
      });

      expect(props.onChange).toHaveBeenCalledWith(
        expect.arrayContaining(
          partialModification(value, valueIndex, {
            value: -48923,
          }),
        ),
      );
    });

    it('should handle removing the income deduction', () => {
      expect.assertions(2);
      const { getAllByText } = setupModal();

      const removeButtons = getAllByText('−');
      expect(removeButtons).toHaveLength(2);

      userEvent.click(removeButtons[displayIndex]);

      expect(props.onChange).toHaveBeenCalledWith(removeAtIndex(value, valueIndex));
    });
  });

  it('should handle adding an income deduction', () => {
    expect.assertions(5);
    const { getByTestId, getByText } = setupModal();

    const inputGroup = getByTestId('income-deduction-create-input');
    expect(inputGroup).toBeInTheDocument();

    const inputs = inputGroup.querySelectorAll('input');
    const inputName = inputs[0];
    const inputValue = inputs[1];

    [inputName, inputValue].forEach((input) => expect(input).toBeInTheDocument());

    const buttonAdd = getByText('+');

    userEvent.type(inputName, '{selectall}SAYE');
    userEvent.type(inputValue, '{selectall}-500');
    userEvent.tab();

    expect(props.onChange).not.toHaveBeenCalled();

    userEvent.click(buttonAdd);

    expect(props.onChange).toHaveBeenCalledWith([
      ...value,
      expect.objectContaining({
        name: 'SAYE',
        value: -50000,
      }),
    ]);
  });

  it.each`
    case       | item       | nameInput                  | valueInput
    ${'zero'}  | ${'value'} | ${'{selectall}Some thing'} | ${'{selectall}0'}
    ${'empty'} | ${'name'}  | ${'{rightArrow}'}          | ${'{selectall}123'}
  `('should not add an income deduction with $case $item', ({ nameInput, valueInput }) => {
    expect.assertions(1);

    const { getByTestId, getByText } = setupModal();
    const buttonAdd = getByText('+') as HTMLButtonElement;

    const inputGroup = getByTestId('income-deduction-create-input');

    const inputs = inputGroup.querySelectorAll('input');

    const inputName = inputs[0];
    const inputValue = inputs[1];

    userEvent.type(inputName, nameInput);
    userEvent.type(inputValue, valueInput);

    userEvent.click(buttonAdd);

    expect(props.onChange).not.toHaveBeenCalled();
  });
});
