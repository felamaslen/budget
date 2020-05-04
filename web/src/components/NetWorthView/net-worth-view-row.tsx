import React from 'react';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import format from 'date-fns/format';

import { formatCurrency } from '~client/modules/format';
import * as Styled from './styles';

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
  date: Date;
  assets: number;
  liabilities: number;
  expenses: number;
  fti: number;
};

const NetWorthViewRow: React.FC<Props> = ({ date, assets, liabilities, fti, expenses }) => (
  <Styled.Row>
    <Styled.Column item="date-short">{getShortDate(date)}</Styled.Column>
    <Styled.Column item="date-long">{format(date, 'dd/MM/yyyy')}</Styled.Column>
    <Styled.Column item="assets">{formatCurrency(assets)}</Styled.Column>
    <Styled.Column item="liabilities">
      {formatCurrency(liabilities, {
        brackets: true,
      })}
    </Styled.Column>
    <Styled.Column item="net-worth-value">
      {formatCurrency(assets - liabilities, {
        brackets: true,
      })}
    </Styled.Column>
    <Styled.Column item="expenses">{formatCurrency(expenses)}</Styled.Column>
    <Styled.Column item="fti">{fti.toFixed(2)}</Styled.Column>
  </Styled.Row>
);

export default NetWorthViewRow;
