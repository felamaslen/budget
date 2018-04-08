import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatCurrency, formatPercent } from '../../helpers/format';
import { rgba } from '../../helpers/color';

export default function FundGainInfo({ gain }) {
    if (!gain) {
        return null;
    }

    const formatOptions = { brackets: true, abbreviate: true, precision: 1, noPence: true };
    const formatOptionsPct = { brackets: true, precision: 2 };

    const gainStyle = { backgroundColor: rgba(gain.get('color')) };

    const gainSpanClasses = (spanName, key = spanName) => classNames(spanName, {
        profit: gain.get(key) >= 0,
        loss: gain.get(key) < 0
    });

    const gainOuterClasses = gainSpanClasses('text', 'gain');
    const gainClasses = gainSpanClasses('gain');
    const gainAbsClasses = gainSpanClasses('gain-abs', 'gainAbs');
    const dayGainClasses = gainSpanClasses('day-gain', 'dayGain');
    const dayGainAbsClasses = gainSpanClasses('day-gain-abs', 'dayGainAbs');

    return <span className="gain">
        <span className={gainOuterClasses} style={gainStyle}>
            <span className="value">
                {formatCurrency(gain.get('value'), formatOptions)}
            </span>
            <span className="breakdown">
                <span className={gainAbsClasses}>
                    {formatCurrency(gain.get('gainAbs'), formatOptions)}
                </span>
                <span className={dayGainAbsClasses}>
                    {formatCurrency(gain.get('dayGainAbs'), formatOptions)}
                </span>
                <span className={gainClasses}>
                    {formatPercent(gain.get('gain'), formatOptionsPct)}
                </span>
                <span className={dayGainClasses}>
                    {formatPercent(gain.get('dayGain'), formatOptionsPct)}
                </span>
            </span>
        </span>
    </span>;
}

FundGainInfo.propTypes = {
    gain: PropTypes.instanceOf(map)
};
