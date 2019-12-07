import { createGlobalStyle, css } from 'styled-components';
import { rgba } from 'polished';
import { breakpoint, rem } from '~/styled/mixins';
import { breakpoints } from '~/styled/variables';

const reset = css`
  html {
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
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
    font: 1em 'Noto sans', Ubuntu, Arial, Helvetica, sans-serif;
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
        width: ${rem(8)};
      }
      &::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 16px -4px ${rgba(0, 0, 0, 0.3)};
      }
      &::-webkit-scrollbar-thumb {
        background-color: ${rgba(0, 0, 0, 0.3)};
        border-radius: ${rem(8)};
      }
      &::-webkit-scrollbar-thumb:hover {
        background-color: ${rgba(0, 0, 0, 0.4)};
      }
      &::-webkit-scrollbar-thumb:active {
        background-color: ${rgba(0, 0, 0, 0.6)};
      }
    }
  }
`;

export default createGlobalStyle`${reset}`;
