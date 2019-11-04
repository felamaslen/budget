import styled, { css } from 'styled-components';
import { rgb } from 'polished';
import {
    breakpoints,
    upArrow,
    downArrow,
    colors,
} from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

import { Row as ListRowDesktop } from '~client/components/ListRowDesktop/styles';

const Column = styled.span`
    display: flex;
    flex: 1 0 0;
    flex-flow: column;
`;

export const Value = styled.span`
    width: 68px;
    text-align: left;
    flex: 1 1 0;
    font-weight: bold;
    font-size: 1.1em;
    color: ${colors['slightly-dark']};
`;

export const Breakdown = styled.span`
    display: flex;
    flex: 2 1 0;
`;
export const Overall = styled(Column)`
    font-weight: bold;
    flex-flow: ${({ sold }) => (sold ? 'row' : 'column')};
`;

export const DayGainOuter = styled(Column)``;

const BreakdownValue = styled.span`
    flex: 1 0 0;
    font-size: 0.8em;
    line-height: 24px;
    height: 24px;
    background: ${colors['translucent-l8']};
`;

const BreakdownAbs = styled(BreakdownValue)`
    &::before {
        content: ${({ gain }) => (gain >= 0 ? upArrow : downArrow)};
        font-style: normal;
        font-weight: normal;
        margin-right: 0.2em;
    }
`;

export const GainAbs = styled(BreakdownAbs)``;
export const Gain = styled(BreakdownValue)``;
export const DayGainAbs = styled(BreakdownAbs)``;
export const DayGain = styled(BreakdownValue)``;

export const Text = styled.span.attrs(({ color }) => ({
    style: { backgroundColor: rgb(...color) },
}))`
    padding: 0;
    height: 100%;
    ${breakpoint(breakpoints.mobile)} {
        background: ${colors['medium-slightly-dark']};
        & > span {
            float: left;
            padding: 0 1px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
        }
        ${ListRowDesktop} & {
            display: flex;
            margin-right: 0;
            padding: 0;
            width: 100%;
            & > span {
                padding: 0;
            }
        }
    }
`;

export const FundGainInfo = styled.span`
    flex: 0 0 200px;
    z-index: 1;
    color: ${({ gain }) => (gain >= 0 ? colors.profit : colors.loss)};

    ${breakpoint(breakpoints.mobile)} {
        display: flex;

        ${({ sold }) =>
            sold &&
            css`
                font-style: italic;

                ${Value},
                ${Overall} {
                    font-weight: normal;
                }
            `}
    }
}
`;
