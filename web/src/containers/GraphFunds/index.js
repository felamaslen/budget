import './style.scss';
import { List as list, OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';
import { aFundsGraphClicked, aFundsGraphLineToggled, aFundsGraphPeriodChanged } from '~client/actions/graph.actions';
import { makeGetGraphProps } from '~client/selectors/funds/graph';
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LineGraph from '~client/components/Graph/LineGraph';
import { rangePropTypes, pixelPropTypes } from '~client/components/Graph/propTypes';
import { getTickSize } from '~client/modules/format';
import {
    GRAPH_FUNDS_WIDTH,
    GRAPH_FUNDS_HEIGHT,
    GRAPH_FUNDS_MODE_ROI,
    GRAPH_FUNDS_NUM_TICKS,
    GRAPH_FUNDS_PERIODS,
    GRAPH_FUNDS_MODES
} from '~client/constants/graph';
import styles from '~client/constants/styles.json';
import { rgba } from '~client/modules/color';
import { formatValue } from '~client/modules/funds';
import Axes from '~client/containers/GraphFunds/Axes';

const PADDING_DESKTOP = [36, 0, 0, 0];
const PADDING_MOBILE = [0, 0, 0, 0];

function AfterCanvas({ period, mode, fundItems, toggleLine, changePeriod }) {
    let fundLineToggles = null;
    if (fundItems) {
        fundLineToggles = fundItems.map((item, id) => {
            const className = classNames({ enabled: item.get('enabled') });
            const onClick = () => toggleLine(id);
            const style = {
                borderColor: rgba(item.get('color'))
            };

            return <li key={id} className={className} onClick={onClick}>
                <span className="checkbox" style={style}></span>
                <span className="fund">{item.get('item')}</span>
            </li>;
        })
            .toList();
    }

    const onChange = evt => changePeriod({ shortPeriod: evt.target.value });

    const periodOptions = GRAPH_FUNDS_PERIODS.map(([value, display], key) => (
        <option key={key} value={value}>{display}</option>
    ));

    return (
        <div className="after-canvas">
            <ul className="fund-sidebar noselect">
                <li>
                    <select defaultValue={period} onChange={onChange}>
                        {periodOptions}
                    </select>
                </li>
                {fundLineToggles}
            </ul>
            <span className="mode">
                {'Mode: '}{GRAPH_FUNDS_MODES[mode]}
            </span>
        </div>
    );
}

AfterCanvas.propTypes = {
    period: PropTypes.string.isRequired,
    mode: PropTypes.number.isRequired,
    fundItems: PropTypes.instanceOf(OrderedMap).isRequired,
    toggleLine: PropTypes.func.isRequired,
    changePeriod: PropTypes.func.isRequired
};

const makeGetRanges = ({
    mode,
    zoomRange,
    lines,
    cacheTimes
}) => (zoomedLines = lines, minX = zoomRange.get(0), maxX = zoomRange.get(1)) => {
    if (!(zoomedLines && cacheTimes.size >= 2)) {
        return { minX, maxX, minY: -1, maxY: 1 };
    }

    const valuesY = zoomedLines
        .map(line => line.get('data').map(item => item.get(1)))
        .filter(item => item.size);

    let minY = valuesY.reduce((min, line) => Math.min(min, line.min()), Infinity);
    let maxY = valuesY.reduce((max, line) => Math.max(max, line.max()), -Infinity);

    if (minY === maxY) {
        minY -= 0.5;
        maxY += 0.5;
    }
    if (mode === GRAPH_FUNDS_MODE_ROI && minY === 0) {
        minY = -maxY * 0.2;
    }

    // get the tick size for the new range
    const tickSizeY = getTickSize(minY, maxY, GRAPH_FUNDS_NUM_TICKS);

    if (!isNaN(tickSizeY)) {
        minY = tickSizeY * Math.floor(minY / tickSizeY);
        maxY = tickSizeY * Math.ceil(maxY / tickSizeY);
    }

    return { minX, maxX, minY, maxY, tickSizeY };
};

function makeBeforeLines({ mode, startTime, tickSizeY }) {
    const BeforeLines = ({ minY, maxY, minX, maxX, pixX, pixY }) => (
        <Axes
            mode={mode}
            startTime={startTime}
            tickSizeY={tickSizeY}
            minY={minY}
            maxY={maxY}
            minX={minX}
            maxX={maxX}
            pixX={pixX}
            pixY={pixY}
        />
    );

    BeforeLines.propTypes = {
        ...rangePropTypes,
        ...pixelPropTypes
    };

    return BeforeLines;
}

export function GraphFunds({
    isMobile,
    width,
    height,
    mode,
    startTime,
    zoomRange,
    fundItems,
    cacheTimes,
    lines,
    period,
    changePeriod,
    toggleLine,
    onClick
}) {
    const getRanges = useMemo(() => makeGetRanges({
        mode,
        zoomRange,
        lines,
        cacheTimes
    }), [mode, zoomRange, lines, cacheTimes]);

    const {
        minX,
        maxX,
        minY,
        maxY,
        tickSizeY
    } = useMemo(getRanges, [getRanges]);

    const beforeLines = useMemo(() => makeBeforeLines({
        mode,
        startTime,
        tickSizeY
    }), [mode, startTime, tickSizeY]);

    const after = useMemo(() => () => !isMobile && (
        <AfterCanvas
            period={period}
            mode={mode}
            fundItems={fundItems}
            toggleLine={toggleLine}
            changePeriod={changePeriod}
        />
    ), [isMobile, period, mode, fundItems, toggleLine, changePeriod]);

    const labelX = useCallback(
        value => DateTime.fromJSDate(new Date(1000 * (value + startTime)))
            .toLocaleString(DateTime.DATE_SHORT),
        [startTime]
    );

    const labelY = useCallback(value => formatValue(value, mode), [mode]);

    const hoverEffect = useMemo(() => ({
        labelX,
        labelY
    }), [labelX, labelY]);

    const svgProperties = useMemo(() => ({
        onClick
    }), [onClick]);

    const graphProps = {
        name: 'fund-history',
        isMobile,
        width,
        height,
        padding: isMobile
            ? PADDING_MOBILE
            : PADDING_DESKTOP,
        minX,
        maxX,
        minY,
        maxY,
        beforeLines,
        lines,
        after,
        svgProperties,
        hoverEffect,
        zoomEffect: getRanges
    };

    return <LineGraph {...graphProps} />;
}

GraphFunds.propTypes = {
    isMobile: PropTypes.bool,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    fundItems: PropTypes.instanceOf(OrderedMap),
    fundLines: PropTypes.instanceOf(list),
    startTime: PropTypes.number.isRequired,
    cacheTimes: PropTypes.instanceOf(list),
    zoomRange: PropTypes.instanceOf(list),
    funds: PropTypes.instanceOf(list),
    lines: PropTypes.instanceOf(list),
    mode: PropTypes.number.isRequired,
    period: PropTypes.string,
    changePeriod: PropTypes.func.isRequired,
    showOverall: PropTypes.bool,
    toggleLine: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
};

GraphFunds.defaultProps = {
    startTime: 0
};

const makeMapStateToProps = () => {
    const getGraphProps = makeGetGraphProps();

    return (state, props) => ({
        name: 'fund-history',
        width: Math.min(state.getIn(['other', 'windowWidth']), GRAPH_FUNDS_WIDTH),
        height: props.isMobile
            ? styles.graphFundsHeightMobile
            : GRAPH_FUNDS_HEIGHT,
        ...getGraphProps(state, props),
        zoomRange: state.getIn(['other', 'graphFunds', 'zoomRange']),
        mode: state.getIn(['other', 'graphFunds', 'mode']),
        period: state.getIn(['other', 'graphFunds', 'period']),
        showOverall: state.getIn(['other', 'graphFunds', 'showOverall'])
    });
};

const mapDispatchToProps = dispatch => ({
    toggleLine: id => dispatch(aFundsGraphLineToggled(id)),
    changePeriod: req => dispatch(aFundsGraphPeriodChanged(req)),
    onClick: () => dispatch(aFundsGraphClicked())
});

export default connect(makeMapStateToProps, mapDispatchToProps)(GraphFunds);
