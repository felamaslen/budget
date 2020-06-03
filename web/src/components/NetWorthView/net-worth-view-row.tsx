import format from 'date-fns/format';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import React from 'react';

import * as Styled from './styles';
import { formatCurrency } from '~client/modules/format';

function getShortDate(date: Date): string | React.ReactElement {
  if ((getMonth(date) + 1) % 3 === 0) {
    return (
      <Styled.DateQuarter>
        {getYear(date) - 2000}
        {'Q'}
        {Math.floor((getMonth(date) + 1) / 3)}
      </Styled.DateQuarter>
    );
  }

  return format(date, 'MMM');
}

type Props = {
  isMobile: boolean;
  date: Date;
  assets: number;
  liabilities: number;
  expenses: number;
  fti: number;
};

const formatCurrencyOptions = { brackets: true };
const formatCurrencyOptionsMobile = { ...formatCurrencyOptions, abbreviate: true, precision: 1 };

export const NetWorthViewRow: React.FC<Props> = ({
  isMobile,
  date,
  assets,
  liabilities,
  fti,
  expenses,
}) => {
  const formatOptions = isMobile ? formatCurrencyOptionsMobile : formatCurrencyOptions;

  return (
    <Styled.Row>
      <Styled.Column item="date-short">{getShortDate(date)}</Styled.Column>
      <Styled.Column item="date-long">{format(date, 'dd/MM/yyyy')}</Styled.Column>
      <Styled.Column item="assets">{formatCurrency(assets, formatOptions)}</Styled.Column>
      <Styled.Column item="liabilities">{formatCurrency(liabilities, formatOptions)}</Styled.Column>
      <Styled.Column item="net-worth-value">
        {formatCurrency(assets - liabilities, formatOptions)}
      </Styled.Column>
      <Styled.Column item="expenses">{formatCurrency(expenses, formatOptions)}</Styled.Column>
      <Styled.Column item="fti">{fti.toFixed(2)}</Styled.Column>
    </Styled.Row>
  );
};
