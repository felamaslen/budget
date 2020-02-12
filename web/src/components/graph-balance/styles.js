import styled, { css } from 'styled-components';
import { colors } from '~client/styled/variables';

export const ShowAll = styled.span`
    position: absolute;
    right: 0;
    top: 0;
    font-size: 0.9em;
    line-height: 20px;
    padding: 0.1em 0.2em;
    background: ${colors['translucent-l4']};
    cursor: pointer;
    user-select: none;
    span {
        vertical-align: middle;
    }
`;

export const CheckBox = styled.a`
    width: 20px;
    height: 20px;
    float: left;
    position: relative;
    &:before {
        left: 4px;
        top: 4px;
        width: 12px;
        height: 12px;
        box-shadow: 0 0 0 1px black;
    }
    &:after {
        left: 7px;
        top: 7px;
        width: 6px;
        height: 6px;
        ${({ enabled }) =>
            enabled &&
            css`
                background: black;
            `}
    }
    &:before,
    &:after {
        content: '';
        position: absolute;
        border-radius: 100%;
    }
`;
