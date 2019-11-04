import styled, { css } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Graph } from '~client/components/Graph/styles';
import { Row } from '~client/components/ListRowDesktop/styles';

export const FundExtraInfo = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        display: flex;
        flex: 0 0 300px;
        flex-wrap: nowrap;
        position: relative;

        ${({ popout }) =>
            popout &&
            css`
                z-index: 10;
                overflow: visible !important;

                ${Graph} {
                    box-shadow: none;
                }
            `}

        ${({ sold }) =>
            sold &&
            css`
                &::after {
                    content: '';
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    background: ${colors['translucent-l7']};
                    z-index: 1;
                }
            `}

        ${Row}:nth-child(n + 3) & {
            height: 100%;
        }
    }
}

`;
