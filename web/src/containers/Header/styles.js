import styled from 'styled-components';
import { breakpoints, sizes, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const Header = styled.header`
    display: flex;
    flex: 0 0 ${sizes.navbarHeightMobile}px;
    flex-flow: column;
    z-index: 10;
    color: ${colors.white};
    background: ${colors.white};

    ${breakpoint(breakpoints.mobile)} {
        flex: 0 0 ${sizes.navbarHeight}px;
        flex-flow: row-reverse;
        justify-content: space-between;
        background: linear-gradient(
            to bottom,
            ${colors.primary},
            ${colors.primaryDark}
        );
        box-shadow: 0 0 6px ${colors['shadow-l6']};
    }
`;
