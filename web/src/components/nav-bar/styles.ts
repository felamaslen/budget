import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';

import nav1x from '../../images/nav.png';
import nav2x from '../../images/nav@2x.png';
import { breakpoint } from '~client/styled/mixins';
import { sizes, colors, breakpoints } from '~client/styled/variables';
import { PageListStandard, PageNonStandard } from '~client/types';

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
  logout: '-28px -56px',
  [PageNonStandard.Overview]: '0px 0px',
  [PageNonStandard.Analysis]: '-28px 0px',
  [PageNonStandard.Funds]: '-56px 0px',
  [PageListStandard.Income]: '-84px 0px',
  [PageListStandard.Bills]: '-112px 0px',
  [PageListStandard.Food]: '-140px 0px',
  [PageListStandard.General]: '-168px 0px',
  [PageListStandard.Holiday]: '-196px 0px',
  [PageListStandard.Social]: '-224px 0px',
};

const pageBackgroundPositionDesktop: PageBackgroundPosition = {
  logout: '-56px -56px',
  [PageNonStandard.Overview]: '0px -28px',
  [PageNonStandard.Analysis]: '-28px -28px',
  [PageNonStandard.Funds]: '-56px -28px',
  [PageListStandard.Income]: '-84px -28px',
  [PageListStandard.Bills]: '-112px -28px',
  [PageListStandard.Food]: '-140px -28px',
  [PageListStandard.General]: '-168px -28px',
  [PageListStandard.Holiday]: '-196px -28px',
  [PageListStandard.Social]: '-224px -28px',
};

export const Link = styled(NavLink)<LinkProps>`
  flex: 1 0 0;
  height: ${sizes.heightNavMobile - 3}px;
  line-height: 30px;
  overflow: hidden;
  text-align: center;
  border-bottom: 4px solid transparent;
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
    height: 28px;
    width: 28px;

    @media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      background-image: url(${nav2x});
      background-size: 252px 84px;
    }
  }

  ${breakpoint(breakpoints.mobile)} {
    display: block;
    text-align: center;
    margin: 0 0.5em 0 0;
    flex: 0 0 46px;
    height: 30px;
    border-bottom: 3px solid transparent;
    text-transform: capitalize;
    text-decoration: none;
    border-radius: 3px 3px 0 0;
    color: ${colors.white};
    border-color: ${({ page }): string => {
      if (page === 'logout') {
        return colors.light.mediumLight;
      }
      return colors[page].main;
    }};
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
      transform: scale(0.85);
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
    padding: 0 0.5em 0 5px;
    flex: 0 0 auto;
    text-align: left;

    &::before {
      margin: 0 2px 0 0;
    }
  }
`;
