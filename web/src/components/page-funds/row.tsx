import React from 'react';
import { useSelector } from 'react-redux';

import { Pie } from '../pie';
import * as Styled from './styles';
import { FundProps } from './types';
import { FundGainInfo } from '~client/components/FundGainInfo';
import { GraphFundItem } from '~client/components/graph-fund-item';
import { useToday } from '~client/hooks/time';
import { getViewSoldFunds, getFundsCachedValue } from '~client/selectors';
import { colors } from '~client/styled/variables';
import { Fund } from '~client/types';

export const FundRow: React.FC<{ isMobile: boolean; item: Fund } & Partial<FundProps>> = ({
  isMobile,
  children,
  name = 'missing-name',
  isSold = false,
  prices,
  gain,
}) => {
  const today = useToday();
  const viewSoldFunds = useSelector(getViewSoldFunds);
  const latestValue = useSelector(getFundsCachedValue(today));
  if (!viewSoldFunds && isSold) {
    return null;
  }

  if (isMobile) {
    const valueSlice = (2 * Math.PI * (gain?.value ?? 0)) / latestValue.value;

    return (
      <Styled.FundRowMobile isSold={isSold}>
        <Styled.MobilePie>
          <Pie size={16} slice={valueSlice} color={colors.shadow.mediumDark} />
        </Styled.MobilePie>
        {children}
      </Styled.FundRowMobile>
    );
  }

  return (
    <Styled.FundRow isSold={isSold}>
      {children}
      {!!prices && <GraphFundItem name={name} sold={isSold} values={prices} />}
      <FundGainInfo isSold={isSold} rowGains={gain} />
    </Styled.FundRow>
  );
};
