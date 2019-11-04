import styled, { css } from 'styled-components';
import { colors } from '~client/styled/variables';
import { PageFunds } from '~client/containers/PageFunds/styles';

export const Row = styled.div`
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
