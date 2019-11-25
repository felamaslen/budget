/*
 * Graph general cash flow (balance over time)
 */

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import {
    COLOR_BALANCE_ACTUAL,
    COLOR_BALANCE_PREDICTED,
    COLOR_BALANCE_STOCKS,
} from '~client/constants/colors';
import { graphOverviewHeightMobile } from '~client/styled/variables';
import { rgba } from '~client/modules/color';
import { leftPad } from '~client/modules/data';
import { pixelPropTypes, rangePropTypes } from '~client/prop-types/graph';
import { targetsShape } from '~client/prop-types/graph/balance';
import GraphCashFlow, {
    getValuesWithTime,
    graphCashFlowPropTypes,
} from '~client/components/GraphCashFlow';
import Key from '~client/components/GraphBalance/Key';
import Targets from '~client/components/GraphBalance/Targets';
import AfterCanvas from '~client/components/GraphBalance/AfterCanvas';

const colorBalance = [rgba(COLOR_BALANCE_PREDICTED), rgba(COLOR_BALANCE_ACTUAL)];
const colorBalanceStocks = rgba(COLOR_BALANCE_STOCKS);

function getData(netWorthCombined, netWorthOld, fundsCurrent, fundsOld, showAll) {
    if (showAll) {
        const oldOffset = Math.max(fundsOld.length, netWorthOld.length);
        const totalLength = oldOffset + netWorthCombined.length;

        return {
            balance: leftPad(netWorthOld.concat(netWorthCombined), totalLength),
            funds: leftPad(fundsOld.concat(fundsCurrent), totalLength),
            oldOffset,
        };
    }

    return {
        balance: netWorthCombined,
        funds: fundsCurrent,
        oldOffset: 0,
    };
}

function processData({
    startDate,
    cost: { netWorthCombined, funds: fundsCurrent, fundsOld },
    netWorthOld,
    showAll,
    futureMonths,
}) {
    const { balance, funds, oldOffset } = getData(
        netWorthCombined,
        netWorthOld,
        fundsCurrent,
        fundsOld,
        showAll,
    );

    const futureKey = oldOffset + netWorthCombined.length - futureMonths;

    const dataBalance = getValuesWithTime(balance, {
        oldOffset,
        breakAtToday: false,
        startDate,
    });

    const dataFunds = funds.map((value, index) => [dataBalance[index][0], value]);

    return [
        {
            key: 'balance',
            data: dataBalance,
            fill: false,
            smooth: true,
            movingAverage: 12,
            color: (point, index) => colorBalance[(index < futureKey - 1) >> 0],
        },
        {
            key: 'funds',
            data: dataFunds,
            fill: true,
            smooth: true,
            color: colorBalanceStocks,
        },
    ];
}

function makeAfterLines({ showAll, targets }) {
    const AfterLines = ({ minY, maxY, pixX, pixY }) => (
        <g>
            <Targets
                minY={minY}
                maxY={maxY}
                pixX={pixX}
                pixY={pixY}
                showAll={showAll}
                targets={targets}
            />
            <Key title="Balance" />
        </g>
    );

    AfterLines.propTypes = {
        ...pixelPropTypes,
        ...rangePropTypes,
    };

    return AfterLines;
}

export default function GraphBalance({
    startDate,
    futureMonths,
    now,
    graphWidth,
    cost,
    netWorthOld,
    targets,
    isMobile,
}) {
    const [showAll, setShowAll] = useState(false);
    const lines = useMemo(
        () =>
            processData({
                startDate,
                cost,
                netWorthOld,
                showAll,
                futureMonths,
            }),
        [startDate, cost, netWorthOld, showAll, futureMonths],
    );

    const afterLines = useMemo(
        () =>
            makeAfterLines({
                showAll,
                targets,
            }),
        [showAll, targets],
    );

    const after = useCallback(() => <AfterCanvas showAll={showAll} setShowAll={setShowAll} />, [
        showAll,
        setShowAll,
    ]);

    const graphProps = {
        name: 'balance',
        now,
        lines,
        graphWidth,
        afterLines,
        after,
    };

    if (isMobile) {
        graphProps.graphHeight = graphOverviewHeightMobile;
    }

    return <GraphCashFlow isMobile={isMobile} {...graphProps} />;
}

GraphBalance.propTypes = {
    ...graphCashFlowPropTypes,
    isMobile: PropTypes.bool,
    cost: PropTypes.shape({
        netWorthCombined: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
        funds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
        fundsOld: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    }).isRequired,
    netWorthOld: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    targets: targetsShape.isRequired,
    startDate: PropTypes.instanceOf(DateTime).isRequired,
    futureMonths: PropTypes.number.isRequired,
};
