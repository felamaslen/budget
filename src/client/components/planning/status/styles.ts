import styled from '@emotion/styled';
import { rem } from 'polished';
import { CSSProperties } from 'react';

import { Flex, FlexCenter } from '~client/styled/shared';
import { colors } from '~client/styled/variables';

export const StatusBar = styled(FlexCenter)`
  background: ${colors.light.light};
  border-top: 1px solid ${colors.light.mediumDark};
  grid-column: 1;
  grid-row: 2;
  font-size: ${rem(13)};
  padding: 0 ${rem(8)};
`;

export const YearButtons = styled(Flex)`
  flex: 1 1 auto;
  height: 100%;
  min-width: 0;
  overflow: auto;
`;

export const YearButton = styled.span<{ isActive: boolean }>`
  align-items: center;
  border-bottom: ${({ isActive }): CSSProperties['borderBottom'] =>
    isActive ? `4px solid ${colors.accent}` : 'none'};
  display: inline-flex;
  height: 100%;
  margin: 0;
  padding: 0 ${rem(5)};
  white-space: nowrap;

  &:not(:last-child) {
    border-right: 2px solid ${colors.light.dark};
  }

  a {
    color: ${colors.dark.light};
    text-decoration: none;
  }
`;

export const StatusError = styled.span`
  flex: 1 1 auto;
  color: ${colors.error};
  padding-left: ${rem(4)};
  text-align: right;
`;
