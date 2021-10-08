import { evaluateInfix } from 'calculator-lib';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { replaceAtIndex } from 'replace-array';

import { usePlanningDispatch } from '../context';
import type { AccountCreditCardPayment, AccountTransaction, State } from '../types';

import { FormFieldTextInline } from '~client/components/form-field';
import { partialModification } from '~client/modules/data';
import type { PlanningValueInput } from '~client/types/gql';

export type NewValue = Pick<PlanningValueInput, 'name' | 'formula' | 'value'>;

export type OnAddTransaction = (netWorthSubcategoryId: number, newValue: NewValue) => void;
export type OnChangeTransaction = (
  netWorthSubcategoryId: number,
  oldName: string,
  newValue: NewValue,
) => void;
export type OnRemoveTransaction = (netWorthSubcategoryId: number, name: string) => void;

export type OnChangeCreditCard = (
  netWorthSubcategoryId: number,
  creditCard: AccountCreditCardPayment,
) => void;

function getTransferAccountId(state: State, newValue: NewValue): number | null {
  const match = newValue.name.match(/^Transfer to (.*)$/);
  if (!match) {
    return null;
  }
  const matchingAccount = state.accounts.find(
    (compare) => compare.account.toLowerCase() === match[1].toLowerCase(),
  );
  return matchingAccount?.id ?? null;
}

const emptyTransaction: Pick<AccountTransaction, 'value' | 'formula'> = {
  value: 0,
  formula: undefined,
};

function parseRawValue(
  rawValue: string | undefined,
): Pick<AccountTransaction, 'value' | 'formula'> | null {
  if (!rawValue) {
    return null;
  }
  const isFormula = rawValue.substring(0, 1) === '=';
  if (isFormula) {
    try {
      evaluateInfix(rawValue.substring(1));
    } catch (e) {
      return emptyTransaction;
    }
    return { value: undefined, formula: rawValue.substring(1) };
  }
  return { value: (Number(rawValue) || 0) * 100, formula: undefined };
}

export function useEscapeCancel(onCancel: () => void, isActive = true): void {
  useEffect(() => {
    if (isActive) {
      const onKeydown = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      window.addEventListener('keydown', onKeydown);
      return (): void => window.removeEventListener('keydown', onKeydown);
    }
    return undefined;
  }, [onCancel, isActive]);
}

export function useEditMode(isEditable = true): [boolean, () => void, () => void] {
  const [isEditing, setEditing] = useState<boolean>(false);
  const onCancelEdit = useCallback(() => {
    setEditing(false);
  }, []);
  useEscapeCancel(onCancelEdit, isEditing);

  const onEdit = useCallback(() => {
    if (isEditable) {
      setEditing(true);
    }
  }, [isEditable]);

  return [isEditing, onEdit, onCancelEdit];
}

export function useEnterKeyDown(
  onEnter: () => void,
): (e: React.KeyboardEvent<HTMLInputElement>) => void {
  return useCallback(
    (e): void => {
      if (e.key === 'Enter') {
        onEnter();
      }
    },
    [onEnter],
  );
}

export function useTransactionFormElements(
  onChange: (delta: Pick<AccountTransaction, 'name' | 'value' | 'formula'>) => void,
  transaction?: Pick<AccountTransaction, 'name' | 'value' | 'formula'>,
): {
  name: React.ReactElement;
  value: React.ReactElement;
  onUpdate: () => void;
} {
  const [rawName, setRawName] = useState<string | undefined>(transaction?.name ?? '');
  const [rawValue, setRawValue] = useState<string | undefined>(
    transaction?.formula ? `=${transaction.formula}` : ((transaction?.value ?? 0) / 100).toFixed(2),
  );
  const onUpdate = useCallback(() => {
    const parsedValue = parseRawValue(rawValue);
    if (!(rawName && (parsedValue?.value || parsedValue?.formula))) {
      return;
    }
    onChange({
      name: rawName,
      ...parsedValue,
    });
    setRawName(undefined);
    setRawValue(undefined);
  }, [rawName, rawValue, onChange]);

  const onKeyDown = useEnterKeyDown(onUpdate);

  const name = useMemo<React.ReactElement>(
    () => (
      <FormFieldTextInline
        value={rawName}
        onChange={setRawName}
        onType={setRawName}
        inputProps={{ onKeyDown }}
      />
    ),
    [onKeyDown, rawName],
  );

  const value = useMemo<React.ReactElement>(
    () => (
      <FormFieldTextInline
        value={rawValue}
        onChange={setRawValue}
        onType={setRawValue}
        inputProps={{ onKeyDown }}
      />
    ),
    [onKeyDown, rawValue],
  );

  return { name, value, onUpdate };
}

export function useTransactionForm(
  year: number,
  month: number,
): {
  onAddTransaction: OnAddTransaction;
  onChangeTransaction: OnChangeTransaction;
  onRemoveTransaction: OnRemoveTransaction;
  onChangeCreditCard: OnChangeCreditCard;
} {
  const sync = usePlanningDispatch();

  const onAddTransaction = useCallback<OnAddTransaction>(
    (netWorthSubcategoryId, newValue) => {
      sync((prevState) => ({
        ...prevState,
        accounts: replaceAtIndex(
          prevState.accounts,
          prevState.accounts.findIndex(
            (compare) => compare.netWorthSubcategoryId === netWorthSubcategoryId,
          ),
          (prev) => ({
            ...prev,
            values: [
              ...prev.values,
              {
                ...newValue,
                month,
                transferToAccountId: getTransferAccountId(prevState, newValue),
              },
            ],
          }),
        ),
      }));
    },
    [sync, month],
  );

  const onChangeTransaction = useCallback<OnChangeTransaction>(
    (netWorthSubcategory, oldName, newValue) => {
      sync((last) =>
        last.year === year
          ? {
              ...last,
              accounts: replaceAtIndex(
                last.accounts,
                last.accounts.findIndex(
                  (compare) => compare.netWorthSubcategoryId === netWorthSubcategory,
                ),
                (prev) => ({
                  ...prev,
                  values: partialModification(
                    prev.values,
                    prev.values.findIndex(
                      (compare) => compare.month === month && compare.name === oldName,
                    ),
                    newValue,
                  ),
                }),
              ),
            }
          : last,
      );
    },
    [sync, year, month],
  );

  const onRemoveTransaction = useCallback<OnRemoveTransaction>(
    (netWorthSubcategory, name) => {
      sync((last) =>
        last.year === year
          ? {
              ...last,
              accounts: replaceAtIndex(
                last.accounts,
                last.accounts.findIndex(
                  (compare) => compare.netWorthSubcategoryId === netWorthSubcategory,
                ),
                (prev) => ({
                  ...prev,
                  values: prev.values.filter(
                    (value) => !(value.month === month && value.name === name),
                  ),
                }),
              ),
            }
          : last,
      );
    },
    [sync, year, month],
  );

  const onChangeCreditCard = useCallback<OnChangeCreditCard>(
    (netWorthSubcategoryId, creditCard) => {
      sync((prevState) =>
        prevState.year === year
          ? {
              ...prevState,
              accounts: replaceAtIndex(
                prevState.accounts,
                prevState.accounts.findIndex(
                  (compare) => compare.netWorthSubcategoryId === netWorthSubcategoryId,
                ),
                (prevAccount) => ({
                  ...prevAccount,
                  creditCards: replaceAtIndex(
                    prevAccount.creditCards,
                    prevAccount.creditCards.findIndex(
                      (compare) =>
                        compare.netWorthSubcategoryId === creditCard.netWorthSubcategoryId,
                    ),
                    (prevCreditCard) => {
                      if (typeof creditCard.value === 'undefined') {
                        return {
                          ...prevCreditCard,
                          payments: prevCreditCard.payments.filter(
                            (compare) => compare.month !== month,
                          ),
                        };
                      }
                      if (prevCreditCard.payments.some((compare) => compare.month === month)) {
                        return {
                          ...prevCreditCard,
                          payments: partialModification(
                            prevCreditCard.payments,
                            prevCreditCard.payments.findIndex((compare) => compare.month === month),
                            { value: creditCard.value },
                          ),
                        };
                      }
                      return {
                        ...prevCreditCard,
                        payments: [
                          ...prevCreditCard.payments,
                          { year, month, value: creditCard.value },
                        ],
                      };
                    },
                  ),
                }),
              ),
            }
          : prevState,
      );
    },
    [sync, year, month],
  );

  return { onAddTransaction, onChangeTransaction, onRemoveTransaction, onChangeCreditCard };
}
