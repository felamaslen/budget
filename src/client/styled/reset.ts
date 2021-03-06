import { css } from '@emotion/react';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

export const fontFamily = `'Noto sans', Ubuntu, Arial, Helvetica, sans-serif`;

export const reset = css`
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
    font: 1em ${fontFamily};
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
    input,
    select,
    option {
      &:focus {
        outline: 1px solid ${colors.blue};
      }
    }

    * {
      &::-webkit-scrollbar {
        width: ${rem(8)};
      }
      &::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 16px -4px ${colors.shadow.light};
      }
      &::-webkit-scrollbar-thumb {
        background-color: ${colors.shadow.light};
        border-radius: ${rem(8)};
      }
      &::-webkit-scrollbar-thumb:hover {
        background-color: ${colors.shadow.mediumLight};
      }
      &::-webkit-scrollbar-thumb:active {
        background-color: ${colors.shadow.mediumDark};
      }
    }
  }
`;
