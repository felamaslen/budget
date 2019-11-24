import styled from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const OverallGain = styled.a`
    ${breakpoint(breakpoints.mobile)} {
        flex: 0 0 auto;
        text-transform: none;

        background: ${({ profit, loss }) => {
            if (profit) {
                return colors['profit-light'];
            }
            if (loss) {
                return colors['loss-light'];
            }

            return 'none';
        }};
    }
`;

export const Value = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        display: inline-flex;
        margin: 0 0.5em;
    }
`;

export const GainValues = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        display: inline-flex;
    }
`;

export const GainPct = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        margin: 0 0.25em;
    }
`;

export const GainAbs = styled.span``;

export const CacheAge = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        margin: 0 0.5em;
        font-style: italic;
    }
`;
