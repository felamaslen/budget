import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { breakpoint } from '~client/styled/mixins';
import { sizes, colors, breakpoints } from '~client/styled/variables';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

export const NavList = styled.nav`
  align-items: center;
  display: flex;
  flex: 0 0 ${rem(sizes.heightNavMobile)};
  margin: 0;
  padding: 0;
  width: 100%;
  white-space: nowrap;
  user-select: none;
  box-shadow: 0 3px 9px ${colors.shadow.light as string},
    0 -2px 6px ${colors.shadow.light as string};
  transition: 0.2s opacity;

  ${breakpoint(breakpoints.mobile)} {
    align-items: flex-end;
    flex: 1 1 0;
    box-shadow: none;
  }
`;

export type NavPage = PageNonStandard | PageListStandard | 'logout';

type LinkProps = {
  isActive: boolean;
  page: NavPage;
};

export const Link = styled.span<LinkProps>`
  border-bottom: ${rem(4)} solid
    ${({ isActive }): string => (isActive ? colors.accent : colors.transparent)};
  display: block;
  flex: 1 0 0;
  height: 100%;
  padding-top: ${rem(3)};

  a {
    cursor: pointer;
    display: block;
    line-height: ${rem(30)};
    text-align: center;
    &:focus {
      outline: none;
    }
  }

  ${breakpoint(breakpoints.mobile)} {
    border-bottom: none;
    flex: 0 0 auto;
    height: ${rem(sizes.heightNavMobile)};
    margin: 0 ${rem(2)};
    padding-top: 0;

    a {
      border-bottom: ${rem(4)} solid transparent;
      border-bottom-color: ${({ page }): string =>
        page === 'logout' ? colors.light.mediumLight : colors[page].main};
      border-radius: 3px 3px 0 0;
      box-sizing: content-box;
      color: ${colors.white};
      display: block;
      height: ${rem(28)};
      padding: ${rem(2)} ${rem(10)};
      text-align: center;
      text-decoration: none;
      text-transform: capitalize;

      display: flex;
      height: ${rem(30)};
      padding: 0 ${rem(4)} ${rem(2)} ${rem(4)};

      ${({ isActive }): SerializedStyles =>
        isActive
          ? css`
              cursor: default;
              &,
              &:hover,
              &:active {
                background: ${colors.shadow.mediumDark};
              }
            `
          : css`
              &:hover {
                background: ${colors.shadow.light};
              }

              &:active {
                background: ${colors.shadow.mediumLight};
              }
            `}
    }
  }

  ${breakpoint(breakpoints.tablet)} {
    margin: 0 ${rem(8)} 0 0;
    padding: 0;

    a {
      display: flex;
      flex: 0 0 auto;
      height: ${rem(30)};
      padding: 0 ${rem(4)} ${rem(2)} ${rem(4)};
      text-align: left;
    }
  }
`;

export const LinkText = styled.span`
  display: none;
  ${breakpoint(breakpoints.tablet)} {
    display: inline;
  }
`;
