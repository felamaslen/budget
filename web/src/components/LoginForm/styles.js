import styled, { css } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { Button } from '~client/styled/shared/button';
import { breakpoint } from '~client/styled/mixins';

export const NumberInputPad = styled.div`
    display: grid;
    padding: 0 6px 12px 6px;
    grid-template-rows: auto auto auto auto;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 12px;
    height: 170px;
    background: ${colors['medium-dark']};
    box-shadow: inset 0 0 13px ${colors['shadow-l5']};

    user-select: none;
    ${breakpoint(breakpoints.mobile)} {
        height: 280px;
    }
`;

export const NumberInputRow = styled.div`
    display: grid;
    grid-template-columns: inherit;
    grid-column: 1 / span 3;
    grid-gap: 6px;
    &:nth-child(1) {
        grid-row: 1;
    }
    &:nth-child(2) {
        grid-row: 2;
    }
    &:nth-child(3) {
        grid-row: 3;
    }
    &:nth-child(4) {
        grid-row: 4;
    }
`;

export const Digit = styled(Button)`
    display: block;
    margin: 0;
    padding: 0;
    height: 100%;
    grid-column: ${({ digit }) => {
        if (digit === 0) {
            return 2;
        }

        return 1 + ((digit - 1) % 3);
    }};
    background-color: ${colors['medium-light']} !important;
    background-image: linear-gradient(167deg, ${colors['translucent-l1']} 50%, transparent 55%),
        linear-gradient(to bottom, ${colors['translucent-l15']}, transparent) !important;
    box-shadow: inset 0 0 0 1px ${colors['medium-light']},
        inset 0 0 0 2px ${colors['translucent-l15']}, 0 8px 0 0 ${colors.medium},
        0 8px 0 1px ${colors['shadow-l4']}, 0 8px 8px 1px ${colors['shadow-l5']} !important;
    color: ${colors.white};
    border: none;
    border-radius: 5px;
    font-family: 'Lucida Grande', Arial, sans-serif;
    font-size: 22px;
    font-weight: bold;
    letter-spacing: -1px;
    position: relative;
    text-shadow: 0 1px 1px ${colors['shadow-l5']};
    transition: all linear 0.05s;

    &:active {
        box-shadow: inset 0 0 0 1px ${colors.medium}, inset 0 0 0 2px ${colors['translucent-l15']},
            0 0 0 1px ${colors['shadow-l4']};
        transform: translateY(10px);
    }

    ${breakpoint(breakpoints.mobile)} {
        height: 90%;
        font-size: 40px;
    }
`;

export const PinDisplay = styled.div`
    display: flex;
    flex-flow: row nowrap;
    margin-bottom: 10px;
    ${breakpoint(breakpoints.mobile)} {
        margin: 0 12px 16px 12px;
    }
`;

export const InputPin = styled.div`
    flex-grow: 1;
    font-size: 64px;
    height: 60px;
    margin: 0 6px;
    position: relative;
    border: none;
    border-radius: 4px;
    background-color: ${({ active }) => (active ? colors['very-light'] : colors['slightly-dark'])};
    color: transparent;
    text-align: center;
    outline: none;
    transition: background-color linear 0.1s;

    ${({ done }) =>
        done &&
        css`
            &::after {
                content: '';
                width: 16px;
                height: 16px;
                background: ${colors['very-light']};
                border-radius: 16px;
                position: absolute;
                left: 50%;
                top: 50%;
                margin-left: -8px;
                margin-top: -8px;
            }
        `}

    ${breakpoint(breakpoints.mobile)} {
        height: 80px;
    }
`;
