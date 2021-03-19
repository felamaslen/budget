import React from 'react';

import * as Styled from '../graph-cashflow/styles';
import { ToggleContainer } from '../graph-cashflow/toggle';

type Props = {
  isCumulative: boolean;
  setCumulative: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AfterCanvas: React.FC<Props> = ({ isCumulative, setCumulative }) => (
  <Styled.Toggles>
    <ToggleContainer value={isCumulative} setValue={setCumulative}>
      Cumulative
    </ToggleContainer>
  </Styled.Toggles>
);
