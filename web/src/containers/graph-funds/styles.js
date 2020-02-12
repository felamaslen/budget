import styled, { css } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const GraphFunds = styled.div``;

export const FundSidebar = styled.ul`
    margin: 0;
    padding: 0;
    position: absolute;
    left: 0;
    top: 0;
    list-style: none;
    width: 10%;
    height: 100%;
    background: linear-gradient(to bottom, ${colors['translucent-dark']}, transparent);
    z-index: 3;
    transition: 0.3s width ease-in-out;
    user-select: none;
    &:hover {
        width: 40%;
    }
    li {
        line-height: 20px;
        height: 20px;
        width: 100%;
        cursor: default;
        font-size: 0.8em;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    ${breakpoint(breakpoints.mobile)} {
        overflow-y: auto;
    }
`;

export const Mode = styled.span`
    position: absolute;
    top: 0.2em;
    left: 0.2em;

    ${breakpoint(breakpoints.mobile)} {
        left: initial;
        right: 0.2em;
    }
`;

export const SidebarCheckbox = styled.span`
    display: inline-block;
    position: absolute;
    top: 5px;
    left: 1px;
    width: 0;
    height: 0;
    border: 5px solid black;

    ${({ checked }) =>
        !checked &&
        css`
            border-width: 2px;
            width: 10px;
            height: 10px;
        `}
`;

export const SidebarFund = styled.span`
    padding-left: 12px;
`;
