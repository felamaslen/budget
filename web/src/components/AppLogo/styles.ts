import styled from 'styled-components';

import nav from '~client/images/nav.png';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, sizes, colors } from '~client/styled/variables';

export const AppLogo = styled.div`
  display: flex;
  flex: 0 0 ${sizes.heightHeaderMobile}px;
  flex-flow: row-reverse;
  align-items: center;
  justify-content: flex-end;
  padding: 0 0.5em;
  width: 100%;
  background: ${colors.primaryDarkMobile};

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 auto;
    flex-flow: row;
    margin: 0 1em 0 0.5em;
    width: auto;
    height: ${sizes.navbarHeight};
    background: none;
  }
`;

export const QueueNotSaved = styled.span`
  font-size: 0.9em;

  ${breakpoint(breakpoints.mobile)} {
    position: absolute;
    left: 2px;
    top: 2px;
    white-space: nowrap;
    font-size: 12px;
    font-weight: bold;
    color: ${colors['translucent-l8']};
  }
`;

export const Logo = styled.a`
  display: flex;
  flex: 1;
  position: relative;
  align-items: center;
  line-height: 55px;
  font-family: Ubuntu, Georgia, serif;
  font-weight: bold;
  font-size: 22px;
  &::before {
    display: inline-block;
    flex: 0 0 ${sizes.logo + 8}px;
    content: '';
    width: ${sizes.logo}px;
    height: ${sizes.logo}px;
    background: url(${nav}) 0 -56px;
  }
`;

export const LoadingApi = styled.span`
  width: ${sizes.logo + 4}px;
  height: ${sizes.logo + 4}px;
  position: absolute;
  left: -2px;
  border-radius: 100%;
  border: 4px solid transparent;
  border-top: 4px solid ${colors.amber};
  animation: spin 1s infinite ease;
`;
