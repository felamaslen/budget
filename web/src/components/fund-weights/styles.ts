import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { rem } from '~client/styled/mixins';
import { colors } from '~client/styled/variables';

export const Label = styled.span<{ small: boolean }>`
  color: ${colors['very-light']};
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  white-space: nowrap;

  ${({ small }): false | FlattenSimpleInterpolation =>
    small &&
    css`
      color: ${colors.white};
      font-size: ${rem(10)};
      transform: translateX(-50%) translateY(-50%) rotate(-45deg);
      transform-origin: center center;
    `};
`;
