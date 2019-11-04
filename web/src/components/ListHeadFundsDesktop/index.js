import React from 'react';
import PropTypes from 'prop-types';

import { cachedValueShape } from '~client/prop-types/page/funds';
import { formatCurrency, formatPercent } from '~client/modules/format';

import * as Styled from './styles';

const formatOptions = { brackets: true, precision: 2 };

const ListHeadFundsDesktop = ({
    totalCost,
    viewSoldFunds,
    cachedValue: { value, ageText },
    onReloadPrices,
    onViewSoldToggle,
}) => (
    <>
        <Styled.OverallGain
            profit={value > totalCost}
            loss={value < totalCost}
            onClick={onReloadPrices}
        >
            <Styled.Value>{formatCurrency(value)}</Styled.Value>
            {totalCost && (
                <Styled.GainValues>
                    <Styled.GainPct>
                        {formatPercent(
                            (value - totalCost) / totalCost,
                            formatOptions,
                        )}
                    </Styled.GainPct>
                    <Styled.GainAbs>
                        {formatCurrency(value - totalCost, formatOptions)}
                    </Styled.GainAbs>
                </Styled.GainValues>
            )}
            <Styled.CacheAge>({ageText})</Styled.CacheAge>
        </Styled.OverallGain>
        <span>
            <input
                type="checkbox"
                checked={viewSoldFunds}
                onChange={onViewSoldToggle}
            />
            <span>{'View sold'}</span>
        </span>
    </>
);

ListHeadFundsDesktop.propTypes = {
    totalCost: PropTypes.number.isRequired,
    viewSoldFunds: PropTypes.bool,
    period: PropTypes.string.isRequired,
    cachedValue: cachedValueShape.isRequired,
    onViewSoldToggle: PropTypes.func.isRequired,
    onReloadPrices: PropTypes.func.isRequired,
};

export default ListHeadFundsDesktop;
