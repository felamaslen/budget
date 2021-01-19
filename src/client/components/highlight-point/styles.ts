import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { opacify, rem } from 'polished';
import { colors } from '~client/styled/variables';
import { Padding } from '~client/types';

type CommonProps = {
  height: number;
  padding: Padding;
  width: number;
};

export const LineVertical = styled.div<CommonProps>(
  ({ height, padding }) => css`
    border-right: 1px dashed ${colors.medium.mediumDark};
    position: absolute;
    height: ${rem(height - padding[0] - padding[2])};
    margin-left: -0.5px;
    top: ${rem(padding[0])};
    width: 0;
  `,
);

export const Circle = styled.div<CommonProps & { color: string }>(
  ({ color }) => css`
    background: ${opacify(1)(color)};
    border-radius: 100%;
    height: 6px;
    margin-left: -3px;
    margin-top: -3px;
    position: absolute;
    width: 6px;
  `,
);

export const HighlightBackground = styled.div<CommonProps & { isComparing: boolean }>(
  ({ height, isComparing, padding }) => css`
    background: ${colors.translucent.light.dark};
    height: ${rem(height - padding[0] - padding[2])};
    opacity: ${isComparing ? 1 : 0};
    position: absolute;
    top: ${rem(padding[0])};
    transition: 0.2s opacity ease;
  `,
);

export type LabelBaseProps = CommonProps & {
  secondary: boolean;
  color: string;
  isAtTop: boolean;
  textColor: string;
};

export const LabelBase = styled.div<LabelBaseProps>(
  ({ color, height, isAtTop, padding, textColor }) => css`
    background-color: ${color};
    color: ${textColor};
    font-size: ${rem(12)};
    position: absolute;
    top: ${rem(isAtTop ? padding[0] : height - padding[2])};
    transform: translateX(-50%) ${isAtTop ? '' : 'translateY(-100%)'};
  `,
);
