import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { formatCurrency, formatPercent } from '~client/modules/format';
import { ListContext } from '~client/context';

import * as Styled from './styles';

const formatOptions = { brackets: true, precision: 2 };

const ListHeadFundsDesktop = () => {
    const {
        totalCost,
        viewSoldFunds,
        cachedValue: { value, ageText },
        onReloadPrices,
        onViewSoldToggle,
    } = useContext(ListContext);

    return (
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
                            {formatPercent((value - totalCost) / totalCost, formatOptions)}
                        </Styled.GainPct>
                        <Styled.GainAbs>
                            {formatCurrency(value - totalCost, formatOptions)}
                        </Styled.GainAbs>
                    </Styled.GainValues>
                )}
                <Styled.CacheAge>({ageText})</Styled.CacheAge>
            </Styled.OverallGain>
            <span>
                <input type="checkbox" checked={viewSoldFunds} onChange={onViewSoldToggle} />
                <span>{'View sold'}</span>
            </span>
        </>
    );
};

ListHeadFundsDesktop.propTypes = {
    totalCost: PropTypes.number.isRequired,
};

export default ListHeadFundsDesktop;
