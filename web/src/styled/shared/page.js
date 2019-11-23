import styled from 'styled-components';
import { breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const PageWrapper = styled.div`
    display: flex;
    flex: 1 0 0;
    width: 100%;
    min-height: 0;

    & > div {
        // route
        display: flex;
        flex-flow: column;
        width: 100%;
        position: relative;
    }

    ${breakpoint(breakpoints.mobile)} {
        margin: 0 auto;
        position: relative;
    }
    ${breakpoint(breakpoints.tablet)} {
        margin: initial;
        position: static;
    }
`;

export const Page = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    width: 100%;
`;

export const Main = styled.div`
    display: flex;
    flex-flow: column;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
`;
