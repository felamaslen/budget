import styled from 'styled-components';
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

const Sized = styled.div.attrs(({ width, height }) => ({
    style: {
        width,
        height,
    },
}))`;
    float: left;
`;

export const BlockGroup = styled(Sized)`
    display: inline-block;
`;

const BlockBase = styled(Sized)`
    position: relative;

    ${({ active }) => active && `background: ${colors.highlight}`};
`;

export const Block = styled(BlockBase).attrs(({ width, height, ...props }) => ({
    style: {
        width,
        height,
        backgroundColor: getBlockColor(props),
    },
}))`
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

export const SubBlock = styled(BlockBase)`
    transition: opacity 0.1s linear;
    opacity: 1;
    box-shadow: inset -1px -1px 13px ${colors['shadow-l4']};
    background-image: linear-gradient(
        to bottom right,
        ${colors['translucent-l6']},
        ${colors['shadow-l3']}
    );

    ${({ hidden }) => hidden && 'opacity: 0'};
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
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    box-shadow: 0 3px 13px ${colors['shadow-l6']};

/*
    ${({ deep }) => (
        deep
            ? `
                width: 100%;
                height: 100%;
            `
            : `
                ${Block} {
                    transition: opacity 0.1s linear;
                    opacity: 1;
                    box-shadow: inset -1px -1px 13px ${colors['shadow-l4']};
                }
            `
    )}

    ${({ expanded }) => expanded && `
        ${BlockGroup} {
            opacity: 0; // for the expansion animation
        }
`}

    .preview {
        position: absolute;
        z-index: 5;
    }
    */
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
