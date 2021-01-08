import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { breakpoint } from '~client/styled/mixins';
import { Flex } from '~client/styled/shared/layout';
import { breakpoints, colors } from '~client/styled/variables';

export const Container = styled(Flex)`
  flex: 0 0 auto;
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
  user-select: none;

  ${breakpoint(breakpoints.mobile)} {
    background-color: ${colors.translucent.dark.light};
    border: 1px solid ${colors.medium.light};
    flex: 0 0 ${({ height }): number => height}px;
    height: ${({ height }): number => height}px;
    margin: ${rem(10)} 0 ${rem(10)} ${rem(10)};
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

export const FundModeSwitch = styled(Flex)`
  height: ${rem(20)};
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 3;
`;

type FundSidebarProps = { isOpen: boolean };
const fundSidebarStyles = ({ isOpen }: FundSidebarProps): SerializedStyles => css`
  background: linear-gradient(to bottom, ${colors.translucent.dark.dark}, transparent);
  height: 100%;
  left: 0;
  list-style: none;
  margin: 0;
  outline: none;
  overflow-y: auto;
  padding: ${rem(4)} 0;
  position: absolute;
  top: ${rem(20)};
  transition: 0.3s width ease-in-out;
  user-select: none;
  width: ${rem(isOpen ? 60 : 12)};
  z-index: 3;

  &:hover {
    width: ${rem(60)};
  }

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

  select {
    max-width: 95%;
  }
`;
export const FundSidebar = styled.ul<FundSidebarProps>(fundSidebarStyles);

export const SidebarCheckbox = styled.span<{
  checked: boolean;
}>(
  ({ checked }) => css`
    display: inline-block;
    position: absolute;
    top: 5px;
    left: 1px;
    width: 0;
    height: 0;
    border: 5px solid black;

    ${!checked &&
    css`
      border-width: 2px;
      width: 10px;
      height: 10px;
    `}
  `,
);

export const SidebarFund = styled.a`
  padding-left: 12px;
`;