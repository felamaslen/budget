import { render } from '@testing-library/react';
import { renderHook, RenderHookResult } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import React, { SetStateAction } from 'react';
import numericHash from 'string-hash';

import { PlanningContextDispatch } from '../context';
import type { State } from '../types';

import { parseRawValue, useTransactionForm, useTransactionFormElements } from './hooks';

describe(parseRawValue.name, () => {
  it('should handle rounding errors in explicit values', () => {
    expect.assertions(1);
    expect(parseRawValue('-635.68')).toStrictEqual<ReturnType<typeof parseRawValue>>({
      value: -63568,
      formula: undefined,
    });
  });
});

describe(useTransactionFormElements.name, () => {
  const onChange = jest.fn();

  beforeEach(jest.clearAllMocks);

  const TestComponent: React.FC = () => {
    const { name, value } = useTransactionFormElements(onChange);
    return (
      <>
        {name}
        {value}
      </>
    );
  };

  it('should call onChange when pressing enter', async () => {
    expect.assertions(3);
    const { getAllByRole } = render(<TestComponent />);

    const [nameInput, valueInput] = getAllByRole('textbox') as HTMLInputElement[];

    userEvent.type(nameInput, 'My name');
    userEvent.type(valueInput, '{selectall}{backspace}-452.39');

    expect(onChange).not.toHaveBeenCalled();

    userEvent.type(nameInput, '{enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      name: 'My name',
      value: -45239,
      formula: undefined,
    });
  });

  describe.each`
    case               | name                        | value
    ${'name is empty'} | ${'{selectall}{backspace}'} | ${'1.23'}
    ${'value is zero'} | ${'my name'}                | ${'0.00'}
  `('when $case', (inputs: { name: string; value: string }) => {
    it('should not call onChange', () => {
      expect.assertions(1);

      const { getAllByRole } = render(<TestComponent />);

      const [nameInput, valueInput] = getAllByRole('textbox') as HTMLInputElement[];

      userEvent.type(nameInput, inputs.name);
      userEvent.type(valueInput, `{selectall}{backspace}${inputs.value}`);
      userEvent.type(nameInput, '{enter}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});

describe(useTransactionForm.name, () => {
  let syncState: State = {
    year: 2020,
    parameters: {
      rates: [],
      thresholds: [],
    },
    accounts: [
      {
        id: numericHash('my-account'),
        netWorthSubcategoryId: numericHash('my-account-subcategory'),
        account: 'My account',
        creditCards: [
          {
            id: numericHash('my-credit-card-id'),
            netWorthSubcategoryId: numericHash('my-credit-card-subcategory'),
            payments: [],
            predictedPayment: null,
          },
        ],
        values: [],
        income: [],
        computedValues: [],
        computedStartValue: null,
        includeBills: null,
      },
    ],
    taxReliefFromPreviousYear: null,
    error: null,
  };

  const sync = jest.fn((action: SetStateAction<State>) => {
    syncState = typeof action === 'function' ? action(syncState) : action;
  });

  const Wrapper: React.FC = ({ children }) => (
    <PlanningContextDispatch.Provider value={sync}>{children}</PlanningContextDispatch.Provider>
  );

  const setup = (): RenderHookResult<
    Record<string, unknown>,
    ReturnType<typeof useTransactionForm>
  > =>
    renderHook(() => useTransactionForm(2020, 7), {
      wrapper: Wrapper,
    });

  it('should not add the year to credit card payments', () => {
    expect.assertions(1);
    const { result } = setup();
    result.current.onChangeCreditCard(numericHash('my-account-subcategory'), {
      netWorthSubcategoryId: numericHash('my-credit-card-subcategory'),
      name: 'My credit card',
      value: -12592,
    });

    expect(syncState.accounts[0].creditCards[0].payments[0]).not.toHaveProperty('year');
  });
});
