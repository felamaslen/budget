import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';
import { colors } from '~client/styled/variables';

export const Label = styled.span<{ small: boolean }>(
  ({ small }) => css`
    color: ${colors.light.light};
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    white-space: nowrap;

    ${small &&
    css`
      color: ${colors.white};
      font-size: ${rem(10)};
      transform: translateX(-50%) translateY(-50%) rotate(-45deg);
      transform-origin: center center;
    `};
  `,
);
