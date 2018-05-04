/*
 * Graph general cash flow (balance over time)
 */

import { Map as map, List as list } from 'immutable';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';
import {
    aFundsGraphClicked, aFundsGraphZoomed, aFundsGraphHovered,
    aFundsGraphLineToggled, aFundsGraphPeriodChanged
} from '../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LineGraph from '../../components/Graph/LineGraph';
import { getTickSize, formatAge } from '../../helpers/format';
import {
    GRAPH_FUNDS_WIDTH, GRAPH_FUNDS_HEIGHT, FONT_GRAPH_TITLE,
    GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_MODE_PRICE,
    GRAPH_FUNDS_NUM_TICKS, GRAPH_FUNDS_PERIODS, GRAPH_FUNDS_MODES, GRAPH_FUNDS_POINT_RADIUS
} from '../../constants/graph';
import { graphFundsHeightMobile } from '../../constants/styles';
import { COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_DARK } from '../../constants/colors';
import debounce from '../../helpers/debounce';
import { rgba } from '../../helpers/color';
import { formatValue } from '../../helpers/funds';
import Axes from './Axes';

function AfterCanvas({ period, mode, fundItems, toggleLine, changePeriod }) {
    const fundLineToggles = fundItems
        ? fundItems.map((item, key) => {
            const className = classNames({ enabled: item.get('enabled') });
            const onClick = () => toggleLine(key);
            const style = {
                borderColor: rgba(item.get('color'))
            };

            return <li key={key} className={className} onClick={onClick}>
                <span className="checkbox" style={style}></span>
                <span className="fund">{item.get('item')}</span>
            </li>;
        })
        : null;

    const onChange = evt => changePeriod({
        shortPeriod: evt.target.value,
        reloadPagePrices: false
    });

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
    fundItems: PropTypes.instanceOf(list).isRequired,
    toggleLine: PropTypes.func.isRequired,
    changePeriod: PropTypes.func.isRequired
};

function HighlightPoint({ mode, startTime, hlPoint, pixX, pixY, width, height }) {
    if (!hlPoint) {
        return null;
    }

    const [fontSize, fontFamily] = FONT_GRAPH_TITLE;

    const hlPixX = pixX(hlPoint.get(0));
    const hlPixY = pixY(hlPoint.get(1));

    const posX = Math.floor(pixX(hlPoint.get(0))) + 0.5;
    const posY = Math.floor(pixY(hlPoint.get(1))) + 0.5;

    const labelWidthX = 88;
    const labelWidthY = 50;
    const labelHeight = fontSize + 2;

    let anchorLabelX = 'middle';
    let labelPosX = posX;
    if (posX >= width - labelWidthX / 2) {
        anchorLabelX = 'end';
        labelPosX = width;
    }
    else if (posX < labelWidthX / 2) {
        anchorLabelX = 'start';
        labelPosX = 0;
    }

    const labelTextX = DateTime.fromJSDate(new Date(1000 * (hlPoint.get(0) + startTime)))
        .toLocaleString(DateTime.DATE_SHORT);

    const labelTextY = formatValue(hlPoint.get(1), mode);

    const pathVertical = `M${posX},0 L${posX},${height}`;
    const pathHorizontal = `M0,${posY} L${width},${posY}`;

    const lineColor = hlPoint.get(2);
    const lineProps = { stroke: lineColor, strokeDasharray: '3,2' };

    return <g className="hl-point">
        <path d={pathVertical} {...lineProps} />
        <path d={pathHorizontal} {...lineProps} />
        <circle cx={hlPixX} cy={hlPixY} r={GRAPH_FUNDS_POINT_RADIUS}
            stroke="none" fill={lineColor} />
        <rect x={posX - labelWidthX / 2} y={height - labelHeight} width={labelWidthX} height={labelHeight}
            fill={rgba(COLOR_TRANSLUCENT_DARK)} />
        <text
            x={labelPosX}
            y={height - 2}
            fontSize={fontSize}
            fontFamily={fontFamily}
            color={rgba(COLOR_GRAPH_TITLE)}
            textAnchor={anchorLabelX}
            alignmentBaseline="baseline">
            {labelTextX}
        </text>
        <rect x={width - labelWidthY} y={posY - labelHeight / 2} width={labelWidthY} height={labelHeight}
            fill={rgba(COLOR_TRANSLUCENT_DARK)} />
        <text
            x={width}
            y={posY}
            fontSize={fontSize}
            fontFamily={fontFamily}
            color={rgba(COLOR_GRAPH_TITLE)}
            textAnchor="end"
            alignmentBaseline="middle">
            {labelTextY}
        </text>
    </g>;
}

HighlightPoint.propTypes = {
    mode: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    hlPoint: PropTypes.instanceOf(list),
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};

function getLines({ isMobile, fundLines, fundItems, mode }) {
    return fundLines.reduce((lines, item) => {
        const mainLine = item.get('index') === 0;
        if (isMobile && !mainLine && mode !== GRAPH_FUNDS_MODE_PRICE) {
            return lines;
        }

        const color = rgba(fundItems.getIn([item.get('index'), 'color']));

        const strokeWidth = 1 + 0.5 * (mainLine >> 0);

        const itemLines = item.get('line').map((data, key) => map({
            key: `${item.get('index')}-${key}`,
            data,
            smooth: mode === GRAPH_FUNDS_MODE_ROI,
            color,
            strokeWidth
        }));

        return lines.concat(itemLines);

    }, list.of());
}

function processData(props) {
    const { zoom, mode, fundLines, cacheTimes } = props;

    const minX = zoom.get(0);
    const maxX = zoom.get(1);

    if (!(fundLines && cacheTimes.size >= 2)) {
        return { minX, maxX, minY: -1, maxY: 1 };
    }

    const lines = getLines(props);

    const valuesY = lines.map(line => line.get('data').map(item => item.get(1)));

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

    return { minX, maxX, minY, maxY, lines, tickSizeY };
}

function getSvgProperties({ isMobile, onClick, onZoom, hlPoint }) {
    const common = {
        onClick: () => onClick
    };

    if (isMobile) {
        return common;
    }

    return {
        ...common,
        onWheel: ({ valX }) => evt => {
            evt.preventDefault();

            if (!hlPoint && !(evt.currentTarget && evt.currentTarget.offsetParent)) {
                return;
            }

            const position = hlPoint
                ? hlPoint.get(0)
                : valX(evt.pageX - evt.currentTarget.offsetParent.offsetLeft);

            onZoom({ direction: evt.deltaY / Math.abs(evt.deltaY), position });
        }
    };
}

function getOuterProperties({ isMobile, onHover }) {
    if (isMobile) {
        return {};
    }

    return {
        onMouseMove: ({ valX, valY }) => {
            const mouseMoveHandler = debounce((pageX, pageY, currentTarget) => {
                const { left, top } = currentTarget.getBoundingClientRect();

                onHover({
                    valX: valX(pageX - left),
                    valY: valY(pageY - top)
                });
            }, 10, true);

            return ({ pageX, pageY, currentTarget }) => mouseMoveHandler(pageX, pageY, currentTarget);
        },
        onMouseLeave: () => () => onHover(null)
    };
}

function AfterLines(subProps) {
    return <HighlightPoint {...subProps} />;
}

export function GraphFunds(props) {
    const svgProperties = getSvgProperties(props);
    const outerProperties = getOuterProperties(props);

    const beforeLines = subProps => (
        <Axes {...subProps} />
    );

    let afterLines = null;
    let after = null;
    if (!props.isMobile) {
        afterLines = AfterLines;
        after = <AfterCanvas {...props} />;
    }

    const graphProps = {
        padding: [36 * (!props.isMobile >> 0), 0, 0, 0],
        beforeLines,
        afterLines,
        after,
        svgProperties,
        outerProperties,
        ...processData(props),
        ...props
    };

    return <LineGraph {...graphProps} />;
}

GraphFunds.propTypes = {
    isMobile: PropTypes.bool,
    fundHistoryCache: PropTypes.instanceOf(map),
    fundItems: PropTypes.instanceOf(list),
    fundLines: PropTypes.instanceOf(list),
    startTime: PropTypes.number,
    cacheTimes: PropTypes.instanceOf(list),
    funds: PropTypes.instanceOf(list),
    mode: PropTypes.number.isRequired,
    period: PropTypes.string,
    showOverall: PropTypes.bool,
    zoom: PropTypes.instanceOf(list),
    hlPoint: PropTypes.instanceOf(list),
    onZoom: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired
};

const mapStateToProps = (state, { isMobile }) => ({
    name: 'fund-history',
    width: Math.min(state.getIn(['other', 'windowWidth']), GRAPH_FUNDS_WIDTH),
    height: isMobile
        ? graphFundsHeightMobile
        : GRAPH_FUNDS_HEIGHT,
    fundHistoryCache: state.getIn(['other', 'fundHistoryCache']),
    fundItems: state.getIn(['other', 'graphFunds', 'data', 'fundItems']),
    fundLines: state.getIn(['other', 'graphFunds', 'data', 'fundLines']),
    startTime: state.getIn(['other', 'graphFunds', 'startTime']),
    cacheTimes: state.getIn(['other', 'graphFunds', 'cacheTimes']),
    mode: state.getIn(['other', 'graphFunds', 'mode']),
    period: state.getIn(['other', 'graphFunds', 'period']),
    showOverall: state.getIn(['other', 'graphFunds', 'showOverall']),
    zoom: state.getIn(['other', 'graphFunds', 'zoom']),
    hlPoint: state.getIn(['other', 'graphFunds', 'hlPoint'])
});

const mapDispatchToProps = dispatch => ({
    onHover: position => dispatch(aFundsGraphHovered(position)),
    toggleLine: key => dispatch(aFundsGraphLineToggled(key)),
    changePeriod: req => dispatch(aFundsGraphPeriodChanged(req)),
    onClick: () => dispatch(aFundsGraphClicked()),
    onZoom: req => dispatch(aFundsGraphZoomed(req))
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphFunds);

