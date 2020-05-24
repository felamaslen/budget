import React from 'react';

import * as Styled from './styles';
import { FundProps } from './types';
import { FundGainInfo } from '~client/components/FundGainInfo';
import { GraphFundItem } from '~client/components/graph-fund-item';
import { Fund } from '~client/types';

export const FundRow: React.FC<{ isMobile: boolean; item: Fund } & Partial<FundProps>> = ({
  isMobile,
  children,
  name = 'missing-name',
  isSold = false,
  prices,
  gain,
}) => {
  if (isMobile) {
    return <Styled.FundRowMobile isSold={isSold}>{children}</Styled.FundRowMobile>;
  }

  return (
    <Styled.FundRow isSold={isSold}>
      {children}
      {!!prices && <GraphFundItem name={name} sold={isSold} values={prices} />}
      <FundGainInfo isSold={isSold} rowGains={gain} />
    </Styled.FundRow>
  );
};
