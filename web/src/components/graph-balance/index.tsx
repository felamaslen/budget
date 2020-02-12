import React, { useState, useMemo, useCallback } from 'react';
import { DateTime } from 'luxon';

import {
    Color,
    COLOR_BALANCE_ACTUAL,
    COLOR_BALANCE_PREDICTED,
    COLOR_BALANCE_STOCKS,
} from '~client/constants/colors';
import { graphOverviewHeightMobile } from '~client/styled/variables';
import { rgba } from '~client/modules/color';
import { leftPad } from '~client/modules/data';
import {
    GraphCashFlow,
    Props as GraphCashFlowProps,
    getValuesWithTime,
} from '~client/components/graph-cashflow';
import { Key } from '~client/components/graph-balance/key';
import { Targets } from '~client/components/graph-balance/targets';
import { AfterCanvas } from '~client/components/graph-balance/after-canvas';
import { Point, Line, Data, BasicProps } from '~client/types/graph';
import { Cost, Target } from '~client/types/overview';

const colorBalance: [string, string] = [rgba(COLOR_BALANCE_PREDICTED), rgba(COLOR_BALANCE_ACTUAL)];
const colorBalanceStocks = rgba(COLOR_BALANCE_STOCKS);

type BalanceData = {
    balance: number[];
    funds: number[];
    oldOffset: number;
};

function getData(
    netWorthCombined: number[],
    netWorthOld: number[],
    fundsCurrent: number[],
    fundsOld: number[],
    showAll: boolean,
): BalanceData {
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

type RawData = {
    startDate: DateTime;
    cost: Cost;
    netWorthOld: number[];
    showAll: boolean;
    futureMonths: number;
};

function processData({
    startDate,
    cost: { netWorthCombined, funds: fundsCurrent, fundsOld },
    netWorthOld,
    showAll,
    futureMonths,
}: RawData): Line[] {
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

    const dataFunds: Data = funds.map((value, index) => [dataBalance[index][0], value]);

    return [
        {
            key: 'balance',
            data: dataBalance,
            fill: false,
            smooth: true,
            movingAverage: 12,
            color: (point: Point, index = 0): string => colorBalance[index < futureKey - 1 ? 1 : 0],
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

function makeAfterLines({
    showAll,
    targets,
}: {
    showAll: boolean;
    targets: Target[];
}): React.FC<BasicProps> {
    const AfterLines: React.FC<BasicProps> = ({ minY, maxY, pixX, pixY1 }) => (
        <g>
            <Targets
                minY={minY}
                maxY={maxY}
                pixX={pixX}
                pixY1={pixY1}
                showAll={showAll}
                targets={targets}
            />
            <Key title="Balance" />
        </g>
    );

    return AfterLines;
}

export type Props = {
    startDate: DateTime;
    futureMonths: number;
    cost: Cost;
    netWorthOld: number[];
    targets: Target[];
} & Omit<GraphCashFlowProps, 'name' | 'lines'>;

export const GraphBalance: React.FC<Props> = ({
    startDate,
    futureMonths,
    now,
    graphWidth,
    cost,
    netWorthOld,
    targets,
    isMobile,
}) => {
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

    const graphProps: GraphCashFlowProps = {
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
};
