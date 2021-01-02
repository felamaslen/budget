import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { colors, sizes } from '~client/styled/variables';

export type InnerProps = {
  size: number;
  color?: string;
};

export type OuterProps = InnerProps & {
  cover?: boolean;
};

export const Outer = styled.div<OuterProps>(
  ({ cover, size }) => css`
    display: flex;
    align-items: center;
    justify-content: center;

    ${cover
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
  `,
);
