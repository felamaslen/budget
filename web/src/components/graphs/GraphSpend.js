/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { LineGraph } from './LineGraph';
import { formatCurrency, getTickSize } from '../../misc/format';
import { rgba } from '../../misc/color';
import { getKeyFromYearMonth } from '../../misc/data';
import {
    MONTHS_SHORT, OVERVIEW_COLUMNS, PAGES,
    GRAPH_WIDTH, GRAPH_HEIGHT,
    GRAPH_SPEND_CATEGORIES
} from '../../misc/const';
import {
    COLOR_CATEGORY,
    COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_LIGHT, COLOR_TRANSLUCENT_DARK,
    COLOR_DARK, COLOR_LIGHT_GREY,
    COLOR_PROFIT,
    FONT_GRAPH_TITLE, FONT_GRAPH_KEY, FONT_AXIS_LABEL,
    GRAPH_SPEND_NUM_ITEMS,
    GRAPH_KEY_OFFSET_X, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE
} from '../../misc/config';

export class GraphSpend extends LineGraph {
    update() {
        this.processData();
        this.padding = [48, 0, 45, 0];
        this.draw();
    }
    processData() {
        this.currentYearMonthKey = getKeyFromYearMonth(
            this.props.currentYearMonth[0], this.props.currentYearMonth[1],
            this.props.yearMonths[0][0], this.props.yearMonths[0][1]
        );

        this.colors = this.props.categories.map(
            category => [rgba(COLOR_CATEGORY[category.name])]
        );

        // data is a list of columns
        this.data = this.props.data.first().map((point, monthKey) => {
            let sum = 0;

            return this.props.categories.map((category, categoryKey) => {
                const thisItem = Math.max(0, this.props.data.getIn([categoryKey, monthKey]));
                sum -= thisItem;

                return sum;
            }).reverse();
        });

        this.netFlows = this.props.income.map((item, key) => {
            return item + this.data.get(key).first();
        });

        const maxY = this.props.income.reduce(
            (max, value) => Math.max(max, value), -Infinity
        );

        const minY = this.data.reduce(
            (min, column) => Math.min(min, column.last()), Infinity
        );

        this.setRange([0, this.props.yearMonths.length + 1, minY, maxY]);
    }
    drawAxes() {
    // draw X axis ticks
        this.ctx.strokeStyle = rgba(COLOR_LIGHT_GREY);
        this.ctx.lineWidth = 1;

        const numTicksX = this.maxX - 1;
        if (!numTicksX) {
            return null;
        }

        const ticksX = new Array(numTicksX)
            .fill(0)
            .map((item, key) => {
                const tickPos = Math.floor(this.pixX(key + 1)) + 0.5;
                // draw vertical lines
                this.ctx.beginPath();
                this.ctx.moveTo(tickPos, this.pixY(this.maxY));
                this.ctx.lineTo(tickPos, this.pixY(this.minY) + 8 - 3 * (key % 2));
                this.ctx.stroke();

                return [key, tickPos];
            });

        // calculate tick range
        const tickSize = getTickSize(this.minY, this.maxY, 10);

        // draw Y axis ticks
        const numTicksY = Math.ceil((this.maxY - this.minY) / tickSize);
        if (!numTicksY) {
            return null;
        }

        const firstTick = Math.ceil(this.minY / tickSize) * tickSize;
        const ticksY = new Array(numTicksY)
            .fill(0)
            .map((item, key) => {
                const value = firstTick + key * tickSize;
                const pos = Math.floor(this.pixY(value)) + 0.5;

                return { value, pos };
            })
            .filter(tick => tick.value <= this.maxY);

        // draw horizontal lines
        ticksY.forEach(tick => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.pixX(this.minX), tick.pos);
            this.ctx.lineTo(this.pixX(this.maxX), tick.pos);
            this.ctx.stroke();
        });

        return { ticksX, ticksY, tickSize };
    }
    drawAxesTicks(axes) {
        if (!axes) {
            return;
        }

        this.ctx.font = FONT_AXIS_LABEL;
        this.ctx.textBaseline = 'bottom';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);

        axes.ticksY.forEach(tick => {
            const tickName = formatCurrency(tick.value, {
                raw: true, noPence: true, abbreviate: true, precision: 1
            });
            this.ctx.fillText(tickName, this.pixX(0), tick.pos);
        });

        // draw month ticks
        this.ctx.fillStyle = rgba(COLOR_DARK);
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'right';

        const tickAngle = -Math.PI * 0.29;
        const y0 = this.pixY(this.minY) + 10;
        axes.ticksX.forEach(tick => {
            const tickName = `${MONTHS_SHORT[this.props.yearMonths[tick[0]][1] - 1]}-${
                (this.props.yearMonths[tick[0]][0] % 100).toString()}`;

            this.ctx.save();
            this.ctx.translate(this.pixX(tick[0] + 1), y0);
            this.ctx.rotate(tickAngle);
            this.ctx.fillText(tickName, 0, 0);
            this.ctx.restore();
        });
    }
    drawFutureArea() {
        const future0 = this.pixX(this.currentYearMonthKey + 1);
        const future1 = this.pixY(this.maxY);
        const futureW = this.pixX(this.maxX) - future0;
        const futureH = this.pixY(this.minY) - future1;

        this.ctx.beginPath();
        this.ctx.fillStyle = rgba(COLOR_TRANSLUCENT_LIGHT);
        this.ctx.fillRect(future0, future1, futureW, futureH);

    }
    drawKey() {
        this.drawFutureArea();

        // background on key
        this.ctx.fillStyle = rgba(COLOR_TRANSLUCENT_DARK);
        this.ctx.fillRect(45, 0, 400, 48);
        this.ctx.closePath();

        // add title and key
        this.ctx.font = FONT_GRAPH_TITLE;
        this.ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        this.ctx.fillText('Cash flow', 65, 10);

        this.ctx.textBaseline = 'middle';
        this.ctx.font = FONT_GRAPH_KEY;

        this.props.categories.forEach(category => {
            const humanName = OVERVIEW_COLUMNS.find(item => item[0] === category.name)[1];
            this.ctx.fillStyle = rgba(COLOR_DARK);
            this.ctx.fillText(humanName, GRAPH_KEY_OFFSET_X + category.key, 40);

            this.ctx.fillStyle = rgba(COLOR_CATEGORY[category.name]);
            this.ctx.fillRect(
                GRAPH_KEY_OFFSET_X + category.key - 15, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE
            );
        });
    }
    drawArrow(xPix, value) {
        const color = rgba(COLOR_GRAPH_TITLE);

        this.ctx.beginPath();

        this.ctx.moveTo(xPix, this.pixY(0));
        this.ctx.lineTo(xPix, this.pixY(value));

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        // draw the arrow head
        const direction = value > 0
            ? 1
            : -1;

        const spreadWidth = 3;
        const spreadHeight = 6;

        this.ctx.beginPath();

        this.ctx.moveTo(xPix - spreadWidth, this.pixY(value) + direction * spreadHeight);
        this.ctx.lineTo(xPix, this.pixY(value));
        this.ctx.lineTo(xPix + spreadWidth, this.pixY(value) + direction * spreadHeight);
        this.ctx.lineTo(xPix, this.pixY(value) + direction * spreadHeight * 0.7);

        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    drawCashFlowArrows() {
        this.netFlows.forEach((value, key) => {
            const posX = this.pixX(key + 1);

            this.drawArrow(posX + 0.5, this.netFlows.get(key));
        });
    }
    drawData() {
    // plot data
        const y0 = this.pixY(0);

        this.data.forEach((column, monthKey) => {
            const posX = Math.round(this.pixX(monthKey + 1));

            // draw income bar
            const posY = this.pixY(this.props.income.get(monthKey));
            this.ctx.fillStyle = rgba(COLOR_PROFIT);
            this.ctx.fillRect(posX - 8, posY, 8, y0 - posY);

            // draw spending column
            const colors = this.colors.reverse();
            column.forEach((item, categoryKey) => {
                const thisPosY = Math.round(this.pixY(item)) + 0.5;
                this.ctx.fillStyle = colors.get(categoryKey);
                this.ctx.fillRect(posX, thisPosY, 8, y0 - thisPosY);
            });
        });

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawCashFlowArrows();
    }
    draw() {
        if (!this.supported) {
            return;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        const axes = this.drawAxes();
        this.drawData();
        this.drawAxesTicks(axes);
        this.drawKey();
    }
}

GraphSpend.propTypes = {
    data: PropTypes.instanceOf(list).isRequired,
    income: PropTypes.instanceOf(list).isRequired,
    categories: PropTypes.instanceOf(list).isRequired,
    yearMonths: PropTypes.array.isRequired,
    currentYearMonth: PropTypes.array.isRequired
};

const pageIndex = PAGES.indexOf('overview');

const mapStateToProps = state => ({
    width: GRAPH_WIDTH,
    height: GRAPH_HEIGHT,
    data: list(GRAPH_SPEND_CATEGORIES).map(item => state
        .getIn(['global', 'pages', pageIndex, 'data', 'cost', item.name])
        .slice(-GRAPH_SPEND_NUM_ITEMS)
    ),
    income: state
        .getIn(['global', 'pages', pageIndex, 'data', 'cost', 'income'])
        .slice(-GRAPH_SPEND_NUM_ITEMS),
    categories: list(GRAPH_SPEND_CATEGORIES),
    yearMonths: state
        .getIn(['global', 'pages', pageIndex, 'data', 'yearMonths'])
        .slice(-GRAPH_SPEND_NUM_ITEMS),
    currentYearMonth: state.getIn(['global', 'pages', pageIndex, 'data', 'currentYearMonth'])
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(GraphSpend);

