import styled, { css } from 'styled-components';
import { rgb } from 'polished';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint, unimportant } from '~client/styled/mixins';

const columnsMobile = ['month', 'income', 'spending', 'netWorthPredicted'];

const columnsDesktop = [
    'month',
    'funds',
    'bills',
    'food',
    'general',
    'holiday',
    'social',
    'income',
    'spending',
    'net',
    'netWorthPredicted',
    'netWorth',
];

const hideColumns = ['funds', 'bills', 'food', 'general', 'holiday', 'social'];

const colSizeSmall = [...hideColumns, 'income', 'spending'];

const hideOverviewColumns = maxWidth => ({ column }) => css`
    @media only screen and (max-width: ${maxWidth}px) {
        display: ${hideColumns.includes(column) ? 'none' : 'inline-block'};
        ${column === 'income' &&
            css`
                border-left: none;
            `}
    }
`;

export const OverviewTable = styled.div`
    margin: 0;
    padding: 0;
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    overflow-y: auto;
    user-select: none;

    ${breakpoint(breakpoints.mobile)} {
        cursor: default;
        flex: 1 1 0;
        width: 100%;
        overflow-y: unset;
    }

    ${breakpoint(breakpoints.tablet)} {
        flex: 1 0 700px;
        max-width: 1024px;
        overflow-y: unset;
    }
`;

export const Rows = styled.div`
    flex: 1 1 auto;
    overflow-y: auto;

    ${breakpoint(breakpoints.mobile)} {
        overflow-y: unset;
        overflow: hidden;
    }
    ${breakpoint(breakpoints.tablet)} {
        overflow: unset;
    }
`;

export const Row = styled.div`
    display: flex;
    flex-flow: row nowrap;
    width: 100%;

    ${({ active }) =>
        active &&
        css`
            font-weight: bold;
        `}

    ${({ past }) => past && unimportant}

    ${breakpoint(breakpoints.mobile)} {
        font-size: 16px;

        ${({ active }) =>
            active &&
            css`
                font-weight: bold;
            `}
        ${({ active, future }) =>
            (active || future) &&
            css`
                font-size: 14px;
            `}
    }

    ${breakpoint(breakpoints.tablet)} {
        ${({ active, future }) =>
            (active || future) &&
            css`
                font-size: 16px;
            `}
    }
`;

export const Cell = styled.div.attrs(({ color }) => ({
    style: color ? { backgroundColor: rgb(...color) } : {},
}))`
    flex-flow: row nowrap;
    flex-grow: 1;
    flex-basis: 0;
    display: ${({ column }) => {
        if (columnsMobile.includes(column)) {
            return 'flex';
        }

        return 'none';
    }};
    padding: 4px 2px;
    position: relative;
    width: 100%;
    vertical-align: middle;
    text-align: left;
    height: 32px;
    line-height: 24px;

    ${({ active }) =>
        active &&
        css`
            font-weight: bold;
        `}}

    ${({ past, column }) =>
        past &&
        column === 'month' &&
        css`
            background: ${colors.light};
        `}

    ${({ active, column }) =>
        active &&
        column === 'month' &&
        css`
            background: ${colors.green};
            color: ${colors.white};
        `}

    ${({ future, column }) =>
        future &&
        column === 'month' &&
        css`
            background: ${colors.amber};
        `}

    ${breakpoint(breakpoints.mobileSmall)} {
        padding: 4px 10px;
        white-space: nowrap;
    }

    ${breakpoint(breakpoints.mobile)} {
        display: ${({ column }) => {
            if (columnsDesktop.includes(column)) {
                return 'flex';
            }

            return 'none';
        }};
        padding: 0 2px;
        flex-grow: ${({ column }) => {
            if (colSizeSmall.includes(column)) {
                return 7;
            }
            if (column === 'netWorthPredicted') {
                return 9;
            }
            if (column === 'netWorth') {
                return 12;
            }

            return 10;
        }};
        height: 24px;
        ${hideOverviewColumns(880)};

        ${({ past }) =>
            past &&
            css`
                height: 16px;
                line-height: 18px;
                font-size: 13px;
            `}

        ${({ active, future }) =>
            (active || future) &&
            css`
                line-height: 26px;
            `}

        ${({ column }) =>
            column === 'month' &&
            css`
                border-right: 3px solid ${colors.dark};
            `}
        ${({ column }) =>
            column === 'income' &&
            css`
                border-left: 3px solid ${colors.dark};
            `}
        ${({ column }) =>
            column === 'net' &&
            css`
                border-right: 3px solid ${colors.light};
            `}
        ${({ column }) =>
            column === 'netWorthPredicted' &&
            css`
                font-style: italic;
            `}
    }

    ${breakpoint(breakpoints.tablet)} {
        ${hideOverviewColumns(1380)};
    }
`;

export const Header = styled(Row)`
    flex: 0 0 auto;
    font-weight: bold;
`;

export const HeaderLink = styled(Cell)`
    padding: 2px 0;
    overflow: hidden;
    white-space: nowrap;
    height: 24px;
    text-align: center;
    background: ${({ column }) =>
        colors.overview[`${column}Mobile`] || colors.white};
    }};

    ${({ column }) =>
        column === 'netWorth' &&
        css`
            display: none;
        `}}

    ${breakpoint(breakpoints.mobile)} {
        padding: 2px;
    }
`;

export const HeaderText = styled.span`
    color: black;

    ${breakpoint(breakpoints.mobile)} {
        padding: 0 2px;
    }
`;
