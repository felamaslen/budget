import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { breakpoint, rem } from '~client/styled/mixins';
import { FlexColumn } from '~client/styled/shared';
import { breakpoints, colors } from '~client/styled/variables';

export const Container = styled(FlexColumn)`
  display: flex;
  flex: 1 0 auto;
  flex-flow: row;
  overflow-x: auto;

  ${breakpoint(breakpoints.desktop)} {
    flex: 1;
    flex-flow: column;
  }
`;

export const GraphFunds = styled.div<{ width: number; height: number }>`
  background-color: ${colors.white};
  position: relative;

  ${breakpoint(breakpoints.mobile)} {
    background-color: ${colors.translucent.dark.light};
    border: 1px solid ${colors.medium.light};
    flex: 0 0 ${({ height }): number => height}px;
    height: ${({ height }): number => height}px;
    margin: ${rem(10)} 0 0 ${rem(10)};
    overflow: hidden;
  }

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${({ width }): number => width}px;
  }

  ${breakpoint(breakpoints.desktop)} {
    flex: 0 0 ${({ height }): number => height}px;
    max-width: ${({ width }): number => width}px;
  }
`;

export const FundSidebar = styled.ul<{ isActive: boolean }>`
  margin: 0;
  padding: 0;
  position: absolute;
  left: 0;
  top: 0;
  list-style: none;
  outline: none;
  width: ${({ isActive }): string => rem(isActive ? 200 : 50)};
  height: 100%;
  background: linear-gradient(to bottom, ${colors.translucent.dark.dark}, transparent);
  z-index: 3;
  transition: 0.3s width ease-in-out;
  user-select: none;
  li {
    line-height: 20px;
    height: 20px;
    width: 100%;
    cursor: default;
    font-size: 0.8em;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ${breakpoint(breakpoints.mobile)} {
    overflow-y: auto;
  }
`;

export const Mode = styled.span`
  position: absolute;
  top: 0.2em;
  left: 0.2em;
  z-index: 2;

  ${breakpoint(breakpoints.mobile)} {
    left: initial;
    right: 0.2em;
  }
`;

export const SidebarCheckbox = styled.span<{
  checked: boolean;
}>`
  display: inline-block;
  position: absolute;
  top: 5px;
  left: 1px;
  width: 0;
  height: 0;
  border: 5px solid black;

  ${({ checked }): false | FlattenSimpleInterpolation =>
    !checked &&
    css`
      border-width: 2px;
      width: 10px;
      height: 10px;
    `}
`;

export const SidebarFund = styled.span`
  padding-left: 12px;
`;
