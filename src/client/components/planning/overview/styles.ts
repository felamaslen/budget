import styled from '@emotion/styled';
import { rem } from 'polished';
import type { CSSProperties } from 'react';

import * as Styled from '../styles';
import { FlexColumn } from '~client/styled/shared';

export const PlanningOverview = styled(FlexColumn)`
  font-size: ${rem(10)};
`;

export const OverviewRow = styled(Styled.Row)<{
  isBold?: boolean;
}>`
  font-weight: ${({ isBold = false }): CSSProperties['fontWeight'] => (isBold ? 'bold' : 'normal')};
`;

export const OverviewName = styled(Styled.Cell)`
  flex: 1;
`;

export const OverviewValue = styled(Styled.Cell)`
  flex: 1;
`;
