/*
 * Graph net cash flow (spending over time)
 */

import { List as list } from 'immutable';
import connect, { GraphCashFlow } from './cash-flow';

import PropTypes from 'prop-types';

import { rgba } from '../../../../misc/color';
import {
    PAGES, GRAPH_SPEND_CATEGORIES, OVERVIEW_COLUMNS,
    GRAPH_KEY_OFFSET_X, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE
} from '../../../../misc/const';
import {
    COLOR_DARK, COLOR_CATEGORY,
    COLOR_LOSS, COLOR_PROFIT, COLOR_TRANSLUCENT_LIGHT, COLOR_SPENDING,
    FONT_GRAPH_KEY_SMALL, FONT_GRAPH_KEY
} from '../../../../misc/config';

export class GraphSpend extends GraphCashFlow {
    setRanges() {
        const dataYNet = this.dataNet.map(item => item.last());
        const dataX = this.dataNet.map(item => item.first());

        const minYValue = dataYNet.min();
        const minY = Math.min(0, minYValue);
        const maxY = dataYNet.max();
        const minX = dataX.min();
        const maxX = dataX.max();

        this.setRange([minX, maxX, minY, maxY]);
    }
    processData() {
        this.dataNet = this.getValuesWithTime(this.props.dataNet);
        this.dataSpending = this.getValuesWithTime(this.props.dataSpending);

        this.setRanges();
    }
    drawFutureArea() {
        const future0 = this.pixX(Date.now() / 1000);
        const future1 = this.pixY(this.maxY);
        const futureW = this.pixX(this.maxX) - future0;
        const futureH = this.pixY(this.minY) - future1;

        this.ctx.beginPath();
        this.ctx.fillStyle = rgba(COLOR_TRANSLUCENT_LIGHT);
        this.ctx.fillRect(future0, future1, futureW, futureH);
    }
    drawKeySpending() {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = rgba(COLOR_SPENDING);
        this.ctx.moveTo(50, 40);
        this.ctx.lineTo(74, 40);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.font = FONT_GRAPH_KEY_SMALL;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = rgba(COLOR_DARK);
        this.ctx.fillText('Spending', 78, 40);
    }
    drawKey() {
        super.drawKey();

        this.drawKeySpending();

        this.drawFutureArea();

        this.ctx.textBaseline = 'middle';
        this.ctx.font = FONT_GRAPH_KEY;

        this.props.categories.forEach(category => {
            const humanName = OVERVIEW_COLUMNS.find(item => item[0] === category.name)[1];
            this.ctx.fillStyle = rgba(COLOR_DARK);
            this.ctx.fillText(humanName, GRAPH_KEY_OFFSET_X + category.key, 40);

            this.ctx.fillStyle = rgba(COLOR_CATEGORY[category.name]);
            this.ctx.fillRect(
                GRAPH_KEY_OFFSET_X + category.key - 15,
                GRAPH_KEY_OFFSET_Y,
                GRAPH_KEY_SIZE,
                GRAPH_KEY_SIZE
            );
        });
    }
    drawArrow(xPix, value) {
        const color = value > 0
            ? rgba(COLOR_PROFIT)
            : rgba(COLOR_LOSS);

        const direction = value > 0
            ? 1
            : -1;

        const sizeRatio = value > 0
            ? value / this.maxY
            : value / this.minY;

        const arrowWidth = 6 * (sizeRatio + 0.5);
        const arrowHeight = 10 * (sizeRatio + 0.5);

        this.ctx.beginPath();

        this.ctx.moveTo(xPix, this.pixY(0));
        this.ctx.lineTo(xPix, this.pixY(value) + direction * arrowHeight / 2);

        this.ctx.lineWidth = 3 * sizeRatio;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        // draw the arrow head
        this.ctx.beginPath();

        this.ctx.moveTo(xPix - arrowWidth, this.pixY(value) + direction * arrowHeight);
        this.ctx.lineTo(xPix, this.pixY(value));
        this.ctx.lineTo(xPix + arrowWidth, this.pixY(value) + direction * arrowHeight);
        this.ctx.lineTo(xPix, this.pixY(value) + direction * arrowHeight * 0.7);

        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    drawCashFlowArrows() {
        this.dataNet.forEach(point => {
            this.drawArrow(this.pixX(point.get(0)), point.get(1));
        });
    }
    drawData() {
        // plot data
        this.ctx.lineWidth = 2;
        this.drawCubicLine(this.dataSpending, [rgba(COLOR_SPENDING)]);

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawCashFlowArrows();
    }
    drawTitle() {
        return super.drawTitle('Cash flow');
    }
    draw() {
        super.draw();

        if (!this.supported) {
            return;
        }

        this.drawData();
        this.drawKey();
    }
}

GraphSpend.propTypes = {
    categories: PropTypes.instanceOf(list).isRequired,
    dataNet: PropTypes.instanceOf(list).isRequired,
    dataSpending: PropTypes.instanceOf(list).isRequired
};

const mapStateToProps = pageIndex => state => ({
    categories: list(GRAPH_SPEND_CATEGORIES),
    dataNet: GRAPH_SPEND_CATEGORIES.reduce((data, category) => {
        return data.map((item, key) => {
            const cost = state.getIn(['pages', pageIndex, 'data', 'cost', category.name, key]);

            return item - cost;
        });
    }, state.getIn(['pages', pageIndex, 'data', 'cost', 'income'])),
    dataSpending: GRAPH_SPEND_CATEGORIES.reduce((data, category) => {
        return data.map((item, key) => {
            const cost = state
                .getIn(['pages', pageIndex, 'data', 'cost', category.name, key]);

            return item + cost;
        });
    }, state
        .getIn(['pages', pageIndex, 'data', 'cost', 'income'])
        .map(() => 0)
    )
});

export default connect(PAGES.indexOf('overview'))(mapStateToProps)(GraphSpend);

