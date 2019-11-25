import styled from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const Title = styled.h3`
    margin: 0;
    height: 48px;
    line-height: 48px;
    font-size: 24px;
    text-align: center;
    color: ${colors['very-light']};

    ${breakpoint(breakpoints.mobile)} {
        height: 60px;
        line-height: 60px;
    }
`;

export const Form = styled.div`
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
`;

export const FormInner = styled.div`
    width: 240px;
    height: 300px;
    background: ${colors['very-dark']};
    border-radius: 4px;
    box-shadow: 0 26px 90px ${colors['shadow-l8']};

    ${breakpoint(breakpoints.mobile)} {
        width: 300px;
        height: 450px;
    }
`;
