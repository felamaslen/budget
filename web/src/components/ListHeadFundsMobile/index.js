import React, { useContext } from 'react';
import classNames from 'classnames';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { ListContext } from '~client/context';
import GraphFunds from '~client/containers/GraphFunds';

import * as Styled from './styles';

export default function ListHeadFundsMobile() {
    const {
        totalCost,
        cachedValue: { value, ageText },
        onReloadPrices,
    } = useContext(ListContext);
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
                <Styled.GainInfo className="gain-info">{'Current value:'}</Styled.GainInfo>
                <Styled.Value className="value">{formatCurrency(value)}</Styled.Value>
                <Styled.GainPct className="gain-pct">
                    {formatPercent(gain, { brackets: true, precision: 2 })}
                </Styled.GainPct>
                <Styled.CacheAge className="cache-age">({ageText})</Styled.CacheAge>
            </Styled.Gain>
            <GraphFunds isMobile={true} />
        </Styled.FundsInfoInner>
    );
}
