import styled from '@emotion/styled';
import { rem } from 'polished';
import { NavLink } from 'react-router-dom';

import nav1x from '../../images/nav.png';
import nav2x from '../../images/nav@2x.png';
import { breakpoint } from '~client/styled/mixins';
import { sizes, colors, breakpoints } from '~client/styled/variables';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

export const NavList = styled.nav`
  display: flex;
  flex: 0 0 ${sizes.heightNavMobile}px;
  align-items: flex-end;
  margin: 0;
  padding: 0;
  width: 100%;
  white-space: nowrap;
  user-select: none;
  box-shadow: 0 3px 9px ${colors.shadow.light as string},
    0 -2px 6px ${colors.shadow.light as string};
  transition: 0.2s opacity;

  ${breakpoint(breakpoints.mobile)} {
    flex: 1 1 0;
    box-shadow: none;
  }
`;

export type NavPage = PageNonStandard | PageListStandard | 'logout';

type LinkProps = {
  page: NavPage;
  to: string;
};

type PageBackgroundPosition = Record<NavPage, string>;

const pageBackgroundPositionMobile: PageBackgroundPosition = {
  logout: '-30px -59px',
  [PageNonStandard.Overview]: '-1px -1px',
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
  [PageNonStandard.Analysis]: '-30px -30px',
  [PageNonStandard.Funds]: '-59px -30px',
  [PageListStandard.Income]: '-88px -30px',
  [PageListStandard.Bills]: '-117px -30px',
  [PageListStandard.Food]: '-146px -30px',
  [PageListStandard.General]: '-175px -30px',
  [PageListStandard.Holiday]: '-204px -30px',
  [PageListStandard.Social]: '-233px -30px',
};

export const Link = styled(NavLink)<LinkProps>`
  flex: 1 0 0;
  height: ${rem(sizes.heightNavMobile - 3)};
  line-height: ${rem(30)};
  overflow: hidden;
  text-align: center;
  border-bottom: ${rem(4)} solid transparent;
  cursor: pointer;
  &.active {
    border-color: ${colors.accent as string};
  }
  &:focus {
    outline: none;
  }
  &::before {
    background-image: url(${nav1x});
    background-position: ${({ page }): string => pageBackgroundPositionMobile[page]};
    content: '';
    display: block;
    margin: 0 auto;
    height: ${rem(28)};
    width: ${rem(28)};

    @media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      background-image: url(${nav2x});
      background-size: 262px 88px;
    }
  }

  ${breakpoint(breakpoints.mobile)} {
    border-bottom: ${rem(3)} solid transparent;
    border-color: ${({ page }): string => {
      if (page === 'logout') {
        return colors.light.mediumLight;
      }
      return colors[page].main;
    }};
    border-radius: 3px 3px 0 0;
    box-sizing: content-box;
    color: ${colors.white};
    display: block;
    flex: 0 0 ${rem(46)};
    height: ${rem(30)};
    padding: ${rem(2)} ${rem(1)} 0 ${rem(1)};
    text-align: center;
    text-decoration: none;
    text-transform: capitalize;

    &.active {
      border-bottom-color: ${colors.black};
      cursor: default;
      &,
      &:hover,
      &:active {
        background: ${colors.shadow.mediumDark as string};
      }
    }

    &::before {
      background-position: ${({ page }): string => pageBackgroundPositionDesktop[page]};
    }

    &:hover {
      background: ${colors.shadow.light as string};
    }
    &:active {
      background: ${colors.shadow.mediumLight as string};
    }
  }

  ${breakpoint(breakpoints.tablet)} {
    display: flex;
    flex: 0 0 auto;
    margin: 0 ${rem(4)} 0 0;
    padding: ${rem(4)} ${rem(4)} 0 ${rem(2)};
    text-align: left;

    &::before {
      margin: 0 ${rem(4)} 0 0;
    }
  }
`;
