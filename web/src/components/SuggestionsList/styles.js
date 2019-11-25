import styled, { css } from 'styled-components';
import { colors, breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const Suggestions = styled.ul`
    ${breakpoint(breakpoints.mobile)} {
        margin: 0;
        padding: 0;
        position: absolute;
        width: 100%;
        z-index: 10;
        overflow: hidden;
        text-overflow: ellipsis;
        box-shadow: 0 3px 6px ${colors['shadow-l3']};
        background: ${colors['translucent-l95']};
    }
`;

export const Suggestion = styled.li`
    margin: 1px 0;
    padding: 2px;
    cursor: default;

    ${({ active }) =>
        active &&
        css`
            background: ${colors.blue};
            color: ${colors.white};
        `}
`;
