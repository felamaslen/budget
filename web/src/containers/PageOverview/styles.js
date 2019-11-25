import styled from 'styled-components';
import { breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Page as PageBase } from '~client/styled/shared/page';

export const Page = styled(PageBase)`
    ${breakpoint(breakpoints.mobileSmall)} {
        display: flex;
        flex: 1 1 0;
        overflow-y: auto;
        overflow-x: hidden;
    }
    ${breakpoint(breakpoints.tablet)} {
        flex-flow: row;
        position: relative;
    }
`;
