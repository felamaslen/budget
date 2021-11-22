import { useCallback, useState } from 'react';

import * as Styled from './styles';
import { FundGainInfo } from '~client/components/fund-gain-info';
import { GainsForRow } from '~client/selectors';
import { abbreviateFundName, extractLongName } from '~shared/abbreviation';

export const FundNameMobile: React.FC<{ value: string }> = ({ value }) => {
  const [showLongName, setShowLongName] = useState<boolean>(false);
  const onShow = useCallback(() => {
    setShowLongName(true);
  }, []);
  const onHide = useCallback(() => {
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
  latestPrice?: number | null;
  isSold?: boolean;
};

export const FundDetailMobile: React.FC<Props> = ({ gain, latestPrice, isSold = false }) => {
  if (!gain) {
    return null;
  }

  return (
    <Styled.FundValueMobile>
      {!isSold && <FundGainInfo isSold={false} rowGains={gain} latestPrice={latestPrice} />}
    </Styled.FundValueMobile>
  );
};
