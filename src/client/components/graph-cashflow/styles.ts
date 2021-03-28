import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { FlexCenter } from '~client/styled/shared';
import { colors } from '~client/styled/variables';

export type SidebarProps = {
  open: boolean;
};

export const SidebarToggle = styled.button`
  align-items: center;
  appearance: none;
  background: ${colors.white};
  border: none;
  cursor: pointer;
  display: flex;
  flex-flow: column;
  justify-content: center;
  height: ${rem(24)};
  left: ${rem(-24)};
  outline: none;
  padding: 0;
  position: absolute;
  top: 0;
  width: ${rem(24)};
`;

export const SidebarToggleHamburger = styled.span`
  &,
  &::before,
  &::after {
    background: ${colors.black};
    height: ${rem(2)};
    width: ${rem(16)};
  }

  &::before,
  &::after {
    content: '';
    display: block;
  }

  &::before {
    margin-top: ${rem(-6)};
  }

  &::after {
    margin-top: ${rem(10)};
  }
`;

export const Sidebar = styled.div<SidebarProps>(
  ({ open }) => css`
    background: ${colors.translucent.dark.light};
    display: flex;
    flex-flow: column;
    height: 100%;
    right: ${rem(open ? 0 : -128)};
    position: absolute;
    top: 0;
    transition: 0.1s right ease;
    width: ${rem(128)};
    z-index: 10;
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
