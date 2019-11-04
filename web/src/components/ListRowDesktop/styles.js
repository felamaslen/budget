import styled, { css } from 'styled-components';
import {
    breakpoints,
    colors,
    itemHeightDesktopFunds,
} from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { PageFunds } from '~client/containers/PageFunds/styles';

export const Row = styled.div`
    ${breakpoint(breakpoints.mobile)} {
        ${PageFunds} & {
            padding: 0;
            border-right: 1px solid ${colors.light};
            background: ${colors.white} !important;
        }
    }
`;

export const RowBody = styled(Row)`
    ${breakpoint(breakpoints.mobile)} {
        ${PageFunds} & {
            ${({ small }) =>
                !small &&
                css`
                    flex: 0 0 ${itemHeightDesktopFunds}px !important;
                    line-height: ${itemHeightDesktopFunds}px !important;
                    height: ${itemHeightDesktopFunds}px !important;
                `}
        }
    }
`;

export const ButtonDelete = styled.div`
    ${breakpoint(breakpoints.mobile)} {
        ${PageFunds} & {
            flex: 1;
        }
    }
`;
