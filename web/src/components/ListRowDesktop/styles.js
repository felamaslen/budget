import styled, { css } from 'styled-components';
import {
    breakpoints,
    colors,
    itemHeightDesktop,
    itemHeightDesktopFunds,
} from '~client/styled/variables';
import { breakpoint, unimportant } from '~client/styled/mixins';
import { CrudList } from '~client/components/CrudList/styles';
import { PageList } from '~client/containers/PageList/styles';
import { PageFunds } from '~client/containers/PageFunds/styles';

export const RowBase = styled.div``;

const align = ({ column }) => {
    if (['value', 'cost', 'daily'].includes(column)) {
        return 'right';
    }

    return 'left';
};

export const Column = styled.span`
    flex: 0 0
        ${({ column }) => {
            if (['date', 'value', 'cost'].includes(column)) {
                return '96px';
            }
            if (['item', 'category', 'society', 'holiday'].includes(column)) {
                return '192px';
            }
            if (column === 'shop') {
                return '128px';
            }
            if (column === 'daily') {
                return '86px';
            }

            return 'auto';
        }};
    justify-content: ${align};
    text-align: ${align};
`;

export const Row = styled(RowBase)`
    ${breakpoint(breakpoints.mobile)} {
        display: flex;
        margin: 0;
        padding: 0;
        flex: 0 0 ${itemHeightDesktop}px;
        line-height: ${itemHeightDesktop}px;
        height: ${itemHeightDesktop}px;
        width: 100%;

        ${PageFunds} & {
            padding: 0;
            border-right: 1px solid ${colors.light};
            background: ${colors.white} !important;
        }
    }
`;

export const RowBody = styled(Row)`
    ${breakpoint(breakpoints.mobile)} {
        ${PageList} & {
            ${({ odd }) =>
                odd &&
                css`
                    background: ${colors['translucent-dark']};
                `}

            ${({ future }) => future && unimportant}

            ${({ firstPresent }) =>
                firstPresent &&
                css`
                    &:not(:first-child) {
                        border-top: 1px solid ${colors['medium-slightly-dark']};
                    }
                `}
        }

        ${PageFunds} & {
            ${({ small }) =>
                !small &&
                css`
                    flex: 0 0 ${itemHeightDesktopFunds}px;
                    line-height: ${itemHeightDesktopFunds}px;
                    height: ${itemHeightDesktopFunds}px;
                `}
        }
    }
`;

export const ButtonDelete = styled.div`
    display: block;
    ${CrudList} & {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    ${breakpoint(breakpoints.mobile)} {
        ${PageFunds} & {
            flex: 1;
        }
    }
`;
