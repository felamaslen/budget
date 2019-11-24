import styled, { css } from 'styled-components';
import { colors, itemHeightMobile } from '~client/styled/variables';
import { PageFunds } from '~client/containers/PageFunds/styles';

export const Row = styled.div`
    display: flex;
    flex-flow: row nowrap;
    flex: 0 0 ${itemHeightMobile}px;
    line-height: ${itemHeightMobile}px;

    ${PageFunds} & {
        margin: 0;
        padding: 4px 0 1px;

        ${({ small }) =>
            small &&
            css`
                padding: 0;
                font-size: 90%;
                color: ${colors['medium-light']};
                background: ${colors['shadow-l05']};
            `}
    }
`;

export const Column = styled.span`
    flex-grow: ${({ column }) => {
        if (['date', 'cost'].includes(column)) {
            return 4;
        }
        if (column === 'item') {
            return 7;
        }

        return 1;
    }};
    flex-basis: 0;
    min-width: 0;
    white-space: nowrap;
    margin: 0 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    text-transform: capitalize;

    ${PageFunds} & {
        ${({ column }) =>
            column === 'item' &&
            css`
                display: block;
                flex: 1 1 auto;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `}
    }
`;
