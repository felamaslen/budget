import { compose } from '@typed/compose';
import styled, { FlattenSimpleInterpolation, css } from 'styled-components';

import { BlockStyleProps as BlockProps } from './types';
import { isCalcPage } from '~client/constants/data';
import { breakpoint, diagonalBg } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

type SizeProps = Pick<BlockProps, 'width' | 'height'>;
type PositionProps = Pick<BlockProps, 'left' | 'top'>;

function getBlockColor({
  active,
  blockColor,
  name,
}: Pick<BlockProps, 'active' | 'blockColor' | 'name'>): string | undefined {
  if (active) {
    return undefined;
  }
  if (isCalcPage(name)) {
    return colors[name].main;
  }
  if (name && colors.blockColor[name]) {
    return colors.blockColor[name];
  }
  if (typeof blockColor === 'number' && blockColor < colors.blockIndex.length) {
    return colors.blockIndex[blockColor];
  }

  return 'white';
}

const withStyle = <P extends {}, O extends {}>(getStyle: (props: P) => O) => (props: P) => (
  last: { style?: object } = {},
): { style: O } => ({
  ...last,
  style: {
    ...(last.style || {}),
    ...getStyle(props),
  },
});

const sized = withStyle(
  ({ width, height }: SizeProps): SizeProps => ({
    width,
    height,
  }),
);
const blockColor = withStyle((props: Pick<BlockProps, 'active' | 'blockColor' | 'name'>): {
  backgroundColor?: string;
} => ({
  backgroundColor: getBlockColor(props),
}));
const position = withStyle(({ left, top }: PositionProps): PositionProps => ({ left, top }));

export const fadeTime = 100;

type StyleGenerator = (last: object) => object;

const ifProps = (condition: boolean) => (styleGenerator: StyleGenerator): StyleGenerator => {
  if (condition) {
    return styleGenerator;
  }

  return (last = {}): object => last;
};

const Sized = styled.div.attrs((props: SizeProps) => compose(sized(props))({}))<SizeProps>`
  float: left;
`;

export const BlockGroup = styled(Sized)`
  display: inline-block;
`;

const BlockBase = styled(Sized)<Pick<BlockProps, 'active'>>`
  position: relative;

  ${({ active }): false | string => !!active && `background: ${colors.highlight}`};
`;

export const Block = styled(BlockBase).attrs((props: BlockProps) =>
  compose(sized(props), blockColor(props))({}),
)<Pick<BlockProps, 'width' | 'height' | 'blockColor' | 'active' | 'name'>>`
  box-shadow: inset 0 0 13px ${colors['shadow-l6']};
  z-index: 1;

  &:hover {
    z-index: 2;
    box-shadow: inset 0 0 13px ${colors['shadow-l2']}, 0 0 16px 3px ${colors['shadow-l4']};
  }

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
    `}
`;

export const Preview = styled(Block).attrs((props: BlockProps) =>
  compose(
    blockColor(props),
    ifProps(!props.expanded)(sized(props)),
    ifProps(!props.expanded)(position(props)),
  )({}),
)<BlockProps>`
  display: block;
  position: absolute;
  z-index: 5;
  transition: all ${fadeTime}ms ease-in-out;

  ${({ expanded }): false | FlattenSimpleInterpolation =>
    !!expanded &&
    css`
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
    `}

  opacity: ${({ expanded, hidden }): 0 | 1 => (hidden || !expanded ? 0 : 1)};
`;

export const SubBlock = styled(BlockBase)<Pick<BlockProps, 'width' | 'height' | 'active'>>`
  box-shadow: inset -1px -1px 13px ${colors['shadow-l4']};
  background-image: linear-gradient(
    to bottom right,
    ${colors['translucent-l6']},
    ${colors['shadow-l3']}
  );
`;

export const StatusBar = styled.div`
  padding: 0 0.8em;
  z-index: 2;
  width: 100%;
  flex-basis: 21px;
  flex-grow: 0;
  flex-shrink: 0;
  line-height: 20px;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: ${colors.analysis.statusBg};
  color: ${colors.analysis.status};
  margin-top: -1px;
`;

export const BlockTreeOuter = styled.div`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  width: 100%;
  position: relative;
`;

export const BlockTree = styled.div<{ deep: boolean }>`
  z-index: ${({ deep }): number => 1 + (deep ? 1 : 0)};
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  box-shadow: 0 3px 13px ${colors['shadow-l6']};
`;

export const BlockView = styled.div`
  display: none;

  ${breakpoint(breakpoints.mobileSmall)} {
    display: flex;
    flex-flow: column;
    height: 300px;
  }

  ${breakpoint(breakpoints.mobile)} {
    width: 400px;
    align-self: center;
  }

  ${breakpoint(breakpoints.tablet)} {
    grid-row: 2;
    grid-column: 2;
    width: 500px;
    height: 500px;
  }
`;
