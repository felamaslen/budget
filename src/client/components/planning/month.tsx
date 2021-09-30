import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import formatDate from 'date-fns/format';
import React, { useMemo } from 'react';

import { useTransactionForm } from './form/hooks';
import { MonthAccount } from './month-account';
import { MonthEnd } from './month-end';
import * as Styled from './styles';
import type { AccountTransaction, PlanningData } from './types';

export type Props = {
  dataForMonth: PlanningData;
  year: number;
  isStart: boolean;
};

export const Month: React.FC<Props> = ({ dataForMonth, isStart, year }) => {
  const { date, accounts } = dataForMonth;

  const startDate = useMemo<Date>(() => endOfMonth(addMonths(date, -1)), [date]);

  const accountValuesStart = useMemo<AccountTransaction[]>(
    () => accounts.map(({ startValue }) => startValue),
    [accounts],
  );

  const accountValuesEnd = useMemo<AccountTransaction[]>(
    () => accounts.map(({ endValue }) => endValue),
    [accounts],
  );

  const {
    onAddTransaction,
    onChangeTransaction,
    onRemoveTransaction,
    onChangeCreditCard,
  } = useTransactionForm(year, dataForMonth.month);

  return (
    <Styled.MonthGroup>
      <Styled.MonthHeader>
        <Styled.MonthHeaderText>{formatDate(date, "MMM ''yy")}</Styled.MonthHeaderText>
      </Styled.MonthHeader>
      <Styled.MonthGroupRows>
        {isStart && <MonthEnd date={startDate} accountValues={accountValuesStart} />}
        <Styled.AccountsInMonth>
          <Styled.MonthDate />
          {accounts.map((account) => (
            <MonthAccount
              key={account.accountGroup.netWorthSubcategoryId}
              account={account}
              onAddTransaction={onAddTransaction}
              onChangeTransaction={onChangeTransaction}
              onRemoveTransaction={onRemoveTransaction}
              onChangeCreditCard={onChangeCreditCard}
            />
          ))}
        </Styled.AccountsInMonth>
        <MonthEnd date={date} accountValues={accountValuesEnd} />
      </Styled.MonthGroupRows>
    </Styled.MonthGroup>
  );
};
