import styled from '@emotion/styled';
import { rem } from 'polished';

import nav1x from '~client/images/nav.png';
import nav2x from '~client/images/nav@2x.png';
import { breakpoint } from '~client/styled/mixins';
import { Flex, H1 } from '~client/styled/shared';
import {
  breakpoints,
  sizes,
  colors,
  navSpriteWidth,
  navSpriteHeight,
} from '~client/styled/variables';

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

export const Logo = styled.span`
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
    background-position: 0 0;
    content: '';
    display: inline-block;
    flex: 0 0 ${rem(sizes.logo)};
    height: ${rem(sizes.logo)};
    margin-right: ${rem(8)};
    width: ${rem(sizes.logo)};
    @media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      background-image: url(${nav2x});
      background-size: ${navSpriteWidth}px ${navSpriteHeight}px;
    }
  }
`;

export const TitleContainer = styled(Flex)`
  align-items: center;
  height: 100%;
`;

export const Title = styled(H1)`
  align-items: center;
  display: inline-flex;
  font-size: ${rem(22)};
  margin: 0;

  & > span {
    margin-right: ${rem(4)};
  }

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${rem(sizes.navbarHeight - 6)};
    line-height: ${rem(sizes.navbarHeight - 6)};
  }
`;

export const Loader = styled.div`
  height: ${rem(22)};
  position: relative;

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${rem(22)};
    margin: 0 ${rem(8)} 0 ${rem(4)};
  }
`;

export const SettingsButton = styled.a`
  align-items: center;
  color: ${colors.light.mediumLight};
  cursor: pointer;
  display: inline-flex;
  font-size: ${rem(28)};
  margin-left: ${rem(4)};

  ${breakpoint(breakpoints.mobile)} {
    margin-left: 0;
  }
`;

export const Spinner = styled.div`
  flex: 0 0 ${rem(8)};
`;
