import React, { useMemo } from 'react';
import { formatCurrency } from '~client/modules/format';
import { getTotalCost, isSold } from '~client/modules/data';

import * as Styled from './styles';
import { LegacyTransaction } from '~client/types/funds';

const formatOptions = {
  abbreviate: true,
  precision: 1,
};

type Props = {
  item: {
    transactions: LegacyTransaction[];
    gain: {
      value: number;
    } | null;
  };
};

const ListRowFundsMobile: React.FC<Props> = ({ item: { transactions, gain } }) => {
  const actualValueFormatted = useMemo<string | null>(() => {
    if (!gain) {
      return null;
    }
    if (isSold(transactions)) {
      return '\u2013';
    }

    return formatCurrency(gain.value, formatOptions);
  }, [transactions, gain]);

  if (!gain) {
    return null;
  }

  return (
    <Styled.FundValue>
      <Styled.Cost>{formatCurrency(getTotalCost(transactions), formatOptions)}</Styled.Cost>
      <Styled.Value>{actualValueFormatted}</Styled.Value>
    </Styled.FundValue>
  );
};

export default ListRowFundsMobile;
