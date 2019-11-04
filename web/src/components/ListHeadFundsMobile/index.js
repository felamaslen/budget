import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { cachedValueShape } from '~client/prop-types/page/funds';
import { formatCurrency, formatPercent } from '~client/modules/format';
import GraphFunds from '~client/containers/GraphFunds';

import * as Styled from './styles';

export default function ListHeadFundsMobile({
    totalCost,
    cachedValue: { value, ageText },
    onReloadPrices,
}) {
    const gain = totalCost ? (value - totalCost) / totalCost : 0;

    return (
        <Styled.FundsInfoInner className="funds-info-inner">
            <Styled.Gain
                gain={gain}
                className={classNames('gain', {
                    profit: gain > 0,
                    loss: gain < 0,
                })}
                onClick={onReloadPrices}
            >
                <Styled.GainInfo className="gain-info">
                    {'Current value:'}
                </Styled.GainInfo>
                <Styled.Value className="value">
                    {formatCurrency(value)}
                </Styled.Value>
                <Styled.GainPct className="gain-pct">
                    {formatPercent(gain, { brackets: true, precision: 2 })}
                </Styled.GainPct>
                <Styled.CacheAge className="cache-age">
                    ({ageText})
                </Styled.CacheAge>
            </Styled.Gain>
            <GraphFunds isMobile={true} />
        </Styled.FundsInfoInner>
    );
}

ListHeadFundsMobile.propTypes = {
    totalCost: PropTypes.number.isRequired,
    cachedValue: cachedValueShape.isRequired,
    onReloadPrices: PropTypes.func.isRequired,
};
