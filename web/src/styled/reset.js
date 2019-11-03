import { css, createGlobalStyle } from 'styled-components';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

export const reset = css`
    html {
        box-sizing: border-box;
    }

    *, *::before, *::after {
        box-sizing: inherit;
    }

    html,
    body {
        ${breakpoint(breakpoints.tablet)} {
            height: 100%;
        }
    }

    body {
        margin: 0;
        font: 1em Arial, Helvetica, sans-serif;
        &.wait * {
            cursor: wait !important;
        }

        ${breakpoint(breakpoints.mobile)} {
            overflow: auto;
        }

        ${breakpoint(breakpoints.tablet)} {
            overflow: initial;
        }
    }

    ${breakpoint(breakpoints.mobile)} {
        * {
            &::-webkit-scrollbar {
                width: 0.5em;
            }
            &::-webkit-scrollbar-track {
                -webkit-box-shadow: inset 0 0 16px -4px ${colors['shadow-l3']};
            }
            &::-webkit-scrollbar-thumb {
                background-color: ${colors['shadow-l3']};
                border-radius: 0.5em;
            }
            &::-webkit-scrollbar-thumb:hover {
                background-color: ${colors['shadow-l4']};
            }
            &::-webkit-scrollbar-thumb:active {
                background-color: ${colors['shadow-l6']};
            }
        }
    }
`;

export default createGlobalStyle`${reset}`;
