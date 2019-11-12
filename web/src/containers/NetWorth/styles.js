import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { colors } from '~client/styled/variables';

export const NetWorth = styled.div`
    display: flex;
    flex-flow: column;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    max-height: 90%;
    background: ${colors['shadow-l4']};
    box-shadow: 0 2px 6px ${colors['shadow-l4']};
    border-width: 2px 10px 0 10px;
    z-index: 100;
    opacity: ${({ visible }) => (visible ? 1 : 0)};
    transition: opacity 0.3s ease-out;
`;

export const TabBar = styled.div`
    display: flex;
    padding: 0 5px;
    flex: 0 0 22px;
    width: 100%;
`;

export const Tab = styled(NavLink)`
    display: inline-flex;
    align-items: center;
    margin: 0 5px;
    padding: 0 10px;
    line-height: 22px;
    background: ${colors['shadow-l4']};
    color: ${colors.white};
    text-decoration: none;
    border-radius: 0 0 6px 6px;

    ${({ isButton }) =>
        isButton &&
        css`
            &:hover,
            &:active {
                background: ${colors.black};
            }
            &.selected {
                background: ${colors['shadow-l2']};
                color: ${colors['slightly-light']};
                cursor: default;
            }
        `}
`;

export const Meta = styled.div`
    display: flex;
    flex: 0 0 24px;
    align-items: center;
    justify-content: center;
    position: relative;
    background: ${colors['shadow-l4']};
    color: ${colors.white};
`;

export const Title = styled.h2`
    margin: 0 5px;
    font-size: 16px;
    font-weight: bold;
`;

export const BackButton = styled.a`
    display: block;
    position: absolute;
    right: 4px;
    width: 20px;
    height: 20px;
    text-align: center;
    font-size: 25px;
    line-height: 20px;
    text-decoration: none;
    color: black;
    background: rgba(190, 10, 10, 0.8);
    color: ${colors.white};
    cursor: pointer;
`;
