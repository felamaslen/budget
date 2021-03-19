import React from 'react';

import * as Styled from '../graph-cashflow/styles';
import { ToggleContainer } from '../graph-cashflow/toggle';

type Props = {
  isLoading?: boolean;
  showAll: boolean;
  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;
  showLiabilities: boolean;
  setShowLiabilities: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AfterCanvas: React.FC<Props> = ({
  isLoading,
  showAll,
  setShowAll,
  showLiabilities,
  setShowLiabilities,
}) => (
  <Styled.Toggles>
    <ToggleContainer value={showLiabilities} setValue={setShowLiabilities}>
      Split
    </ToggleContainer>
    <ToggleContainer value={showAll} setValue={setShowAll} isLoading={isLoading}>
      Show all
    </ToggleContainer>
  </Styled.Toggles>
);
