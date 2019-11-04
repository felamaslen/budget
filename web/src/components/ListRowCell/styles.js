import styled, { css } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { PageFunds } from '~client/containers/PageFunds/styles';

export const Cell = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        ${PageFunds} & {
            border-bottom: 1px solid ${colors.light};
            flex: ${({ column }) => {
                if (column === 'item') {
                    return '0 1 376px';
                }
                if (column === 'transactions') {
                    return '0 1 102px';
                }

                return '0 0 auto';
            }} !important;

            ${({ column, active }) =>
                column === 'transactions' &&
                active &&
                css`
                    z-index: 12;
                `}

            ${({ column }) =>
                column === 'transactions' &&
                css`
                    text-align: center;
                `}
        }
    }
`;
