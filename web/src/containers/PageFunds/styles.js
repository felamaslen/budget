import styled from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Page } from '~client/styled/shared/page';

export const FundsInfo = styled.div`
    background: ${colors['translucent-l2']};

    ${breakpoint(breakpoints.mobile)} {
        flex: 1 0 auto;
    }
`;

export const PageFunds = styled(Page)`
    flex-direction: column-reverse;
    flex: 1 0 0;

    ${breakpoint(breakpoints.mobile)} {
        flex-direction: column;
        overflow-y: auto;
    }
    ${breakpoint(1325)} {
        flex-direction: row;
    }
`;
