import React from 'react';
import PropTypes from 'prop-types';
import { GRAPH_FUNDS_MODE_ROI } from '../../../../../misc/const';
import { COLOR_PROFIT_LIGHT, COLOR_LOSS_LIGHT } from '../../../../../misc/config';
import { rgba } from '../../../../../misc/color';

export default function ProfitLossBackground({ mode, width, minX, minY, maxY, pixX, pixY }) {
    if (mode !== GRAPH_FUNDS_MODE_ROI) {
        return null;
    }

    const zero = pixY(Math.min(Math.max(0, minY), maxY));

    let bgProfit = null;
    let bgLoss = null;

    if (maxY > 0) {
        const y0 = pixY(maxY);

        bgProfit = <rect x={pixX(minX)} y={y0} width={width} height={zero - y0}
            fill={rgba(COLOR_PROFIT_LIGHT)} />;
    }
    if (minY < 0) {
        bgLoss = <rect x={pixX(minX)} y={zero} width={width} height={pixY(minY) - zero}
            fill={rgba(COLOR_LOSS_LIGHT)} />;
    }

    return <g className="roi-bg">
        {bgProfit}
        {bgLoss}
    </g>;
}

ProfitLossBackground.propTypes = {
    mode: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    minX: PropTypes.number.isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired
};

