/*
 * Graph general cash flow (balance over time)
 */

import { Map as map, List as list } from 'immutable';
import { connect } from 'react-redux';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LineGraph } from './LineGraph';
import { formatCurrency, getTickSize, formatAge } from '../../misc/format';
import { rgba } from '../../misc/color';
import {
    GRAPH_FUNDS_WIDTH, GRAPH_FUNDS_HEIGHT,
    GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_NUM_TICKS, GRAPH_FUNDS_PERIODS
} from '../../misc/const';
import {
    GRAPH_FUNDS_TENSION, GRAPH_FUNDS_MODES, GRAPH_FUNDS_POINT_RADIUS,
    COLOR_DARK, COLOR_PROFIT_LIGHT, COLOR_LOSS_LIGHT, COLOR_LIGHT_GREY,
    COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_DARK,
    FONT_AXIS_LABEL, FONT_GRAPH_TITLE
} from '../../misc/config';
import {
    aFundsGraphClicked, aFundsGraphZoomed, aFundsGraphHovered,
    aFundsGraphLineToggled, aFundsGraphPeriodChanged
} from '../../actions/GraphActions';

export class GraphFunds extends LineGraph {
    constructor(props) {
        super(props);

        this.padding = [36, 0, 0, 0];
        this.tension = GRAPH_FUNDS_TENSION;
        this.canvasProperties = {
            onClick: () => this.props.onClick(),
            onWheel: evt => {
                const position = this.props.hlPoint
                    ? this.props.hlPoint.get(0)
                    : this.valX(evt.pageX - evt.currentTarget.offsetParent.offsetLeft);

                this.props.zoomGraph({
                    direction: evt.deltaY / Math.abs(evt.deltaY),
                    position
                });
                evt.preventDefault();
            }
        };
        this.outerProperties = {
            onMouseMove: evt => {
                const rect = evt.currentTarget.getBoundingClientRect();
                const valX = this.valX(evt.pageX - rect.left);
                const valY = this.valY(evt.pageY - rect.top);

                this.props.onHover({ valX, valY });
            },
            onMouseOut: () => {
                this.props.onHover(null);
            }
        };
    }
    update() {
        if (!this.props.fundLines || this.props.cacheTimes.size < 2) {
            return;
        }

        this.processData();
        this.draw();
    }
    setRangeValues() {
        const minX = this.props.zoom.get(0);
        const maxX = this.props.zoom.get(1);

        const valuesY = this.props.fundLines.map(line => {
            return line
                .get('line')
                .map(item => item.get(1));
        });

        let minY = valuesY.reduce((min, line) => Math.min(min, line.min()), Infinity);
        let maxY = valuesY.reduce((max, line) => Math.max(max, line.max()), -Infinity);

        if (minY === maxY) {
            minY -= 0.5;
            maxY += 0.5;
        }
        if (this.props.mode === GRAPH_FUNDS_MODE_ROI && minY === 0) {
            minY = -maxY * 0.2;
        }

        // get the tick size for the new range
        this.tickSizeY = getTickSize(minY, maxY, GRAPH_FUNDS_NUM_TICKS);
        if (isNaN(this.tickSizeY)) {
            this.setRange([minX, maxX, minY, maxY]);
        }
        else {
            this.setRange([
                minX, maxX,
                this.tickSizeY * Math.floor(minY / this.tickSizeY),
                this.tickSizeY * Math.ceil(maxY / this.tickSizeY)
            ]);
        }
    }
    processData() {
        this.setRangeValues();
        this.draw();
    }
    formatValue(value) {
        if (this.props.mode === GRAPH_FUNDS_MODE_ROI) {
            return `${value.toFixed(2)}%`;
        }

        return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
    }
    drawProfitLossBackground() {
        if (this.props.mode !== GRAPH_FUNDS_MODE_ROI) {
            return;
        }

        const zero = this.pixY(Math.min(Math.max(0, this.minY), this.maxY));
        if (this.maxY > 0) {
            this.ctx.fillStyle = rgba(COLOR_PROFIT_LIGHT);
            const y0 = this.pixY(this.maxY);
            this.ctx.fillRect(this.pixX(this.minX), y0, this.pixX(this.maxX), zero - y0);
        }
        if (this.minY < 0) {
            this.ctx.fillStyle = rgba(COLOR_LOSS_LIGHT);
            this.ctx.fillRect(
                this.pixX(this.minX),
                zero,
                this.pixX(this.maxX),
                this.pixY(this.minY) - zero
            );
        }
    }
    calculateTicksY() {
        // calculate tick range
        const numTicks = isNaN(this.tickSizeY)
            ? 0
            : Math.floor((this.maxY - this.minY) / this.tickSizeY);

        if (!numTicks) {
            return [];
        }

        return new Array(numTicks)
            .fill(0)
            .map((item, key) => {
                const value = this.minY + (key + 1) * this.tickSizeY;
                const pos = Math.floor(this.pixY(value)) + 0.5;

                return { value, pos };
            });
    }
    drawTicksY(ticksY, axisTextColor) {
        // draw horizontal lines
        this.ctx.strokeStyle = rgba(COLOR_LIGHT_GREY);
        ticksY.forEach(tick => {
            // draw horizontal line
            this.ctx.beginPath();
            this.ctx.moveTo(this.pixX(this.minX), tick.pos);
            this.ctx.lineTo(this.pixX(this.maxX), tick.pos);
            this.ctx.stroke();
            this.ctx.closePath();
        });

        // draw Y axis
        this.ctx.fillStyle = axisTextColor;
        this.ctx.textBaseline = 'bottom';
        this.ctx.textAlign = 'right';
        this.ctx.font = FONT_AXIS_LABEL;

        ticksY.forEach(tick => {
            const tickName = this.formatValue(tick.value, true, true);
            this.ctx.fillText(tickName, this.pixX(this.maxX), tick.pos);
        });
    }
    drawTimeTicks(axisTextColor) {
        const timeTicks = this.getTimeScale(this.props.startTime);

        this.ctx.font = FONT_AXIS_LABEL;
        this.ctx.fillStyle = axisTextColor;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';

        const tickAngle = -Math.PI / 6;
        const tickSize = 10;

        const y0 = this.pixY(this.minY);

        timeTicks.forEach(tick => {
            const thisTickSize = tickSize * 0.5 * (tick.major + 1);

            this.ctx.beginPath();
            this.ctx.strokeStyle = tick.major
                ? rgba(COLOR_GRAPH_TITLE)
                : rgba(COLOR_DARK);
            this.ctx.moveTo(tick.pix, y0);
            this.ctx.lineTo(tick.pix, y0 - thisTickSize);
            this.ctx.stroke();
            this.ctx.closePath();

            if (tick.major > 1) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = rgba(COLOR_LIGHT_GREY);
                this.ctx.moveTo(tick.pix, y0 - thisTickSize);
                this.ctx.lineTo(tick.pix, this.padY1);
                this.ctx.stroke();
                this.ctx.closePath();
            }

            if (tick.text) {
                this.ctx.save();
                this.ctx.translate(tick.pix, y0 - thisTickSize);
                this.ctx.rotate(tickAngle);
                this.ctx.fillText(tick.text, 0, 0);
                this.ctx.restore();
            }
        });
    }
    drawAxes() {
        const axisTextColor = rgba(COLOR_DARK);

        this.ctx.lineWidth = 1;

        this.drawProfitLossBackground();

        const ticksY = this.calculateTicksY();

        this.drawTicksY(ticksY, axisTextColor);

        this.drawTimeTicks(axisTextColor);
    }
    drawData() {
        // plot past data
        this.props.fundLines.forEach(line => {
            const mainLine = line.get('index') === 0;

            const color = rgba(this.props.fundItems.getIn([line.get('index'), 'color']));

            this.ctx.lineWidth = mainLine
                ? 1.5
                : 1;

            if (this.props.mode === GRAPH_FUNDS_MODE_ROI) {
                return this.drawCubicLine(line.get('line'), [color]);
            }

            return this.drawLine(line.get('line'), [color]);
        });

        if (this.props.hlPoint) {
            const hlPixX = this.pixX(this.props.hlPoint.get(0));
            const hlPixY = this.pixY(this.props.hlPoint.get(1));
            this.ctx.beginPath();
            this.ctx.moveTo(hlPixX, hlPixY);
            this.ctx.arc(hlPixX, hlPixY, GRAPH_FUNDS_POINT_RADIUS, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.props.hlPoint.get(2);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
    drawLabel() {
        if (this.props.hlPoint) {
            const ageSeconds = new Date().getTime() / 1000 -
                   (this.props.hlPoint.get(0) + this.props.startTime);
            const ageText = formatAge(ageSeconds);
            const valueText = this.formatValue(this.props.hlPoint.get(1));
            const labelText = `${ageText}: ${valueText}`;

            const paddingX = 2;
            const paddingY = 1;
            let alignLeft = true;
            const pixX = this.pixX(this.props.hlPoint.get(0));
            if (pixX > this.width / 2) {
                alignLeft = false;
            }
            const pixY = this.pixY(this.props.hlPoint.get(1));

            this.ctx.font = FONT_GRAPH_TITLE;
            this.ctx.textAlign = alignLeft
                ? 'left'
                : 'right';
            this.ctx.textBaseline = 'top';

            const labelWidth = this.ctx.measureText(labelText).width + 2 * paddingX;
            this.ctx.fillStyle = rgba(COLOR_TRANSLUCENT_DARK);
            const left = alignLeft
                ? pixX
                : pixX - labelWidth;
            this.ctx.fillRect(left, pixY, labelWidth, parseInt(this.ctx.font, 10) + 2 * paddingY);

            this.ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);
            const align = alignLeft
                ? 1
                : -1;
            this.ctx.fillText(labelText, pixX + paddingX * align, pixY + paddingY);
        }
    }
    draw() {
        if (!this.supported) {
            return;
        }
        // clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.drawAxes();
        this.drawData();
        this.drawLabel();
    }
    afterCanvas() {
        const fundLineToggles = this.props.fundItems
            ? this.props.fundItems.map((item, key) => {
                const className = classNames({ enabled: item.get('enabled') });
                const onClick = () => this.props.toggleLine(key);
                const style = {
                    borderColor: rgba(item.get('color'))
                };

                return <li key={key} className={className} onClick={onClick}>
                    <span className="checkbox" style={style}></span>
                    <span className="fund">{item.get('item')}</span>
                </li>;
            })
            : null;

        const onChange = evt => this.props.changePeriod({
            shortPeriod: evt.target.value,
            reloadPagePrices: false
        });

        const periodOptions = GRAPH_FUNDS_PERIODS.map((period, key) => {
            return <option key={key} value={period[0]}>{period[1]}</option>;
        });

        return <div>
            <ul className="fund-sidebar noselect">
                <li>
                    <select defaultValue={this.props.period} onChange={onChange}>
                        {periodOptions}
                    </select>
                </li>
                {fundLineToggles}
            </ul>
            <span className="mode">
      Mode:&nbsp;{GRAPH_FUNDS_MODES[this.props.mode]}
            </span>
        </div>;
    }
}

GraphFunds.propTypes = {
    fundHistoryCache: PropTypes.instanceOf(map),
    fundItems: PropTypes.instanceOf(list),
    fundLines: PropTypes.instanceOf(list),
    startTime: PropTypes.number,
    cacheTimes: PropTypes.instanceOf(list),
    funds: PropTypes.instanceOf(list),
    mode: PropTypes.number,
    period: PropTypes.string,
    showOverall: PropTypes.bool,
    zoom: PropTypes.instanceOf(list),
    hlPoint: PropTypes.instanceOf(list)
};

const mapStateToProps = state => ({
    name: 'fund-history',
    width: GRAPH_FUNDS_WIDTH,
    height: GRAPH_FUNDS_HEIGHT,
    fundHistoryCache: state.getIn(['global', 'other', 'fundHistoryCache']),
    fundItems: state.getIn(['global', 'other', 'graphFunds', 'data', 'fundItems']),
    fundLines: state.getIn(['global', 'other', 'graphFunds', 'data', 'fundLines']),
    startTime: state.getIn(['global', 'other', 'graphFunds', 'startTime']),
    cacheTimes: state.getIn(['global', 'other', 'graphFunds', 'cacheTimes']),
    mode: state.getIn(['global', 'other', 'graphFunds', 'mode']),
    period: state.getIn(['global', 'other', 'graphFunds', 'period']),
    showOverall: state.getIn(['global', 'other', 'graphFunds', 'showOverall']),
    zoom: state.getIn(['global', 'other', 'graphFunds', 'zoom']),
    hlPoint: state.getIn(['global', 'other', 'graphFunds', 'hlPoint'])
});

const mapDispatchToProps = dispatch => ({
    onHover: position => dispatch(aFundsGraphHovered(position)),
    toggleLine: key => dispatch(aFundsGraphLineToggled(key)),
    changePeriod: req => dispatch(aFundsGraphPeriodChanged(req)),
    onClick: () => dispatch(aFundsGraphClicked()),
    zoomGraph: req => dispatch(aFundsGraphZoomed(req))
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphFunds);

