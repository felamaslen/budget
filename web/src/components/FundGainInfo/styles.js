import styled, { css } from 'styled-components';
import { rgb, desaturate } from 'polished';
import {
    breakpoints,
    upArrow,
    upArrowStrong,
    downArrow,
    downArrowStrong,
    colors,
} from '~client/styled/variables';
import { breakpoint, rem } from '~client/styled/mixins';
import { InlineFlex } from '~client/styled/shared/layout';
import { Row as ListRowDesktop } from '~client/components/ListRowDesktop/styles';

const profitColor = (postProcess = value => value) => ({ gain }) =>
    postProcess(gain >= 0 ? colors.profit : colors.loss);

const Column = styled.span`
    display: flex;
    flex: 1 0 0;
    flex-flow: column;
    overflow: visible;
    text-overflow: none;
`;

export const Value = styled.span`
    width: 68px;
    text-align: left;
    flex: 1 1 0;
    font-weight: bold;
    font-size: ${rem(18)};
    color: ${colors['slightly-dark']};
    overflow: visible !important;
`;

export const Breakdown = styled(InlineFlex)`
    flex: 2 1 0;
`;
export const Overall = styled(Column)`
    font-weight: bold;
    flex-flow: ${({ sold }) => (sold ? 'row' : 'column')};
`;

export const DayGainOuter = styled(Column)``;

const BreakdownValue = styled.span`
    color: ${profitColor()};
    flex: 1 0 0;
    font-size: ${rem(13)};
    line-height: 24px;
    height: 24px;
    background: ${colors['translucent-l6']};
`;

const BreakdownAbs = styled(BreakdownValue)`
    &::before {
        content: ${({ gain }) => {
            if (gain >= 0.1) {
                return upArrowStrong;
            }
            if (gain >= 0) {
                return upArrow;
            }
            if (gain > -0.05) {
                return downArrow;
            }

            return downArrowStrong;
        }};
        font-style: normal;
        margin-right: 0.2em;
    }
`;

export const GainAbs = styled(BreakdownAbs)``;
export const Gain = styled(BreakdownValue)``;

const breakdownDay = css`
    color: ${profitColor(desaturate(0.5))};
`;

export const DayGainAbs = styled(BreakdownAbs)`
    ${breakdownDay};
`;
export const DayGain = styled(BreakdownValue)`
    ${breakdownDay};
`;

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
    color: ${profitColor()};

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
