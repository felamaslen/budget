import React, { useMemo } from 'react';

import * as Styled from './styles';
import { getTotalCost } from '~client/modules/data';
import { formatCurrency } from '~client/modules/format';
import { GainsForRow } from '~client/selectors';
import { Transaction } from '~client/types/funds';

const formatOptions = {
  abbreviate: true,
  precision: 1,
};

export const FundNameMobile: React.FC<{ value: string }> = ({ value }) => (
  <Styled.FundNameMobile>{value}</Styled.FundNameMobile>
);

type Props = {
  value: Transaction[];
  gain?: GainsForRow;
  isSold?: boolean;
};

export const FundDetailMobile: React.FC<Props> = ({ value: transactions, gain, isSold }) => {
  const actualValueFormatted = useMemo<string | null>(() => {
    if (!gain) {
      return null;
    }
    if (isSold) {
      return '\u2013';
    }

    return formatCurrency(gain?.value, formatOptions);
  }, [gain, isSold]);

  if (!gain) {
    return null;
  }

  return (
    <Styled.FundValueMobile>
      <Styled.CostMobile>
        {formatCurrency(getTotalCost(transactions), formatOptions)}
      </Styled.CostMobile>
      <Styled.ValueMobile>{actualValueFormatted}</Styled.ValueMobile>
    </Styled.FundValueMobile>
  );
};
