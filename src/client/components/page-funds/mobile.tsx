import { useCallback, useState } from 'react';

import * as Styled from './styles';
import { FundGainInfo } from '~client/components/fund-gain-info';
import type { FundMetadata } from '~client/selectors';
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

export type Props = {
  metadata?: FundMetadata;
  isSold?: boolean;
};

export const FundDetailMobile: React.FC<Props> = ({ metadata, isSold = false }) => {
  if (!metadata) {
    return null;
  }

  return (
    <Styled.FundValueMobile>
      {!isSold && <FundGainInfo isSold={false} metadata={metadata} />}
    </Styled.FundValueMobile>
  );
};
