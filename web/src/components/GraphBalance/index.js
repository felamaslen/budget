/*
 * Graph general cash flow (balance over time)
 */

import './style.scss';
import { Map as map, List as list } from 'immutable';
import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import { COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED, COLOR_BALANCE_STOCKS } from '~client/constants/colors';
import styles from '~client/constants/styles.json';
import { rgba } from '~client/modules/color';
import { pixelPropTypes, rangePropTypes } from '~client/components/Graph/propTypes';
import GraphCashFlow, { getValuesWithTime, graphCashFlowPropTypes } from '~client/components/GraphCashFlow';
import Key from '~client/components/GraphBalance/Key';
import Targets from '~client/components/GraphBalance/Targets';
import AfterCanvas from '~client/components/GraphBalance/AfterCanvas';

function processData({ startDate, cost, showAll, futureMonths }) {
    let oldOffset = 0;

    let balance = cost.get('balanceWithPredicted');
    let funds = cost.get('funds');

    if (showAll) {
        oldOffset = cost.get('old').size;
        balance = cost.get('old').concat(balance);
        funds = cost.get('fundsOld').concat(funds);
    }

    const futureKey = oldOffset + cost.get('balanceWithPredicted').size - futureMonths;

    const dataBalance = getValuesWithTime(balance, {
        oldOffset,
        breakAtToday: false,
        startDate
    });

    const dataFunds = funds.map((value, key) => list([
        dataBalance.getIn([key, 0]),
        value
    ]));

    const colorBalance = [rgba(COLOR_BALANCE_PREDICTED), rgba(COLOR_BALANCE_ACTUAL)];

    const colorBalanceStocks = rgba(COLOR_BALANCE_STOCKS);

    return list.of(
        map({
            key: 'balance',
            data: dataBalance,
            fill: false,
            smooth: true,
            movingAverage: 12,
            color: (point, index) => colorBalance[(index < futureKey - 1) >> 0]
        }),
        map({
            key: 'funds',
            data: dataFunds,
            fill: true,
            smooth: true,
            color: colorBalanceStocks
        })
    );
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
        ...rangePropTypes
    };

    return AfterLines;
}

export default function GraphBalance({
    startDate,
    futureMonths,
    now,
    graphWidth,
    cost,
    targets,
    isMobile
}) {
    const [showAll, setShowAll] = useState(false);
    const lines = useMemo(() => processData({
        startDate,
        cost,
        showAll,
        futureMonths
    }), [startDate, cost, showAll, futureMonths]);

    const afterLines = useMemo(() => makeAfterLines({
        showAll,
        targets
    }), [showAll, targets]);

    const after = useCallback(() => (
        <AfterCanvas showAll={showAll} setShowAll={setShowAll} />
    ), [showAll, setShowAll]);

    const graphProps = {
        name: 'balance',
        now,
        lines,
        graphWidth,
        afterLines,
        after
    };

    if (isMobile) {
        graphProps.graphHeight = styles.graphOverviewHeightMobile;
    }

    return <GraphCashFlow {...graphProps} />;
}

GraphBalance.propTypes = {
    ...graphCashFlowPropTypes,
    isMobile: PropTypes.bool,
    cost: PropTypes.instanceOf(map).isRequired,
    targets: PropTypes.instanceOf(list).isRequired,
    startDate: PropTypes.instanceOf(DateTime).isRequired,
    futureMonths: PropTypes.number.isRequired
};

