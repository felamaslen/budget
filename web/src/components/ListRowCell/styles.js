import styled, { css } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { PageFunds } from '~client/containers/PageFunds/styles';
import { Column } from '~client/components/ListRowDesktop/styles';

export const Cell = styled(Column)`
    ${breakpoint(breakpoints.mobile)} {
        display: inline-flex;
        text-overflow: ellipsis;
        vertical-align: top;
        height: inherit;
        overflow: hidden;

        ${({ active }) =>
            active &&
            css`
                overflow: visible;
            `}

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
