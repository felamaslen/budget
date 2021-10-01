import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { replaceAtIndex } from 'replace-array';

import * as Styled from '../styles';
import type { Account, AccountIncome } from '../types';

import * as StyledForm from './styles';

import {
  FormFieldCost,
  FormFieldDate,
  FormFieldNumber,
  FormFieldText,
  FormFieldTickbox,
} from '~client/components/form-field';
import { useCTA } from '~client/hooks';
import { toISO } from '~client/modules/format';
import { H6 } from '~client/styled/shared/typography';

type FormFieldIncomeProps = {
  value: AccountIncome;
  onChange: Dispatch<SetStateAction<AccountIncome>>;
};

const FormFieldIncome: React.FC<FormFieldIncomeProps> = ({ value, onChange }) => (
  <ul>
    <li>
      <Styled.AccountEditFormLabel>Start date: </Styled.AccountEditFormLabel>
      <FormFieldDate
        value={new Date(value.startDate)}
        onChange={(date): void => onChange((last) => ({ ...last, startDate: toISO(date) }))}
      />
    </li>
    <li>
      <Styled.AccountEditFormLabel>End date: </Styled.AccountEditFormLabel>
      <FormFieldDate
        value={new Date(value.endDate)}
        onChange={(date): void => onChange((last) => ({ ...last, endDate: toISO(date) }))}
      />
    </li>
    <li>
      <Styled.AccountEditFormLabel>Gross salary: </Styled.AccountEditFormLabel>
      <FormFieldCost
        value={value.salary}
        onChange={(salary): void => onChange((last) => ({ ...last, salary }))}
      />
    </li>
    <li>
      <Styled.AccountEditFormLabel>Tax code: </Styled.AccountEditFormLabel>
      <FormFieldText
        value={value.taxCode}
        onChange={(taxCode): void => onChange((last) => ({ ...last, taxCode }))}
      />
    </li>
    <li>
      <Styled.AccountEditFormLabel>Pension (%): </Styled.AccountEditFormLabel>
      <FormFieldNumber
        value={value.pensionContrib * 100}
        onChange={(nextValue): void =>
          onChange((last) => ({ ...last, pensionContrib: nextValue / 100 }))
        }
        min={0}
        max={100}
      />
    </li>
    <li>
      <Styled.AccountEditFormLabel>Student loan: </Styled.AccountEditFormLabel>
      <FormFieldTickbox
        value={value.studentLoan}
        onChange={(studentLoan): void => onChange((last) => ({ ...last, studentLoan }))}
      />
    </li>
  </ul>
);

type IncomeEditFormProps = {
  tempAccount: Account;
  setTempAccount: Dispatch<SetStateAction<Account>>;
  updateAndSave: Dispatch<SetStateAction<Account>>;
};

const initialIncome: AccountIncome = {
  startDate: toISO(new Date()),
  endDate: toISO(new Date()),
  salary: 0,
  taxCode: '',
  pensionContrib: 0,
  studentLoan: false,
};

export const IncomeEditForm: React.FC<IncomeEditFormProps> = ({
  tempAccount,
  setTempAccount,
  updateAndSave,
}) => {
  const incomeIds = useMemo(
    () =>
      tempAccount.income
        .filter((row): row is AccountIncome => !!row.id)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .map((row) => row.id),
    [tempAccount],
  );
  const [newIncome, setNewIncome] = useState<AccountIncome>(initialIncome);
  const [editingIncomeIndex, setEditingIncomeIndex] = useState<number>(-1);
  const editingIncomeId = incomeIds[editingIncomeIndex];

  const onIncomeLeft = useCallback(
    () =>
      setEditingIncomeIndex((last) => (last < 0 ? incomeIds.length - 1 : Math.max(0, last - 1))),
    [incomeIds.length],
  );
  const onIncomeRight = useCallback(
    () =>
      setEditingIncomeIndex((last) => (last < 0 || last >= incomeIds.length - 1 ? -1 : last + 1)),
    [incomeIds.length],
  );
  const onIncomeLeftCTA = useCTA(onIncomeLeft);
  const onIncomeRightCTA = useCTA(onIncomeRight);

  const onAddNewIncome = useCallback(() => {
    if (!newIncome.salary) {
      return;
    }
    updateAndSave((last) => ({
      ...last,
      income: [...last.income, newIncome],
    }));
    setNewIncome(initialIncome);
  }, [newIncome, updateAndSave]);
  const onAddNewIncomeCTA = useCTA(onAddNewIncome);

  const onEditIncome = useCallback(
    (action: SetStateAction<AccountIncome>) => {
      setTempAccount((last) => ({
        ...last,
        income: replaceAtIndex(
          last.income,
          last.income.findIndex((row) => row.id === editingIncomeId),
          typeof action === 'function' ? (prev): AccountIncome => action(prev) : action,
        ),
      }));
    },
    [editingIncomeId, setTempAccount],
  );

  return (
    <StyledForm.IncomeEditForm>
      <H6>Income</H6>
      <div>
        <Styled.Button {...onIncomeLeftCTA}>&larr;</Styled.Button>
        {editingIncomeIndex < 0 ? 'Add' : 'Edit'} income:
        <Styled.Button {...onIncomeRightCTA}>&rarr;</Styled.Button>
        {editingIncomeId ? `#${editingIncomeId}` : 'new'}
      </div>
      <div>
        {editingIncomeIndex < 0 ? (
          <>
            <FormFieldIncome value={newIncome} onChange={setNewIncome} />
            <Styled.Button {...onAddNewIncomeCTA}>Add</Styled.Button>
          </>
        ) : (
          <FormFieldIncome
            value={
              tempAccount.income.find(
                (row) => row.id === incomeIds[editingIncomeIndex],
              ) as AccountIncome
            }
            onChange={onEditIncome}
          />
        )}
      </div>
    </StyledForm.IncomeEditForm>
  );
};
