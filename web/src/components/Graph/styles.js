import styled from 'styled-components';

import { breakpoints, colors, graphFundsHeightMobile } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { FundGraph } from '~client/components/GraphFundItem/styles';
import { GraphFunds } from '~client/containers/GraphFunds/styles';

export const Graph = styled.div`
    width: 100%;
    position: relative;
    z-index: 2;

    ${GraphFunds} & {
        position: relative;
        height: ${graphFundsHeightMobile}px;

        ${breakpoint(breakpoints.mobile)} {
            margin: 10px;
            height: 300px;
        }
    }

    ${breakpoint(breakpoints.mobile)} {
        display: inline-block;
        position: static;
        width: ${({ width = 500 }) => width}px;
        height: ${({ height = 300 }) => height}px;
        background: ${colors['translucent-heavy']};
        box-shadow: 0 3px 10px ${colors['shadow-l3']};

        ${FundGraph} & {
            z-index: 10;
            width: 100px;
            height: 100%;
            position: static;
            background: transparent;
            box-shadow: none;
        }
    }
    ${breakpoint(breakpoints.tablet)} {
        display: block;
    }
`;

export const GraphOuter = styled.div`
    ${Graph} {
        overflow: hidden;
    }

    ${breakpoint(breakpoints.mobile)} {
        display: flex;
        width: 100%;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-evenly;

        ${Graph} {
            position: relative;
            overflow: hidden;
        }
    }

    ${breakpoint(breakpoints.tablet)} {
    }
`;
