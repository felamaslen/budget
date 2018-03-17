/*
 * Graph general cash flow (balance over time)
 */

import { Map as map, List as list } from 'immutable';
import { formatCurrency, getTickSize, formatAge } from '../../../../misc/format';
import { rgba } from '../../../../misc/color';
import {
    GRAPH_FUNDS_WIDTH, GRAPH_FUNDS_HEIGHT,
    GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_NUM_TICKS, GRAPH_FUNDS_PERIODS
} from '../../../../misc/const';
import {
    GRAPH_FUNDS_MODES, GRAPH_FUNDS_POINT_RADIUS,
    COLOR_DARK, COLOR_LIGHT_MED, COLOR_PROFIT_LIGHT, COLOR_LOSS_LIGHT,
    COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_DARK,
    FONT_AXIS_LABEL, FONT_GRAPH_TITLE
} from '../../../../misc/config';

import { connect } from 'react-redux';
import {
    aFundsGraphClicked, aFundsGraphZoomed, aFundsGraphHovered,
    aFundsGraphLineToggled, aFundsGraphPeriodChanged
} from '../../../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LineGraph, { genValX, genValY } from '../../../../components/graph/line';
import { separateLines } from './helpers';

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

    return <div>
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
    </div>;
}

AfterCanvas.propTypes = {
    period: PropTypes.string.isRequired,
    mode: PropTypes.number.isRequired,
    fundItems: PropTypes.instanceOf(list).isRequired,
    toggleLine: PropTypes.func.isRequired,
    changePeriod: PropTypes.func.isRequired
};

/*
function formatValue(value, mode = null) {
    if (mode === GRAPH_FUNDS_MODE_ROI) {
        return `${value.toFixed(2)}%`;
    }

    return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
}
function drawProfitLossBackground({ minX, maxX, minY, maxY, mode }, { ctx }, { pixX, pixY }) {
    if (mode !== GRAPH_FUNDS_MODE_ROI) {
        return;
    }

    const zero = pixY(Math.min(Math.max(0, minY), maxY));
    if (maxY > 0) {
        ctx.fillStyle = rgba(COLOR_PROFIT_LIGHT);
        const y0 = pixY(maxY);
        ctx.fillRect(pixX(minX), y0, pixX(maxX), zero - y0);
    }
    if (minY < 0) {
        ctx.fillStyle = rgba(COLOR_LOSS_LIGHT);
        ctx.fillRect(
            pixX(minX),
            zero,
            pixX(maxX),
            pixY(minY) - zero
        );
    }
}

function calculateTicksY({ tickSizeY, minY, maxY }, pixY) {
    // calculate tick range
    const numTicks = typeof tickSizeY === 'undefined' || isNaN(tickSizeY)
        ? 0
        : Math.floor((maxY - minY) / tickSizeY);

    if (!numTicks) {
        return [];
    }

    return new Array(numTicks)
        .fill(0)
        .map((item, key) => {
            const value = minY + (key + 1) * tickSizeY;
            const pos = Math.floor(pixY(value)) + 0.5;

            return { value, pos };
        });
}
const drawTicksY = axisColor => ({ minX, maxX, mode, ...props }, { ctx }, { pixX, pixY }) => {
    ctx.lineWidth = 1;

    const ticksY = calculateTicksY(props, pixY);

    // draw horizontal lines
    ctx.strokeStyle = axisColor;
    ticksY.forEach(({ pos }) => {
        // draw horizontal line
        ctx.beginPath();
        ctx.moveTo(pixX(minX), pos);
        ctx.lineTo(pixX(maxX), pos);
        ctx.stroke();
        ctx.closePath();
    });

    // draw Y axis
    ctx.fillStyle = rgba(COLOR_DARK);
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';
    ctx.font = FONT_AXIS_LABEL;

    ticksY.forEach(({ pos, value }) => {
        const tickName = formatValue(value, mode);
        ctx.fillText(tickName, pixX(maxX), pos);
    });
};

const drawTimeTicks = axisColor => ({
    minY, startTime
}, {
    ctx, padding: [padY1]
}, {
    pixY, getTimeScale
}) => {
    const timeTicks = getTimeScale(startTime);

    ctx.font = FONT_AXIS_LABEL;
    ctx.fillStyle = rgba(COLOR_DARK);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    const tickAngle = -Math.PI / 6;
    const tickSize = 10;

    const y0 = pixY(minY);

    timeTicks.forEach(({ major, pix, text }) => {
        const thisTickSize = tickSize * 0.5 * (major + 1);

        ctx.beginPath();
        ctx.strokeStyle = major
            ? rgba(COLOR_GRAPH_TITLE)
            : rgba(COLOR_DARK);
        ctx.moveTo(pix, y0);
        ctx.lineTo(pix, y0 - thisTickSize);
        ctx.stroke();
        ctx.closePath();

        if (major > 1) {
            ctx.beginPath();
            ctx.strokeStyle = axisColor;
            ctx.moveTo(pix, y0 - thisTickSize);
            ctx.lineTo(pix, padY1);
            ctx.stroke();
            ctx.closePath();
        }

        if (text) {
            ctx.save();
            ctx.translate(pix, y0 - thisTickSize);
            ctx.rotate(tickAngle);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
    });
};

function drawAxes(props, state, graph) {
    drawProfitLossBackground(props, state, graph);

    const axisColor = rgba(COLOR_LIGHT_MED);

    drawTicksY(axisColor)(props, state, graph);

    drawTimeTicks(axisColor)(props, state, graph);
}

function drawData({
    fundLines, fundItems, mode, hlPoint
}, {
    ctx
}, {
    pixX, pixY, drawCubicLine, drawLine
}) {
    if (hlPoint) {
        const hlPixX = pixX(hlPoint.get(0));
        const hlPixY = pixY(hlPoint.get(1));
        ctx.beginPath();
        ctx.moveTo(hlPixX, hlPixY);
        ctx.arc(hlPixX, hlPixY, GRAPH_FUNDS_POINT_RADIUS, 0, Math.PI * 2, false);
        ctx.fillStyle = hlPoint.get(2);
        ctx.fill();
        ctx.closePath();
    }
}

function drawLabel({ hlPoint, startTime, mode }, { ctx, width }, { pixX, pixY }) {
    if (hlPoint) {
        const ageSeconds = Date.now() / 1000 -
               (hlPoint.get(0) + startTime);
        const ageText = formatAge(ageSeconds);
        const valueText = formatValue(hlPoint.get(1), mode);
        const labelText = `${ageText}: ${valueText}`;

        const paddingX = 2;
        const paddingY = 1;
        const posX = pixX(hlPoint.get(0));
        const alignLeft = posX < width / 2;
        const posY = pixY(hlPoint.get(1));

        ctx.font = FONT_GRAPH_TITLE;
        ctx.textAlign = alignLeft
            ? 'left'
            : 'right';
        ctx.textBaseline = 'top';

        const labelWidth = ctx.measureText(labelText).width + 2 * paddingX;
        const left = posX - labelWidth * (!alignLeft >> 0);

        ctx.fillStyle = rgba(COLOR_TRANSLUCENT_DARK);
        ctx.fillRect(left, posY, labelWidth, parseInt(ctx.font, 10) + 2 * paddingY);

        const align = 2 * (alignLeft >> 0) - 1;

        ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);
        ctx.fillText(labelText, posX + paddingX * align, posY + paddingY);
    }
}

function onDraw(...args) {
    drawAxes(...args);
    drawData(...args);
    drawLabel(...args);
}
*/

function getLines({ fundLines, fundItems, mode }) {
    return fundLines.reduce((lines, item) => {
        const mainLine = item.get('index') === 0;
        const color = rgba(fundItems.getIn([item.get('index'), 'color']));

        const parts = separateLines(item.get('line'));
        const strokeWidth = 1 + 0.5 * (mainLine >> 0);

        const itemLines = parts.map((data, key) => ({
            key: `${item.get('index')}-${key}`,
            data,
            smooth: true,
            color,
            strokeWidth
        }));

        return lines.concat(itemLines);

    }, []);
}

function processData(props) {
    const { zoom, mode, fundLines, cacheTimes } = props;

    const minX = zoom.get(0);
    const maxX = zoom.get(1);

    if (!(fundLines && cacheTimes.size >= 2)) {
        return { minX, maxX, minY: -1, maxY: 1 };
    }

    const valuesY = fundLines.map(line => line.get('line')
        .map(item => item.get(1))
    );

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

    const lines = getLines(props);

    return { minX, maxX, minY, maxY, lines, tickSizeY };
}

export function GraphFunds(props) {
    const { onClick, onHover, onZoom, hlPoint } = props;

    const svgProperties = {
        onClick: () => onClick,
        onWheel: ({ valX }) => evt => {
            if (!hlPoint && !(evt.currentTarget && evt.currentTarget.offsetParent)) {
                return;
            }

            const position = hlPoint
                ? hlPoint.get(0)
                : valX(evt.pageX - evt.currentTarget.offsetParent.offsetLeft);

            onZoom({ direction: evt.deltaY / Math.abs(evt.deltaY), position });

            evt.preventDefault();
        }
    };

    const outerProperties = {
        onMouseMove: ({ valX, valY }) => ({ pageX, pageY, currentTarget }) => {
            const { left, top } = currentTarget.getBoundingClientRect();

            onHover({
                valX: valX(pageX - left),
                valY: valY(pageY - top)
            });
        },
        onMouseOut: () => () => onHover(null)
    };

    const after = <AfterCanvas {...props} />;

    const graphProps = {
        padding: [36, 0, 0, 0],
        after,
        svgProperties,
        outerProperties,
        ...processData(props),
        ...props
    };

    return <LineGraph {...graphProps} />;
}

GraphFunds.propTypes = {
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

const mapStateToProps = state => ({
    name: 'fund-history',
    width: GRAPH_FUNDS_WIDTH,
    height: GRAPH_FUNDS_HEIGHT,
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

