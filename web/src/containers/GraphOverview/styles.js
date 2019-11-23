import styled from 'styled-components';
import { breakpoints, colors, graphOverviewHeightMobile } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const GraphOverview = styled.div`
    flex: 0 0 auto;
    height: ${graphOverviewHeightMobile}px;
    box-shadow: 0 -2px 6px ${colors['shadow-l3']};
    z-index: 10;

    ${breakpoint(breakpoints.mobile)} {
        display: flex;
        flex: 0 0 300px;
        height: 300px;
    }
    ${breakpoint(breakpoints.tablet)} {
        flex: 0 1 520px !important;
        justify-content: center !important;
        align-items: center !important;
        overflow-y: auto !important;
        height: auto !important;
        max-height: 640px !important;
    }
`;
