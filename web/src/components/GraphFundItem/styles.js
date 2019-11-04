import styled, { css } from 'styled-components';
import { colors, breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Row as ListRowDesktop } from '~client/components/ListRowDesktop/styles';

export const FundGraph = styled.div`
    display: inline-block;

    ${breakpoint(breakpoints.mobile)} {
        height: 100%;
        flex: 0 0 100px;
        z-index: 2;

        ${ListRowDesktop}
        :nth-last-child(-n + 3) & {
            svg {
                top: initial;
                bottom: 0;
            }
        }

        svg {
            ${({ popout }) =>
                popout &&
                css`
                    position: absolute;
                    background: ${colors['translucent-l8']};
                    box-shadow: 0 3px 7px ${colors['shadow-l2']};
                    width: 300px;
                    height: 120px;
                `}
        }

        ${({ sold }) =>
            sold &&
            css`
                filter: grayscale(100%);
                z-index: initial;
            `}
    }
`;
