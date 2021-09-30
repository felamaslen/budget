import React from 'react';

import * as Styled from './styles';
import type { AccountTransaction } from './types';

import { formatCurrency, toLocal } from '~client/modules/format';

export type Props = {
  date: Date;
  accountValues: AccountTransaction[];
};

export const MonthEnd: React.FC<Props> = ({ date, accountValues }) => (
  <Styled.MonthEnd>
    <Styled.MonthDate>{toLocal(date)}</Styled.MonthDate>
    {accountValues.map(({ name, computedValue, isVerified }) => (
      <Styled.AccountGroup key={name} isVerified={isVerified}>
        <Styled.AccountGroupItem />
        <Styled.AccountGroupValue>
          {typeof computedValue === 'undefined'
            ? ''
            : formatCurrency(computedValue, { brackets: true })}
        </Styled.AccountGroupValue>
      </Styled.AccountGroup>
    ))}
  </Styled.MonthEnd>
);
