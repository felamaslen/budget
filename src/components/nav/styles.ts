import styled from 'styled-components';
import { sizes, colors, breakpoints } from '~/styled/variables';
import { breakpoint, rem } from '~/styled/mixins';

import pages from '~/constants/pages';
import nav from '~/images/nav.png';

export const NavList = styled.nav`
  display: flex;
  flex: 0 0 ${rem(sizes.heightNavMobile)};
  align-items: flex-end;
  margin: 0;
  padding: 0;
  width: 100%;
  white-space: nowrap;
  user-select: none;
  box-shadow: 0 3px 9px ${colors.shadowLight}, 0 -2px 6px ${colors.shadowLight};
  transition: 0.2s opacity;

  ${breakpoint(breakpoints.mobile)} {
    flex: 1 1 0;
    box-shadow: none;
  }
`;

interface LinkProps {
  page: string;
}

export const Link = styled.a<LinkProps>`
  display: ${({ page }): string => (page === 'logout' ? 'none' : 'block')};
  flex: 1 0 0;
  height: ${rem(sizes.heightNavMobile - 3)};
  line-height: 30px;
  overflow: hidden;
  text-align: center;
  border-bottom: 4px solid transparent;
  cursor: pointer;
  &.active {
    border-color: ${colors.accent};
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
      const index = Object.keys(pages).indexOf(page);
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
    border-color: ${({ page }): string => colors[page] || 'transparent'};
    &.active {
      border-bottom-color: ${colors.black};
      cursor: default;
      &,
      &:hover,
      &:active {
        background: ${colors.shadowMedium};
      }
    }

    &::before {
      background-position: ${({ page }): string => {
        if (page === 'logout') {
          return '-56px -28px';
        }
        if (!pages[page]) {
          return '0 0';
        }

        const index = Object.keys(pages).indexOf(page);

        return `-${28 * (index % 7)}px ${-(28 * Math.floor(index / 7))}px`;
      }};
    }

    &:hover {
      background: ${colors.shadowLight};
    }
    &:active {
      background: ${colors.shadowMedium};
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
