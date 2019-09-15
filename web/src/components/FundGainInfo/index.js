import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { gainShape } from '~client/prop-types/page/funds';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { rgba } from '~client/modules/color';

const formatOptions = {
    brackets: true, abbreviate: true, precision: 1, noPence: true,
};
const formatOptionsPct = { brackets: true, precision: 2 };

const profitLossClass = (value) => ({
    profit: value >= 0,
    loss: value < 0,
});

export default function FundGainInfo({
    gain: {
        color, value, gainAbs, gain, dayGainAbs, dayGain,
    },
    sold,
}) {
    if (!gain) {
        return null;
    }

    const gainStyle = { backgroundColor: rgba(color) };

    return (
        <span className="fund-extra-info-gain">
            <span className={classNames('text', profitLossClass(gain))} style={gainStyle}>
                <span className="value">
                    {formatCurrency(value, formatOptions)}
                </span>
                <span className={classNames('breakdown', { sold })}>
                    <span className="overall">
                        <span className={classNames('gain-abs', profitLossClass(gainAbs))}>
                            {formatCurrency(gainAbs, formatOptions)}
                        </span>
                        <span className={classNames('gain', profitLossClass(gain))}>
                            {formatPercent(gain, formatOptionsPct)}
                        </span>
                    </span>
                    {!sold && (
                        <span className="day-gain-outer">
                            <span className={classNames('day-gain-abs', profitLossClass(dayGainAbs))}>
                                {formatCurrency(dayGainAbs, formatOptions)}
                            </span>
                            <span className={classNames('day-gain', profitLossClass(dayGain))}>
                                {formatPercent(dayGain, formatOptionsPct)}
                            </span>
                        </span>
                    )}
                </span>
            </span>
        </span>
    );
}

FundGainInfo.propTypes = {
    gain: gainShape,
    sold: PropTypes.bool,
};
