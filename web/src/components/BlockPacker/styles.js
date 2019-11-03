import styled from 'styled-components';
import compose from 'just-compose';
import { breakpoint, diagonalBg } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

function getBlockColor({ active, color, name }) {
    if (active) {
        return undefined;
    }
    if (colors[name]) {
        return colors[name].main;
    }
    if (colors.blockColor[name]) {
        return colors.blockColor[name];
    }
    if (typeof color === 'number' && color < colors.blockIndex.length) {
        return colors.blockIndex[color];
    }

    return 'white';
}

const withStyle = (getStyle) => (props) => (last = {}) => ({
    ...last,
    style: {
        ...(last.style || {}),
        ...getStyle(props),
    },
});

const sized = withStyle(({ width, height }) => ({ width, height }));
const blockColor = withStyle((props) => ({ backgroundColor: getBlockColor(props) }));
const position = withStyle(({ left, top }) => ({ left, top }));

export const fadeTime = 100;

const ifProps = (condition) => (styleGenerator) => {
    if (condition) {
        return styleGenerator;
    }

    return (last = {}) => last;
};

const Sized = styled.div.attrs((props) => compose(
    sized(props),
)())`
    float: left;
`;

export const BlockGroup = styled(Sized)`
    display: inline-block;
`;

const BlockBase = styled(Sized)`
    position: relative;

    ${({ active }) => active && `background: ${colors.highlight}`};
`;

export const Block = styled(BlockBase).attrs((props) => compose(
    sized(props),
    blockColor(props),
)())`
    box-shadow: inset 0 0 13px ${colors['shadow-l6']};
    z-index: 1;

    &:hover {
        z-index: 2;
        box-shadow: inset 0 0 13px ${colors['shadow-l2']}, 0 0 16px 3px ${colors['shadow-l4']};
    }

    ${({ name }) => name === 'saved' && `
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

export const Preview = styled(Block).attrs((props) => compose(
    blockColor(props),
    ifProps(!props.expanded)(sized(props)),
    ifProps(!props.expanded)(position(props)),
)())`
    display: block;
    position: absolute;
    z-index: 5;
    transition: all ${fadeTime}ms ease-in-out;

    ${({ expanded }) => expanded && `
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
    `}

    opacity: ${({ expanded, hidden }) => (hidden || !expanded ? 0 : 1)};
`;


export const SubBlock = styled(BlockBase)`
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

export const BlockTree = styled.div`
    z-index: ${({ deep }) => 1 + deep};
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
