import React from 'react';
import PropTypes from 'prop-types';
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
        <Styled.FundsInfoInner>
            <Styled.Gain gain={gain} onClick={onReloadPrices}>
                <Styled.GainInfo>{'Current value:'}</Styled.GainInfo>
                <Styled.Value>{formatCurrency(value)}</Styled.Value>
                <Styled.GainPct>
                    {formatPercent(gain, { brackets: true, precision: 2 })}
                </Styled.GainPct>
                <Styled.CacheAge>({ageText})</Styled.CacheAge>
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
