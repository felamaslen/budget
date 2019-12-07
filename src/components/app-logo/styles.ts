import styled, { keyframes } from 'styled-components';
import { darken } from 'polished';

import { breakpoints, sizes, colors } from '~/styled/variables';
import { breakpoint, rem } from '~/styled/mixins';
import { Flex } from '~/styled/layout';

import nav from '~/images/nav.png';

const spin = keyframes`
from {
  transform: rotate(0);
}
to {
  transform: rotate(360deg);
}
`;

const logoHeightMobile = sizes.heightHeaderMobile - sizes.heightNavMobile;

export const AppLogo = styled(Flex)`
  flex: 0 0 ${rem(logoHeightMobile)};
  flex-flow: row-reverse;
  align-items: center;
  justify-content: flex-end;
  padding: 0 ${rem(8)};
  width: 100%;
  background: ${darken(0.15, colors.primary)};

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 auto;
    flex-flow: row;
    margin: 0 ${rem(16)} 0 ${rem(8)};
    width: auto;
    height: ${rem(sizes.heightHeader)};
    background: none;
  }
`;

export const QueueNotSaved = styled.span`
  font-size: ${rem(12)};

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
  line-height: ${rem(logoHeightMobile)};
  font-weight: bold;
  font-size: 22px;
  &::before {
    display: inline-block;
    flex: 0 0 ${sizes.logo + 8}px;
    content: '';
    width: ${rem(sizes.logo)};
    height: ${rem(sizes.logo)};
    background: url(${nav}) 0 -56px;
  }
`;

export const LoadingApi = styled.span`
  width: ${rem(sizes.logo + 4)};
  height: ${rem(sizes.logo + 4)};
  position: absolute;
  left: ${rem(-2)};
  border-radius: 100%;
  border: ${rem(4)} solid transparent;
  border-top: 4px solid ${colors.amber};
  animation: ${spin} 1s infinite ease;
`;
