import React from 'react';
import PropTypes from 'prop-types';

import { cachedValueShape } from '~client/prop-types/page/funds';
import { formatCurrency, formatPercent } from '~client/modules/format';
import GraphFunds from '~client/containers/GraphFunds';
import * as Styled from './styles';
import { DesktopOnly, MobileOnly } from '~client/styled/shared/layout';
import { formatOptions, formatOptionsPct } from '~client/components/FundGainInfo';

const ListHeadFunds = ({
    totalCost,
    viewSoldFunds,
    cachedValue: { value, ageText, dayGain, dayGainAbs },
    showGraph,
    onReloadPrices,
    onViewSoldToggle,
}) => (
    <Styled.ListHeadFunds title={ageText}>
        <Styled.OverallGain
            as="a"
            profit={value > totalCost}
            loss={value < totalCost}
            onClick={onReloadPrices}
        >
            <Styled.Value>
                <DesktopOnly>{formatCurrency(value, formatOptions)}</DesktopOnly>
                <MobileOnly>{formatCurrency(value)}</MobileOnly>
            </Styled.Value>
            {totalCost && (
                <Styled.Breakdown>
                    <Styled.Overall>
                        <Styled.GainAbs gain={(value - totalCost) / totalCost}>
                            {formatCurrency(value - totalCost, formatOptions)}
                        </Styled.GainAbs>
                        <Styled.Gain gain={value - totalCost}>
                            {formatPercent((value - totalCost) / totalCost, formatOptionsPct)}
                        </Styled.Gain>
                    </Styled.Overall>
                    <Styled.DayGainOuter>
                        <Styled.DayGainAbs gain={dayGain}>
                            {formatCurrency(dayGainAbs, formatOptions)}
                        </Styled.DayGainAbs>
                        <Styled.DayGain gain={dayGain}>
                            {formatPercent(dayGain, formatOptionsPct)}
                        </Styled.DayGain>
                    </Styled.DayGainOuter>
                </Styled.Breakdown>
            )}
        </Styled.OverallGain>
        {showGraph && <GraphFunds isMobile />}
        <DesktopOnly>
            <input type="checkbox" checked={viewSoldFunds} onChange={onViewSoldToggle} />
            <span>{'View sold'}</span>
        </DesktopOnly>
    </Styled.ListHeadFunds>
);

ListHeadFunds.propTypes = {
    totalCost: PropTypes.number.isRequired,
    viewSoldFunds: PropTypes.bool,
    period: PropTypes.string.isRequired,
    cachedValue: cachedValueShape.isRequired,
    showGraph: PropTypes.bool,
    onViewSoldToggle: PropTypes.func.isRequired,
    onReloadPrices: PropTypes.func.isRequired,
};

ListHeadFunds.defaultProps = {
    showGraph: false,
};

export default ListHeadFunds;
