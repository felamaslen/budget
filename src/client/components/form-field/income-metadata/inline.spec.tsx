import { act, render, RenderResult, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { removeAtIndex } from 'replace-array';

import { FormFieldIncomeMetadata, PropsComposite } from './inline';
import type { IncomeDeductionNative } from './types';

import { partialModification } from '~client/modules/data';

describe(FormFieldIncomeMetadata.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  const incomeDeductions: IncomeDeductionNative[] = [
    { name: 'Income tax', value: -195000 },
    { name: 'NI', value: -41300 },
  ];

  const value = incomeDeductions;

  const props: PropsComposite = {
    value,
    onChange: jest.fn(),
  };

  describe('when not focused', () => {
    it('should render only a preview of the number of deductions', () => {
      expect.assertions(1);
      const { container } = render(<FormFieldIncomeMetadata {...props} />);
      expect(container).toHaveTextContent('2');
    });
  });

  const renderAsActive = (): RenderResult => render(<FormFieldIncomeMetadata {...props} active />);
  const renderAndFocus = (): RenderResult => {
    const renderResult = render(<FormFieldIncomeMetadata {...props} />);
    const button = renderResult.getByText('2') as HTMLButtonElement;
    userEvent.click(button);
    return renderResult;
  };

  describe.each`
    case         | setup
    ${'active'}  | ${renderAsActive}
    ${'focused'} | ${renderAndFocus}
  `('when $case', ({ setup }: { setup: () => RenderResult }) => {
    it('should render a preview of the number of deductions', () => {
      expect.assertions(1);
      const { getByText } = setup();
      expect(getByText('2')).toBeInTheDocument();
    });

    it('should render a modal dialog header', () => {
      expect.assertions(2);
      const { getByText } = setup();
      expect(getByText('Name')).toBeInTheDocument();
      expect(getByText('Value')).toBeInTheDocument();
    });

    it('should handle adding a deduction', () => {
      expect.assertions(5);
      const { getByTestId, getByText } = setup();

      const inputGroup = getByTestId('income-deduction-create-input');
      expect(inputGroup).toBeInTheDocument();

      const inputs = inputGroup.querySelectorAll('input');

      const inputName = inputs[0];
      const inputValue = inputs[1];

      [inputName, inputValue].forEach((input) => expect(input).toBeInTheDocument());

      const buttonAdd = getByText('+');

      userEvent.type(inputName, '{selectall}{backspace}SAYE');
      userEvent.type(inputValue, '{selectall}{backspace}-500');

      expect(props.onChange).not.toHaveBeenCalled();

      userEvent.click(buttonAdd);

      act(() => {
        jest.runAllTimers();
      });

      expect(props.onChange).toHaveBeenCalledWith([
        ...value,
        expect.objectContaining<IncomeDeductionNative>({
          name: 'SAYE',
          value: -50000,
        }),
      ]);
    });

    it.each`
      case       | item       | nameInput         | valueInput
      ${'zero'}  | ${'value'} | ${'Some tax'}     | ${'0'}
      ${'empty'} | ${'name'}  | ${'{rightArrow}'} | ${'-123'}
    `('should not add a deduction with $case $item', ({ nameInput, valueInput }) => {
      expect.assertions(1);

      const { getByTestId, getByText } = setup();
      const buttonAdd = getByText('+') as HTMLButtonElement;

      const inputGroup = getByTestId('income-deduction-create-input');

      const inputs = inputGroup.querySelectorAll('input');

      const inputName = inputs[0];
      const inputValue = inputs[1];

      userEvent.type(inputName, nameInput);
      userEvent.type(inputValue, valueInput);

      userEvent.click(buttonAdd);

      act(() => {
        jest.runAllTimers();
      });

      expect(props.onChange).not.toHaveBeenCalled();
    });

    describe.each`
      description | valueIndex | displayIndex
      ${'first'}  | ${0}       | ${0}
      ${'second'} | ${1}       | ${1}
    `('for the $description deduction', ({ valueIndex, displayIndex }) => {
      it('should be rendered in the right order', () => {
        expect.assertions(2);
        const { getAllByRole } = setup();
        const listItems = getAllByRole('listitem');
        const displayedItem = listItems[displayIndex + 1]; // the first one is the add form
        const { getByDisplayValue } = within(displayedItem);
        expect(getByDisplayValue(incomeDeductions[valueIndex].name)).toBeInTheDocument();
        expect(
          getByDisplayValue((incomeDeductions[valueIndex].value / 100).toFixed(2)),
        ).toBeInTheDocument();
      });

      it('should handle name input', () => {
        expect.assertions(4);
        const { getByDisplayValue } = setup();

        const inputName = getByDisplayValue(incomeDeductions[valueIndex].name);
        expect(inputName).toBeInTheDocument();

        userEvent.type(inputName, '{selectall}{backspace}Different tax');

        expect(props.onChange).not.toHaveBeenCalled();

        userEvent.tab();

        act(() => {
          jest.runAllTimers();
        });
        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onChange).toHaveBeenCalledWith(
          partialModification(value, valueIndex, {
            name: 'Different tax',
          }),
        );
      });

      it('should handle value input', () => {
        expect.assertions(4);

        const field = 'value';
        const inputValue = -56239;
        const displayValue = '-562.39';
        const oldDisplayValue = (incomeDeductions[valueIndex].value / 100).toFixed(2);

        const { getByDisplayValue } = setup();

        const input = getByDisplayValue(oldDisplayValue);
        expect(input).toBeInTheDocument();

        userEvent.type(input, `{selectall}{backspace}${displayValue}`);

        expect(props.onChange).not.toHaveBeenCalled();

        userEvent.tab();

        act(() => {
          jest.runAllTimers();
        });
        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onChange).toHaveBeenCalledWith(
          partialModification(value, valueIndex, {
            [field]: inputValue,
          }),
        );
      });

      it('should handle removing the deduction', () => {
        expect.assertions(2);
        const { getAllByText } = setup();

        const removeButtons = getAllByText('−');
        expect(removeButtons).toHaveLength(2);

        userEvent.click(removeButtons[displayIndex]);

        expect(props.onChange).toHaveBeenCalledWith(removeAtIndex(value, valueIndex));
      });
    });
  });
});
