import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SetStateAction } from 'react';
import numericHash from 'string-hash';

import { FormFieldNetWorthValue, Props } from './net-worth-value';
import type { NetWorthValueInput } from '~client/types/gql';

describe('<FormFieldNetWorthValue />', () => {
  let setterResult: Record<string, unknown>;
  beforeEach(() => {
    setterResult = { base: 'kept' };
  });

  const onChange = jest
    .fn()
    .mockImplementation((setter: SetStateAction<Record<string, unknown>>): void => {
      setterResult = typeof setter === 'function' ? setter(setterResult) : setter;
    });

  const props: Props = {
    value: {
      subcategory: numericHash('some-subcategory-id'),
      simple: 156,
      fx: null,
      option: null,
      loan: null,
    },
    currencies: [
      {
        currency: 'USD',
        rate: 0.8,
      },
      {
        currency: 'EUR',
        rate: 0.95,
      },
    ],
    onChange,
  };

  it('should render a cost form field', () => {
    expect.assertions(1);
    const { getByDisplayValue } = render(<FormFieldNetWorthValue {...props} />);
    const input = getByDisplayValue('1.56') as HTMLInputElement;

    expect(input).toBeInTheDocument();
  });

  it('should call onChange on update', () => {
    expect.assertions(1);
    const { getByDisplayValue } = render(<FormFieldNetWorthValue {...props} />);
    const input = getByDisplayValue('1.56') as HTMLInputElement;

    userEvent.clear(input);
    userEvent.type(input, '106.32');
    userEvent.tab();

    expect(props.onChange).toHaveBeenCalledWith<[NetWorthValueInput]>({
      ...props.value,
      simple: 10632,
    });
  });

  describe.each`
    condition      | erroneousValue
    ${'an option'} | ${{ option: [{ units: 100, strikePrice: 30, marketPrice: 43 }] }}
    ${'a loan'}    | ${{ loan: { principal: 15000000, paymentsRemaining: 275, rate: 0.175, paid: 123 } }}
  `('if the value is $condition (erroneously)', ({ erroneousValue }) => {
    const setupErroneous = (): RenderResult =>
      render(
        <FormFieldNetWorthValue
          {...props}
          value={{ ...props.value, simple: null, ...erroneousValue }}
        />,
      );

    it('should render a blank simple input', () => {
      expect.assertions(2);
      const { getAllByRole } = setupErroneous();

      const inputs = getAllByRole('spinbutton') as HTMLInputElement[];
      expect(inputs).toHaveLength(1);
      expect(inputs[0].value).toBe('0.00');
    });

    it('should call onChange as usual', () => {
      expect.assertions(2);
      const { getByDisplayValue } = setupErroneous();
      const input = getByDisplayValue('0.00') as HTMLInputElement;

      userEvent.clear(input);
      userEvent.type(input, '123.45');
      userEvent.tab();

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith<[NetWorthValueInput]>({
        ...props.value,
        simple: 12345,
      });
    });
  });

  describe('switching to an FX value', () => {
    const setup = (): RenderResult => {
      const renderResult = render(<FormFieldNetWorthValue {...props} />);
      const checkbox = renderResult.getByRole('checkbox') as HTMLInputElement;
      userEvent.click(checkbox);

      return renderResult;
    };

    it('should render a select box', () => {
      expect.assertions(1);
      const { getByDisplayValue } = setup();
      const currencySelector = getByDisplayValue('USD') as HTMLSelectElement;
      expect(currencySelector).toBeInTheDocument();
    });

    describe('adding an FX sub-value', () => {
      it('should call onChange with an array of currencies', () => {
        expect.assertions(4);
        const { getByDisplayValue, getByText } = setup();

        const input = getByDisplayValue('0') as HTMLInputElement;
        expect(input).toBeInTheDocument();

        const addButton = getByText('+') as HTMLButtonElement;
        expect(addButton).toBeInTheDocument();

        userEvent.clear(input);
        userEvent.type(input, '156.23');
        userEvent.tab();

        expect(props.onChange).not.toHaveBeenCalled();

        userEvent.click(addButton);

        expect(props.onChange).toHaveBeenCalledWith<[NetWorthValueInput]>({
          ...props.value,
          simple: null,
          fx: [
            {
              value: 156.23,
              currency: 'USD',
            },
          ],
          option: null,
          loan: null,
        });
      });
    });

    describe('modifying an FX sub-value', () => {
      const setupModify = (): RenderResult =>
        render(
          <FormFieldNetWorthValue
            {...props}
            value={{
              ...props.value,
              simple: null,
              fx: [
                {
                  value: 156.23,
                  currency: 'USD',
                },
              ],
            }}
          />,
        );

      it('should call onChange with a modified value', () => {
        expect.assertions(2);
        const { getByDisplayValue } = setupModify();

        const modifyInput = getByDisplayValue('156.23') as HTMLInputElement;
        expect(modifyInput).toBeInTheDocument();

        userEvent.clear(modifyInput);
        userEvent.type(modifyInput, '887.3');
        userEvent.tab();

        expect(props.onChange).toHaveBeenCalledWith<[NetWorthValueInput]>({
          ...props.value,
          simple: null,
          fx: [
            {
              value: 887.3,
              currency: 'USD',
            },
          ],
          option: null,
          loan: null,
        });
      });

      it('should call onChange with a modified currency', () => {
        expect.assertions(2);
        const { getByDisplayValue } = setupModify();

        const modifyCurrency = getByDisplayValue('USD') as HTMLSelectElement;
        expect(modifyCurrency).toBeInTheDocument();

        userEvent.selectOptions(modifyCurrency, 'EUR');

        expect(props.onChange).toHaveBeenCalledWith<[NetWorthValueInput]>({
          ...props.value,
          simple: null,
          fx: [
            {
              value: 156.23,
              currency: 'EUR',
            },
          ],
          option: null,
          loan: null,
        });
      });
    });

    describe('removing an FX sub-value', () => {
      const setupRemove = (): RenderResult =>
        render(
          <FormFieldNetWorthValue
            {...props}
            value={{
              ...props.value,
              simple: null,
              fx: [
                {
                  value: 156.23,
                  currency: 'USD',
                },
                {
                  value: 918,
                  currency: 'EUR',
                },
              ],
            }}
          />,
        );

      it.each`
        index | newValue
        ${0}  | ${[{ value: 918, currency: 'EUR' }]}
        ${1}  | ${[{ value: 156.23, currency: 'USD' }]}
      `('should call onChange without the removed value', ({ index, newValue }) => {
        expect.assertions(2);
        const { getAllByText } = setupRemove();

        const deleteButtons = getAllByText('−') as HTMLButtonElement[];
        expect(deleteButtons).toHaveLength(2);

        userEvent.click(deleteButtons[index]);

        expect(props.onChange).toHaveBeenCalledWith<[NetWorthValueInput]>({
          ...props.value,
          simple: null,
          fx: newValue,
        });
      });

      it('should not call onChange if there is only one value left', () => {
        expect.assertions(2);
        const { getAllByText } = render(
          <FormFieldNetWorthValue
            {...props}
            value={{ ...props.value, simple: null, fx: [{ value: 100, currency: 'USD' }] }}
          />,
        );

        const deleteButtons = getAllByText('−') as HTMLButtonElement[];
        expect(deleteButtons).toHaveLength(1);

        userEvent.click(deleteButtons[0]);

        expect(props.onChange).not.toHaveBeenCalled();
      });
    });

    it('should allow switching back to the simple value', () => {
      expect.assertions(4);
      const { getByRole, getByDisplayValue, queryByDisplayValue } = setup();
      const checkbox = getByRole('checkbox') as HTMLInputElement;

      expect(queryByDisplayValue('1.56')).not.toBeInTheDocument();

      userEvent.click(checkbox);

      const simpleInput = getByDisplayValue('1.56') as HTMLInputElement;
      expect(simpleInput).toBeInTheDocument();
      expect(props.onChange).not.toHaveBeenCalled();

      userEvent.clear(simpleInput);
      userEvent.type(simpleInput, '67.23');
      userEvent.tab();

      expect(props.onChange).toHaveBeenCalledWith<[NetWorthValueInput]>({
        ...props.value,
        simple: 6723,
        fx: null,
        option: null,
        loan: null,
      });
    });
  });

  describe('switching to an option value', () => {
    const propsOption: Props = {
      ...props,
      isOption: true,
      value: {
        ...props.value,
        simple: null,
        option: { units: 105, vested: 10, strikePrice: 45.532, marketPrice: 97.113 },
      },
    };

    const setup = (): RenderResult => render(<FormFieldNetWorthValue {...propsOption} />);

    describe.each`
      field            | placeholder       | fieldValue  | updatedValue | delta
      ${'units'}       | ${'Units'}        | ${'105'}    | ${'187'}     | ${{ units: 187 }}
      ${'vested'}      | ${'Vested'}       | ${'10'}     | ${'13'}      | ${{ vested: 13 }}
      ${'strikePrice'} | ${'Strike price'} | ${'45.532'} | ${'49.931'}  | ${{ strikePrice: 49.931 }}
      ${'marketPrice'} | ${'Market price'} | ${'97.113'} | ${'99.007'}  | ${{ marketPrice: 99.007 }}
    `('$field field', ({ placeholder, fieldValue, updatedValue, delta }) => {
      it('should be rendered', () => {
        expect.assertions(1);
        const { getByDisplayValue } = setup();

        const input = getByDisplayValue(fieldValue);
        expect(input).toBeInTheDocument();
      });

      it('should have a placeholder', () => {
        expect.assertions(1);
        const { getByDisplayValue } = setup();

        const input = getByDisplayValue(fieldValue) as HTMLInputElement;
        expect(input.placeholder).toBe(placeholder);
      });

      it('should call onChange with an updated value', () => {
        expect.assertions(2);
        expect(setterResult).toStrictEqual({ base: 'kept' });

        const { getByDisplayValue } = setup();

        const input = getByDisplayValue(fieldValue);
        userEvent.clear(input);
        userEvent.type(input, updatedValue);
        userEvent.tab();

        expect(setterResult).toStrictEqual({
          base: 'kept',
          simple: null,
          fx: null,
          loan: null,
          option: {
            units: 105,
            strikePrice: 45.532,
            marketPrice: 97.113,
            vested: 10,
            ...delta,
          },
        });
      });
    });

    describe.each`
      condition   | erroneousValue
      ${'simple'} | ${{ simple: 103 }}
      ${'FX'}     | ${{ fx: [{ value: 103, currency: 'USD' }] }}
      ${'loan'}   | ${{ loan: { principal: 16500000, remainingPayments: 123, rate: 0.27 } }}
    `('if the value is $condition (erroneously)', ({ erroneousValue }) => {
      // this would only happen if the API was set up incorrectly
      const setupErroneous = (): RenderResult =>
        render(
          <FormFieldNetWorthValue
            {...propsOption}
            value={{ ...propsOption.value, option: null, ...erroneousValue }}
          />,
        );

      it('should render the usual option fields', () => {
        expect.assertions(5);
        const { getAllByRole } = setupErroneous();

        const inputs = getAllByRole('spinbutton') as HTMLInputElement[];

        expect(inputs).toHaveLength(4);
        inputs.forEach((input) => {
          expect(input.value).toBe('0');
        });
      });

      it.each`
        field            | index
        ${'units'}       | ${0}
        ${'strikePrice'} | ${1}
        ${'marketPrice'} | ${2}
      `('should not call onChange with data only from $field', ({ index }) => {
        expect.assertions(1);
        const { getAllByRole } = setupErroneous();

        const inputs = getAllByRole('spinbutton') as HTMLInputElement[];
        const fieldInput = inputs[index];

        userEvent.clear(fieldInput);
        userEvent.type(fieldInput, '100');
        userEvent.tab();

        expect(props.onChange).not.toHaveBeenCalled();
      });

      it('should call onChange with complete data', () => {
        expect.assertions(2);
        const { getAllByRole } = setupErroneous();
        const inputs = getAllByRole('spinbutton') as HTMLInputElement[];
        const [inputUnits, inputVested, inputStrikePrice, inputMarketPrice] = inputs;

        userEvent.clear(inputUnits);
        userEvent.type(inputUnits, '100');

        userEvent.clear(inputVested);
        userEvent.type(inputVested, '53');

        userEvent.clear(inputStrikePrice);
        userEvent.type(inputStrikePrice, '45');

        userEvent.clear(inputMarketPrice);
        userEvent.type(inputMarketPrice, '37.2');

        userEvent.tab();

        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(setterResult).toStrictEqual({
          base: 'kept',
          simple: null,
          fx: null,
          loan: null,
          option: {
            units: 100,
            vested: 53,
            strikePrice: 45,
            marketPrice: 37.2,
          },
        });
      });
    });
  });

  describe('switching to a loan value', () => {
    const propsLoan: Props = {
      ...props,
      isLoan: true,
      value: {
        ...props.value,
        simple: null,
        loan: { principal: 27500000, paymentsRemaining: 268, rate: 0.219, paid: 165 },
      },
    };

    const setup = (): RenderResult => render(<FormFieldNetWorthValue {...propsLoan} />);

    describe.each`
      field                  | placeholder             | fieldValue     | updatedValue | delta
      ${'principal'}         | ${'Principal'}          | ${'275000.00'} | ${'273280'}  | ${{ principal: 27328000 }}
      ${'paymentsRemaining'} | ${'Payments remaining'} | ${'268'}       | ${'267'}     | ${{ paymentsRemaining: 267 }}
      ${'rate'}              | ${'Interest rate'}      | ${'0.219'}     | ${'0.372'}   | ${{ rate: 0.372 }}
      ${'paid'}              | ${'Paid this month'}    | ${'1.65'}      | ${'118.3'}   | ${{ paid: 11830 }}
    `('$field field', ({ placeholder, fieldValue, updatedValue, delta }) => {
      it('should be rendered', () => {
        expect.assertions(1);
        const { getByDisplayValue } = setup();

        const input = getByDisplayValue(fieldValue);
        expect(input).toBeInTheDocument();
      });

      it('should have a placeholder', () => {
        expect.assertions(1);
        const { getByDisplayValue } = setup();

        const input = getByDisplayValue(fieldValue) as HTMLInputElement;
        expect(input.placeholder).toBe(placeholder);
      });

      it('should call onChange with an updated value', () => {
        expect.assertions(1);
        const { getByDisplayValue } = setup();

        const input = getByDisplayValue(fieldValue);
        userEvent.clear(input);
        userEvent.type(input, updatedValue);
        userEvent.tab();

        expect(setterResult).toStrictEqual({
          base: 'kept',
          simple: null,
          fx: null,
          option: null,
          loan: {
            principal: 27500000,
            paymentsRemaining: 268,
            rate: 0.219,
            paid: 165,
            ...delta,
          },
        });
      });
    });

    describe.each`
      condition   | erroneousValue
      ${'simple'} | ${{ simple: 103 }}
      ${'FX'}     | ${{ fx: [{ value: 103, currency: 'USD' }] }}
      ${'option'} | ${{ option: { units: 105, vested: 10, strikePrice: 45.532, marketPrice: 97.113 } }}
    `('if the value is $condition (erroneously)', ({ erroneousValue }) => {
      // this would only happen if the API was set up incorrectly
      const setupErroneous = (): RenderResult =>
        render(
          <FormFieldNetWorthValue
            {...propsLoan}
            value={{ ...props.value, simple: null, ...erroneousValue }}
          />,
        );

      it('should render the usual loan fields', () => {
        expect.assertions(5);
        const { getAllByRole } = setupErroneous();

        const inputs = getAllByRole('spinbutton') as HTMLInputElement[];

        expect(inputs).toHaveLength(4);

        const [inputPrincipal, inputPaymentsRemaining, inputRate, inputPaid] = inputs;

        expect(inputPrincipal.value).toBe('0.00');
        expect(inputPaymentsRemaining.value).toBe('0');
        expect(inputRate.value).toBe('0');
        expect(inputPaid.value).toBe('0.00');
      });

      it('should call onChange with complete data', () => {
        expect.assertions(2);
        const { getAllByRole } = setupErroneous();
        const inputs = getAllByRole('spinbutton') as HTMLInputElement[];
        const [inputPrincipal, inputPaymentsRemaining, inputRate] = inputs;

        userEvent.clear(inputPrincipal);
        userEvent.type(inputPrincipal, '167568.44');

        userEvent.clear(inputPaymentsRemaining);
        userEvent.type(inputPaymentsRemaining, '17');

        userEvent.clear(inputRate);
        userEvent.type(inputRate, '0.43');

        onChange.mockClear();

        userEvent.tab();

        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(setterResult).toStrictEqual({
          base: 'kept',
          simple: null,
          fx: null,
          option: null,
          loan: {
            principal: 16756844,
            paymentsRemaining: 17,
            rate: 0.43,
            paid: null,
          },
        });
      });
    });
  });
});
