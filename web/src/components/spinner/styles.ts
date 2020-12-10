import { rgba } from 'polished';
import styled, {
  css,
  FlattenInterpolation,
  Keyframes,
  keyframes,
  ThemeProps,
} from 'styled-components';

import { rem } from '~client/styled/mixins';
import { colors, sizes } from '~client/styled/variables';

export type InnerProps = {
  size: number;
  color?: string;
};

export type OuterProps = InnerProps & {
  cover?: boolean;
};

export const Outer = styled.div<OuterProps>`
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ cover, size }): FlattenInterpolation<ThemeProps<unknown>> | undefined =>
    cover
      ? css`
          background: ${colors.translucent.light.mediumLight};
          height: 100%;
          left: 0;
          position: fixed;
          top: ${sizes.navbarHeight}px;
          width: 100%;
          z-index: 500;
        `
      : css`
          height: ${rem(100 * size)};
          width: ${rem(100 * size)};
        `}
`;

function load5(size: number, color = colors.shadow.dark): Keyframes {
  const color2 = rgba(color, 0.2);
  const color5 = rgba(color, 0.5);
  const color7 = rgba(color, 0.7);

  return keyframes`
  0%,
  100% {
    box-shadow: 0 ${rem(-26 * size)} 0 0 ${color}, ${rem(18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2}, ${rem(25 * size)} 0 0 0 ${color2}, ${rem(17.5 * size)} ${rem(
    17.5 * size,
  )} 0 0 ${color2}, 0 ${rem(25 * size)} 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    18 * size,
  )} 0 0 ${color2}, ${rem(-26 * size)} 0 0 0 ${color5}, ${rem(-18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color7};
  }
  12.5% {
    box-shadow: 0 ${rem(-26 * size)} 0 0 ${color7}, ${rem(18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color}, ${rem(25 * size)} 0 0 0 ${color2}, ${rem(17.5 * size)} ${rem(
    17.5 * size,
  )} 0 0 ${color2}, 0 ${rem(25 * size)} 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    18 * size,
  )} 0 0 ${color2}, ${rem(-26 * size)} 0 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color5};
  }
  25% {
    box-shadow: 0 ${rem(-26 * size)} 0 0 ${color5}, ${rem(18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color7}, ${rem(25 * size)} 0 0 0 ${color}, ${rem(17.5 * size)} ${rem(
    17.5 * size,
  )} 0 0 ${color2}, 0 ${rem(25 * size)} 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    18 * size,
  )} 0 0 ${color2}, ${rem(-26 * size)} 0 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2};
  }
  37.5% {
    box-shadow: 0 ${rem(-26 * size)} 0 0 ${color2}, ${rem(18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color5}, ${rem(25 * size)} 0 0 0 ${color7}, ${rem(17.5 * size)} ${rem(
    17.5 * size,
  )} 0 0 ${color}, 0 ${rem(25 * size)} 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    18 * size,
  )} 0 0 ${color2}, ${rem(-26 * size)} 0 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2};
  }
  50% {
    box-shadow: 0 ${rem(-26 * size)} 0 0 ${color2}, ${rem(18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2}, ${rem(25 * size)} 0 0 0 ${color5}, ${rem(17.5 * size)} ${rem(
    17.5 * size,
  )} 0 0 ${color7}, 0 ${rem(25 * size)} 0 0 ${color}, ${rem(-18 * size)} ${rem(
    18 * size,
  )} 0 0 ${color2}, ${rem(-26 * size)} 0 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2};
  }
  62.5% {
    box-shadow: 0 ${rem(-26 * size)} 0 0 ${color2}, ${rem(18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2}, ${rem(25 * size)} 0 0 0 ${color2}, ${rem(17.5 * size)} ${rem(
    17.5 * size,
  )} 0 0 ${color5}, 0 ${rem(25 * size)} 0 0 ${color7}, ${rem(-18 * size)} ${rem(
    18 * size,
  )} 0 0 ${color}, ${rem(-26 * size)} 0 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2};
  }
  75% {
    box-shadow: 0 ${rem(-26 * size)} 0 0 ${color2}, ${rem(18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2}, ${rem(25 * size)} 0 0 0 ${color2}, ${rem(17.5 * size)} ${rem(
    17.5 * size,
  )} 0 0 ${color2}, 0 ${rem(25 * size)} 0 0 ${color5}, ${rem(-18 * size)} ${rem(
    18 * size,
  )} 0 0 ${color7}, ${rem(-26 * size)} 0 0 0 ${color}, ${rem(-18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2};
  }
  87.5% {
    box-shadow: 0 ${rem(-26 * size)} 0 0 ${color2}, ${rem(18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color2}, ${rem(25 * size)} 0 0 0 ${color2}, ${rem(17.5 * size)} ${rem(
    17.5 * size,
  )} 0 0 ${color2}, 0 ${rem(25 * size)} 0 0 ${color2}, ${rem(-18 * size)} ${rem(
    18 * size,
  )} 0 0 ${color5}, ${rem(-26 * size)} 0 0 0 ${color7}, ${rem(-18 * size)} ${rem(
    -18 * size,
  )} 0 0 ${color};
  }
}
`;
}

export const Loader = styled.div<InnerProps>`
  font-size: 25px;
  width: ${({ size }): string => rem(size * 10)};
  height: ${({ size }): string => rem(size * 10)};
  border-radius: 50%;
  position: relative;
  text-indent: -9999em;
  animation: ${({ color, size }): Keyframes => load5(size, color)} 1.1s infinite ease;
  transform: translateZ(0);
`;
