import React from 'react';

import * as Styled from './styles';
import { FundGainInfo } from '~client/components/fund-gain-info';
import { abbreviateFundName, extractLongName } from '~client/modules/finance';
import { GainsForRow } from '~client/selectors';

export const FundNameMobile: React.FC<{ value: string }> = ({ value }) => {
  const [showLongName, setShowLongName] = React.useState<boolean>(false);
  const onShow = React.useCallback(() => {
    setShowLongName(true);
  }, []);
  const onHide = React.useCallback(() => {
    setShowLongName(false);
  }, []);

  return (
    <Styled.FundNameMobile onTouchStart={onShow} onTouchEnd={onHide}>
      {showLongName ? extractLongName(value) : abbreviateFundName(value)}
    </Styled.FundNameMobile>
  );
};

type Props = {
  gain?: GainsForRow;
  isSold?: boolean;
};

export const FundDetailMobile: React.FC<Props> = ({ gain, isSold = false }) => {
  if (!gain) {
    return null;
  }

  return (
    <Styled.FundValueMobile>
      {!isSold && <FundGainInfo isSold={false} rowGains={gain} />}
    </Styled.FundValueMobile>
  );
};
