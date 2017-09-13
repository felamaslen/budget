/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LineGraph } from './LineGraph';
import { rgba } from '../../misc/color';
import {
    COLOR_LOSS, COLOR_PROFIT, COLOR_DARK, FONT_AXIS_LABEL
} from '../../misc/config';
import { aFundItemGraphToggled } from '../../actions/GraphActions';

export class GraphFundItem extends LineGraph {
    constructor(props) {
        super(props);
        this.canvasProperties = {
            onClick: () => {
                this.dispatchAction(aFundItemGraphToggled(this.props.rowKey));
            }
        };
    }
    canvasClasses() {
        return classNames({ popout: this.props.popout });
    }
    update() {
        this.processData();
        this.draw();
    }
    processData() {
        const dataY = this.props.data.map(item => item.last());
        const dataX = this.props.data.map(item => item.first());

        const minY = dataY.min();
        const maxY = dataY.max();
        const minX = dataX.min();
        const maxX = dataX.max();

        this.setRange([minX, maxX, minY, maxY]);

        this.width = this.props.width;
        this.height = this.props.height;
    }
    draw() {
        if (!this.supported) {
            return;
        }
        // clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // draw axes
        this.ctx.lineWidth = 1;
        if (this.props.popout) {
            this.ctx.fillStyle = rgba(COLOR_DARK);
            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = 'left';
            this.ctx.font = FONT_AXIS_LABEL;

            const range = this.maxY - this.minY;
            const increment = Math.round(Math.max(20, this.height / range) / (this.height / range) / 2) * 2;
            const start = Math.ceil(this.minY / increment) * increment;
            const numTicks = Math.ceil((this.maxY - this.minY) / increment);
            Array.apply(null, new Array(numTicks)).forEach((tick, key) => {
                const tickValue = start + key * increment;
                const tickPos = Math.floor(this.pixY(tickValue)) + 0.5;
                const tickName = `${tickValue.toFixed(1)}p`;
                this.ctx.fillText(tickName, this.pixX(this.minX), tickPos);
            });
        }

        // plot data
        this.ctx.lineWidth = 1.5;

        const initialValue = this.props.data.getIn([0, 1]);

        this.drawCubicLine(this.props.data, value => value < initialValue ? rgba(COLOR_LOSS) : rgba(COLOR_PROFIT));
    }
}

GraphFundItem.propTypes = {
    data: PropTypes.instanceOf(list),
    popout: PropTypes.bool,
    rowKey: PropTypes.number
};

