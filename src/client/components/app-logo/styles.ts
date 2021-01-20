import styled from '@emotion/styled';
import { rem } from 'polished';

import nav1x from '~client/images/nav.png';
import nav2x from '~client/images/nav@2x.png';
import { breakpoint } from '~client/styled/mixins';
import { Flex } from '~client/styled/shared';
import { breakpoints, sizes, colors } from '~client/styled/variables';

export const AppLogo = styled.div`
  display: flex;
  flex: 0 0 ${rem(sizes.heightHeaderMobile)};
  flex-flow: row-reverse;
  align-items: center;
  justify-content: flex-end;
  padding: 0 ${rem(8)};
  width: 100%;
  background: ${colors.primaryDarkMobile};

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 auto;
    flex-flow: row;
    width: auto;
    height: ${rem(sizes.navbarHeight)};
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
    color: ${colors.translucent.light.mediumLight};
  }
`;

export const Logo = styled.a`
  align-items: center;
  display: flex;
  flex: 1;
  flex-flow: row;
  height: 100%;
  line-height: 100%;
  font-weight: bold;
  position: relative;
  &::before {
    background-image: url(${nav1x});
    background-position: -1px -59px;
    content: '';
    display: inline-block;
    flex: 0 0 ${rem(sizes.logo)};
    height: ${rem(sizes.logo)};
    margin-right: ${rem(8)};
    width: ${rem(sizes.logo)};
    @media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      background-image: url(${nav2x});
      background-size: 262px 88px;
    }
  }
`;

export const TitleContainer = styled(Flex)`
  align-items: center;
  height: 100%;
  padding-right: ${rem(36)};
`;

export const Title = styled.h1`
  font-size: ${rem(22)};
  margin: 0;

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${rem(sizes.navbarHeight - 6)};
    line-height: ${rem(sizes.navbarHeight - 6)};
  }
`;

export const Spinner = styled.div`
  flex: 0 0 ${rem(8)};
`;
