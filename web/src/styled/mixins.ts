import { css, FlattenSimpleInterpolation } from 'styled-components';
import { colors } from '~client/styled/variables';

export const breakpoint = (size: number): string => `@media only screen and (min-width: ${size}px)`;

export const diagonalBg = (size = 16): FlattenSimpleInterpolation => css`
  background-image: linear-gradient(
    45deg,
    ${colors['translucent-l2']} 25%,
    transparent 25%,
    transparent 50%,
    ${colors['translucent-l2']} 50%,
    ${colors['translucent-l2']} 75%,
    transparent 75%,
    transparent 0
  );
  background-size: ${size}px ${size}px;
`;

export const unimportant = css`
  color: ${colors['slightly-dark']};
  font-style: italic;
`;

export const rem = (value: number): string => `${value / 16}rem`;
