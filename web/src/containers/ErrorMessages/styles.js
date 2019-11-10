import styled, { css } from 'styled-components';
import { colors, sizes } from '~client/styled/variables';

export const MessageList = styled.ul`
    margin: 1em;
    z-index: 1001;
    position: fixed;
    top: ${sizes.navbarHeight}px;
    right: 0;
`;

export const Message = styled.li`
    margin-top: 0.5em;
    font-style: italic;
    font-size: 0.9em;
    cursor: pointer;
    border-radius: 0.3em;
    box-shadow: 0 3px 6px ${colors['shadow-l3']};
    height: 3em;
    background: ${({ level }) => colors.messages[level] || 'none'};
    overflow: hidden;
    transition: 0.8s ease-in-out;

    span {
        line-height: 3em;
        padding: 1em 2em;
        white-space: nowrap;
        max-width: 400px;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    ${({ closed }) =>
        closed &&
        css`
            margin: 0;
            opacity: 0;
            height: 0;
        `}
    }};
`;
