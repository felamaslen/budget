import React from 'react';
import PropTypes from 'prop-types';

import { gainShape } from '~client/prop-types/page/funds';
import { formatCurrency, formatPercent } from '~client/modules/format';

import * as Styled from './styles';

export const formatOptions = {
    brackets: true,
    abbreviate: true,
    precision: 1,
    noPence: true,
};
export const formatOptionsPct = { brackets: true, precision: 2 };

export default function FundGainInfo({
    gain: { color, value, gainAbs, gain, dayGainAbs, dayGain },
    sold,
}) {
    if (!gain) {
        return null;
    }

    return (
        <Styled.FundGainInfo gain={gain} sold={sold}>
            <Styled.Text gain={gain} color={color}>
                <Styled.Value>{formatCurrency(value, formatOptions)}</Styled.Value>
                <Styled.Breakdown>
                    <Styled.Overall sold={sold}>
                        <Styled.GainAbs gain={gain}>
                            {formatCurrency(gainAbs, formatOptions)}
                        </Styled.GainAbs>
                        <Styled.Gain gain={gain}>
                            {formatPercent(gain, formatOptionsPct)}
                        </Styled.Gain>
                    </Styled.Overall>
                    {!sold && (
                        <Styled.DayGainOuter>
                            <Styled.DayGainAbs gain={dayGain}>
                                {formatCurrency(dayGainAbs, formatOptions)}
                            </Styled.DayGainAbs>
                            <Styled.DayGain gain={dayGain}>
                                {formatPercent(dayGain, formatOptionsPct)}
                            </Styled.DayGain>
                        </Styled.DayGainOuter>
                    )}
                </Styled.Breakdown>
            </Styled.Text>
        </Styled.FundGainInfo>
    );
}

FundGainInfo.propTypes = {
    gain: gainShape,
    sold: PropTypes.bool,
};
