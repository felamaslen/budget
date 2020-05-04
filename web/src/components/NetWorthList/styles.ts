import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { colors } from '~client/styled/variables';

export const NetWorthList = styled.div`
  display: flex;
  flex-flow: column;
  flex: 0 0 480px;
`;

export const ItemSummary = styled.div<{ add?: boolean }>`
  display: flex;
  flex-flow: column;
  padding: 0 6px;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${colors.light};
  cursor: pointer;
  border-radius: 2px;
  &:last-child {
    grid-row: 6;
    grid-column: 3;
    z-index: 3;
  }

  ${({ add = false }): false | FlattenSimpleInterpolation =>
    add &&
    css`
      margin: 0 auto 4px;
      width: 160px;
      grid-row: 2;
      flex: 0 0 32px;
      line-height: 32px;
    `};

  user-select: none;
  &:hover {
    background: ${colors['slightly-light']};
  }
  &:active {
    box-shadow: 0 1px 3px ${colors['shadow-l8']};
  }
`;

export const ButtonDelete = styled.span`
  position: absolute;
  right: 5px;
  top: 5px;
`;
