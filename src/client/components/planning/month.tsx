import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import React, { useMemo } from 'react';

import { useTransactionForm } from './form/hooks';
import { MonthAccount } from './month-account';
import { AccountValue, MonthEnd } from './month-end';
import * as Styled from './styles';
import type { PlanningData } from './types';

export type Props = {
  dataForMonth: PlanningData;
  year: number;
  isStart: boolean;
};

export const Month: React.FC<Props> = ({ dataForMonth, isStart, year }) => {
  const { date, accounts, numRows } = dataForMonth;

  const startDate = useMemo<Date>(() => endOfMonth(addMonths(date, -1)), [date]);

  const accountValuesStart = useMemo<AccountValue[]>(
    () =>
      accounts.map(({ accountGroup, startValue }) => ({
        ...startValue,
        upperLimit: accountGroup.upperLimit,
        lowerLimit: accountGroup.lowerLimit,
      })),
    [accounts],
  );

  const accountValuesEnd = useMemo<AccountValue[]>(
    () =>
      accounts.map(({ accountGroup, endValue }) => ({
        ...endValue,
        upperLimit: accountGroup.upperLimit,
        lowerLimit: accountGroup.lowerLimit,
      })),
    [accounts],
  );

  const { onAddTransaction, onChangeTransaction, onRemoveTransaction, onChangeCreditCard } =
    useTransactionForm(year, dataForMonth.month);

  return (
    <Styled.MonthGroup>
      {isStart && <MonthEnd date={startDate} accountValues={accountValuesStart} />}
      <Styled.AccountsInMonth>
        <Styled.MonthDateColumn>
          {Array(numRows)
            .fill(0)
            .map((_, index) => (
              <Styled.Cell key={`month-date-${index}`} />
            ))}
        </Styled.MonthDateColumn>
        {accounts.map((account) => (
          <MonthAccount
            key={account.accountGroup.netWorthSubcategoryId}
            account={account}
            numRows={numRows}
            onAddTransaction={onAddTransaction}
            onChangeTransaction={onChangeTransaction}
            onRemoveTransaction={onRemoveTransaction}
            onChangeCreditCard={onChangeCreditCard}
          />
        ))}
      </Styled.AccountsInMonth>
      <MonthEnd date={date} accountValues={accountValuesEnd} />
    </Styled.MonthGroup>
  );
};
