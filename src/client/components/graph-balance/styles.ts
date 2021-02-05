import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { FlexCenter } from '~client/styled/shared';
import { colors } from '~client/styled/variables';

export const Toggles = styled(FlexCenter)`
  height: ${rem(20)};
  position: absolute;
  right: 0;
  top: 0;
  user-select: none;
`;

export type PropsToggleContainer = { isLoading?: boolean };

export const ToggleContainer = styled(FlexCenter)<PropsToggleContainer>(
  ({ isLoading }) => css`
    background: ${colors.translucent.light.dark};
    cursor: pointer;
    font-size: ${rem(14)};
    line-height: 100%;
    padding: ${rem(2)} ${rem(4)};

    ${isLoading &&
    css`
      opacity: 0.7;
    `}
  `,
);

export const CheckBox = styled.a<{ enabled: boolean }>(
  ({ enabled }) => css`
    height: ${rem(20)};
    margin-left: ${rem(4)};
    position: relative;
    width: ${rem(20)};
    &:before {
      left: ${rem(4)};
      top: ${rem(4)};
      width: ${rem(12)};
      height: ${rem(12)};
      box-shadow: 0 0 0 1px black;
    }
    &:after {
      left: ${rem(7)};
      top: ${rem(7)};
      width: ${rem(6)};
      height: ${rem(6)};
      ${enabled &&
      css`
        background: black;
      `}
    }
    &:before,
    &:after {
      content: '';
      position: absolute;
      border-radius: 100%;
    }
  `,
);
