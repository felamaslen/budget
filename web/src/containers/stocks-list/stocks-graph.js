/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import LineGraph from '../../components/graph/line';
import { rgba } from '../../helpers/color';

import { GRAPH_STOCKS_WIDTH, GRAPH_STOCKS_HEIGHT, FONT_AXIS_LABEL } from '../../constants/graph';
import { COLOR_PROFIT, COLOR_LOSS, COLOR_LIGHT } from '../../constants/colors';

export class GraphStocks extends LineGraph {
    update() {
        if (this.props.data.size < 2) {
            return;
        }
        this.processData();
        this.draw();
    }
    processData() {
        const dataY = this.props.data.map(item => item.last());
        const dataX = this.props.data.map(item => item.first());

        let minY = dataY.min();
        let maxY = dataY.max();
        if (maxY - minY === 0) {
            maxY += 0.01;
            minY -= 0.01;
        }
        const minX = dataX.min();
        const maxX = dataX.max();

        this.setRange([minX, maxX, minY, maxY]);
    }
    drawAxes() {
        // draw axes
        this.ctx.font = FONT_AXIS_LABEL;
        this.ctx.fillStyle = rgba(COLOR_LIGHT);
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';

        // draw time (X axis) ticks
        const y0 = this.pixY(this.minY);
        const tickAngle = -Math.PI / 6;
        const timeTicks = this.getTimeScale(0);
        timeTicks.forEach(tick => {
            if (tick.text) {
                this.ctx.save();
                this.ctx.translate(tick.pix, y0);
                this.ctx.rotate(tickAngle);
                this.ctx.fillText(tick.text, 0, 0);
                this.ctx.restore();
            }
        });
    }
    draw() {
        if (!this.supported) {
            return;
        }

        // clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawAxes();

        this.ctx.lineWidth = 1;
        const colorLoss = rgba(COLOR_LOSS);
        const colorProfit = rgba(COLOR_PROFIT);
        const valueColor = value => {
            if (value < 0) {
                return colorLoss;
            }

            return colorProfit;
        };
        this.drawLine(this.props.data, valueColor);
    }
}

GraphStocks.propTypes = {
    data: PropTypes.instanceOf(list)
};

const mapStateToProps = state => ({
    width: GRAPH_STOCKS_WIDTH,
    height: GRAPH_STOCKS_HEIGHT,
    data: state.getIn(['other', 'stocksList', 'history'])
});

export default connect(mapStateToProps)(GraphStocks);

