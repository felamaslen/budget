import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { Page as PageAnalysis, blocksHeightMobile } from '~client/components/page-analysis/styles';
import { diagonalBg, breakpoint } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';
import type { Box as BoxProps } from '~client/types';

export const fadeTime = 250;

export const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;

  ${PageAnalysis} & {
    flex: 0 0 ${rem(breakpoints.mobileSmall)};
    ${breakpoint(breakpoints.mobileSmall)} {
      flex: 0 0 ${rem(blocksHeightMobile)};
    }
  }
`;

export const BoxContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
`;

export const Expander = styled.div`
  display: block;
  position: absolute;
  z-index: 5;
  transition: all ${fadeTime}ms ease-in-out;
`;

export const getBoxStyle = ({ flex, flow }: BoxProps): { width: string; height: string } => ({
  height: `${(flow === 'row' ? 1 : flex) * 100}%`,
  width: `${(flow === 'row' ? flex : 1) * 100}%`,
});

export const InfiniteBox = styled.div`
  float: left;
  height: 100%;
  width: 100%;
`;

const activeStyle = css`
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    background-color: ${colors.highlight.dark};
  }
`;

export const InfiniteChild = styled.div<{
  name: string;
  active?: boolean;
  hasSubTree: boolean;
}>(
  ({ active, hasSubTree, name }) => css`
    background-image: ${hasSubTree
      ? 'none'
      : `linear-gradient(to bottom right, ${colors.translucent.light.dark}, ${colors.shadow.light})`};

    ${name === 'saved' &&
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

    box-shadow: inset -1px -1px 13px ${colors.shadow.mediumLight};
    cursor: default;
    float: left;
    height: 100%;
    outline: none;
    overflow: hidden;
    position: relative;
    width: 100%;

    ${!hasSubTree &&
    css`
      ${active ? activeStyle : ''};

      &:hover,
      &:focus {
        ${activeStyle};
      }
    `}
  `,
);

export const statusHeight = 21;

export const StatusBar = styled.div`
  background: ${colors.dark.mediumLight};
  padding: 0 0.8em;
  margin-top: -1px;
  color: ${colors.light.mediumLight};
  flex: 0 0 ${rem(statusHeight)};
  font-size: ${rem(16)};
  line-height: ${rem(20)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  z-index: 2;
`;
