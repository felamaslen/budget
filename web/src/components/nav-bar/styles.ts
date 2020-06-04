import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import nav from '../../images/nav.png';
import { PAGES } from '~client/constants/data';
import { breakpoint } from '~client/styled/mixins';
import { sizes, colors, breakpoints } from '~client/styled/variables';
import { Page } from '~client/types/app';

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

export const Link = styled(NavLink)<{
  page: Page | 'logout' | 'netWorth';
  to: string;
}>`
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
    display: block;
    margin: 0 auto;
    content: '';
    background-image: url(${nav});
    width: 28px;
    height: 28px;

    background-position: ${({ page }): string => {
      if (page === 'logout') {
        return '-256px -28px';
      }
      const index = Object.keys(PAGES).indexOf(page);
      if (index === -1) {
        return '0 0';
      }

      return `-${200 + 28 * (index % 7)}px ${-(28 * Math.floor(index / 7))}px`;
    }};
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
      if (page === 'netWorth') {
        return 'transparent';
      }
      if (colors[page]) {
        return colors[page].main;
      }

      return 'transparent';
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
      background-position: ${({ page }): string => {
        if (page === 'logout') {
          return '-56px -28px';
        }
        const index = Object.keys(PAGES).indexOf(page);
        if (index === -1) {
          return '0 0';
        }

        return `-${28 * (index % 7)}px ${-(28 * Math.floor(index / 7))}px`;
      }};
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
