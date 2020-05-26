import styled, { FlattenSimpleInterpolation, css } from 'styled-components';

import { Preview } from './types';
import { rem, diagonalBg } from '~client/styled/mixins';
import { colors } from '~client/styled/variables';
import { FlexFlow } from '~client/types';

export const fadeTime = 250;

export const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
`;

export const BoxContainer = styled.div`
  flex: 1 0 auto;
  position: relative;
`;

type ExpanderProps = Omit<Preview, 'open' | 'name'>;
export const Expander = styled.div.attrs(({ left, top, height, width, color }: ExpanderProps) => ({
  style: {
    backgroundColor: color,
    left,
    top,
    height,
    width,
  },
}))<ExpanderProps>`
  display: block;
  position: absolute;
  z-index: 5;
  transition: all ${fadeTime}ms ease-in-out;
`;

export const Box = styled.div.attrs(({ flex }: { flex: number }) => ({
  style: {
    flexBasis: `${flex * 100}%`,
  },
}))<{
  flex: number; // 0 < flex <= 1; used as flex-basis percentage
  flow: FlexFlow;
}>`
  display: flex;
  flex-flow: ${({ flow }): FlexFlow => flow};
  flex-grow: 0;
  flex-shrink: 0;
  height: 100%;
  width: 100%;
`;

export const Child = styled.div.attrs(({ flex, bgColor }: { flex: number; bgColor?: string }) => ({
  style: {
    flexBasis: `${flex * 100}%`,
    backgroundColor: bgColor,
  },
}))<{
  flex: number; // 0 < flex <= 1; used as flex-basis percentage
  name: string;
  bgColor?: string;
  hasSubTree: boolean;
}>`
  background-image: ${({ hasSubTree }): string =>
    hasSubTree
      ? 'none'
      : `linear-gradient(to bottom right, ${colors['translucent-l6']}, ${colors['shadow-l3']})`};

  ${({ name }): false | FlattenSimpleInterpolation =>
    name === 'saved' &&
    css`
      background-image: none;

      &::after {
        ${diagonalBg(16)};
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
      }
    `};

  box-shadow: inset -1px -1px 13px ${colors['shadow-l4']};
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: 100%;
  outline: none;
  position: relative;
  width: 100%;
`;

export const StatusBar = styled.div`
  background: ${colors.dark};
  padding: 0 0.8em;
  margin-top: -1px;
  color: ${colors.light};
  flex: 0 0 ${rem(21)};
  font-size: ${rem(16)};
  line-height: ${rem(20)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  z-index: 2;
`;
