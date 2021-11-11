import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import nav1x from '../../images/nav.png';
import nav2x from '../../images/nav@2x.png';
import { breakpoint } from '~client/styled/mixins';
import {
  sizes,
  colors,
  breakpoints,
  navSpriteWidth,
  navSpriteHeight,
} from '~client/styled/variables';
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

type PageBackgroundPosition = Record<NavPage, string>;

const pageBackgroundPositionMobile: PageBackgroundPosition = {
  logout: '-30px -59px',
  [PageNonStandard.Overview]: '-1px -1px',
  [PageNonStandard.Planning]: '-263px -1px',
  [PageNonStandard.Analysis]: '-30px -1px',
  [PageNonStandard.Funds]: '-59px -1px',
  [PageListStandard.Income]: '-88px -1px',
  [PageListStandard.Bills]: '-117px -1px',
  [PageListStandard.Food]: '-146px 0px',
  [PageListStandard.General]: '-175px -1px',
  [PageListStandard.Holiday]: '-204px -1px',
  [PageListStandard.Social]: '-233px -1px',
};

const pageBackgroundPositionDesktop: PageBackgroundPosition = {
  logout: '-58px -59px',
  [PageNonStandard.Overview]: '-1px -30px',
  [PageNonStandard.Planning]: '-263px -30px',
  [PageNonStandard.Analysis]: '-30px -30px',
  [PageNonStandard.Funds]: '-59px -30px',
  [PageListStandard.Income]: '-88px -30px',
  [PageListStandard.Bills]: '-117px -30px',
  [PageListStandard.Food]: '-146px -30px',
  [PageListStandard.General]: '-175px -30px',
  [PageListStandard.Holiday]: '-204px -30px',
  [PageListStandard.Social]: '-233px -30px',
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
    &::before {
      background-image: url(${nav1x});
      background-position: ${({ page }): string => pageBackgroundPositionMobile[page]};
      content: ${({ page }): string =>
        ['overview', 'planning', 'analysis', 'funds', 'income', 'bills'].includes(page)
          ? 'none'
          : "''"};
      display: block;
      margin: 0 auto;
      height: ${rem(28)};
      width: ${rem(28)};

      @media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        background-image: url(${nav2x});
        background-size: ${navSpriteWidth}px ${navSpriteHeight}px;
      }
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

      &::before {
        margin: ${rem(2)};
      }

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

      &::before {
        background-position: ${({ page }): string => pageBackgroundPositionDesktop[page]};
      }
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

      &::before {
        margin: ${rem(2)};
      }
    }
  }
`;

export const LinkText = styled.span`
  display: none;
  ${breakpoint(breakpoints.tablet)} {
    display: inline;
  }
`;
