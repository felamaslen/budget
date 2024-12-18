import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { breakpoint, breakpoints, colors } from '~client/styled';
import { HamburgerButton } from '~client/styled/shared/hamburger';
import { Flex, FlexColumn } from '~client/styled/shared/layout';
import { SettingsDialog } from '~client/styled/shared/settings';

const sidebarWidthOpen = 60;
const sidebarWidthClosed = 12;

export const Container = styled(Flex)`
  flex: 0 0 auto;
  flex-flow: row;
  overflow-x: auto;

  ${breakpoint(breakpoints.desktop)} {
    flex: 1;
    flex-flow: column;
  }
`;

export const GraphContainer = styled.div<{ sidebarOpen?: boolean; withSidebar?: boolean }>`
  display: flex;
  flex-flow: column;
  height: 100%;
  overflow: hidden;

  ${breakpoint(breakpoints.mobile)} {
    padding: ${rem(20)} 0 0
      ${({ sidebarOpen = false, withSidebar = false }): number | string => {
        if (!withSidebar) {
          return 0;
        }
        return rem(sidebarOpen ? sidebarWidthOpen : sidebarWidthClosed);
      }};
  }
`;

export const GraphFunds = styled.div<{ width: number; height: number }>`
  background-color: ${colors.white};
  overflow-y: hidden;
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

export const FundModeSwitch = styled(SettingsDialog)`
  ${breakpoint(breakpoints.mobile)} {
    background: none;
    border-radius: 0;
    flex-flow: row;
    height: ${rem(20)};
    justify-content: flex-start;
    left: 0;
    padding: 0;
    position: absolute;
    top: 0;
    transform: none;
    width: 100%;
    z-index: 3;
  }
`;

export const FundPeriodSwitch = styled(FlexColumn)`
  align-items: center;
  flex: 1;

  ${breakpoint(breakpoints.mobile)} {
    background: ${colors.translucent.light};
    flex-flow: row;
  }
`;

export const FundPeriodButton = styled.button<{ active?: boolean }>(
  ({ active = false }) => css`
    appearance: none;
    border: none;
    background: none;
    color: ${active ? colors.blue : colors.dark.mediumLight};
    font-weight: ${active ? 'bold' : 'normal'};
    outline: none;

    ${breakpoint(breakpoints.mobile)} {
      cursor: pointer;

      &:not(:last-child) {
        border-right: 1px solid ${colors.light.mediumDark};
      }
    }
  `,
);

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
  width: ${rem(isOpen ? sidebarWidthOpen : sidebarWidthClosed)};
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

export const MobileSettingsButton = styled(HamburgerButton)`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;
`;
