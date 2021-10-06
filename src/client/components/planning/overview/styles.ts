import styled from '@emotion/styled';
import { rem } from 'polished';
import type { CSSProperties } from 'react';

import type { PlanningOverviewRow } from '../hooks/overview';
import * as Styled from '../styles';
import { breakpoint } from '~client/styled/mixins';
import { FlexColumn } from '~client/styled/shared';
import { breakpoints } from '~client/styled/variables';

export const PlanningOverview = styled(FlexColumn)`
  font-size: ${rem(10)};

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 2;
    grid-row: 1;
  }
`;

export const OverviewRow = styled(Styled.Row)<Omit<PlanningOverviewRow, 'name' | 'value'>>`
  font-weight: ${({ isBold = false }): CSSProperties['fontWeight'] => (isBold ? 'bold' : 'normal')};
`;

export const OverviewName = styled(Styled.Cell)`
  flex: 1;
`;

export const OverviewValue = styled(Styled.Cell)`
  flex: 1;
`;
