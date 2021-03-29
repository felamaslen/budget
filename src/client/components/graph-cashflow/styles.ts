import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { breakpoint } from '~client/styled/mixins';
import { FlexCenter } from '~client/styled/shared';
import { HamburgerButton } from '~client/styled/shared/hamburger';
import { SettingsDialog, SettingsGroup } from '~client/styled/shared/settings';
import { breakpoints, colors } from '~client/styled/variables';

export type SidebarProps = {
  open: boolean;
};

export const SidebarToggle = styled(HamburgerButton)<SidebarProps>(
  ({ open }) => css`
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;

    ${breakpoint(breakpoints.mobile)} {
      right: ${rem(open ? 128 : 0)};
      transition: 0.1s right ease;
    }
  `,
);

export const Sidebar = styled(SettingsDialog)<SidebarProps>(
  ({ open }) => css`
    display: ${open ? 'block' : 'none'};

    ${breakpoint(breakpoints.mobile)} {
      background: ${colors.translucent.dark.light};
      display: flex;
      flex-flow: column;
      height: 100%;
      justify-content: flex-start;
      left: initial;
      overflow-y: auto;
      padding: 0;
      position: absolute;
      right: ${rem(open ? 0 : -128)};
      top: 0;
      transform: none;
      transition: 0.1s right ease;
      width: ${rem(128)};
      z-index: 9;

      ${SettingsGroup} {
        width: 100%;
      }
    }
  `,
);

export type PropsToggleContainer = { isLoading?: boolean };

export const ToggleContainer = styled(FlexCenter)<PropsToggleContainer>(
  ({ isLoading }) => css`
    background: ${colors.translucent.light.dark};
    cursor: pointer;
    font-size: ${rem(14)};
    line-height: 100%;
    padding: ${rem(2)} ${rem(4)};

    ${isLoading &&
    css`
      opacity: 0.7;
    `}
  `,
);

export const CheckBox = styled.a<{ enabled: boolean }>(
  ({ enabled }) => css`
    height: ${rem(20)};
    margin-left: ${rem(4)};
    position: relative;
    width: ${rem(20)};
    &:before {
      left: ${rem(4)};
      top: ${rem(4)};
      width: ${rem(12)};
      height: ${rem(12)};
      box-shadow: 0 0 0 1px black;
    }
    &:after {
      left: ${rem(7)};
      top: ${rem(7)};
      width: ${rem(6)};
      height: ${rem(6)};
      ${enabled &&
      css`
        background: black;
      `}
    }
    &:before,
    &:after {
      content: '';
      position: absolute;
      border-radius: 100%;
    }
  `,
);
