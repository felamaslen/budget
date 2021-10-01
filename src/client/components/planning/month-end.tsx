import React from 'react';

import * as Styled from './styles';
import type { AccountTransaction } from './types';

import { formatCurrency, toLocal } from '~client/modules/format';
import { PlanningAccount } from '~client/types/gql';

export type AccountValue = AccountTransaction & Pick<PlanningAccount, 'upperLimit' | 'lowerLimit'>;

export type Props = {
  date: Date;
  accountValues: AccountValue[];
};

export const MonthEnd: React.FC<Props> = ({ date, accountValues }) => (
  <Styled.MonthEnd>
    <Styled.MonthDate>{toLocal(date)}</Styled.MonthDate>
    {accountValues.map(({ name, computedValue, isVerified, upperLimit, lowerLimit }) => (
      <Styled.AccountGroup key={name} isVerified={isVerified}>
        <Styled.AccountGroupItem />
        <Styled.AccountGroupValue
          tooLow={(computedValue ?? 0) < (lowerLimit ?? 0)}
          tooHigh={(computedValue ?? 0) > (upperLimit ?? Infinity)}
          justRight={
            typeof computedValue !== 'undefined' &&
            !(typeof lowerLimit === 'undefined' && typeof upperLimit === 'undefined') &&
            computedValue >= (lowerLimit ?? 0) &&
            computedValue <= (upperLimit ?? Infinity)
          }
        >
          {typeof computedValue === 'undefined'
            ? ''
            : formatCurrency(computedValue, { brackets: true })}
        </Styled.AccountGroupValue>
      </Styled.AccountGroup>
    ))}
  </Styled.MonthEnd>
);
