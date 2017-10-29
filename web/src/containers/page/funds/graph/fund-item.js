/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import classNames from 'classnames';
import LineGraph from '../../../../components/graph/line';
import { rgba } from '../../../../misc/color';
import {
    PAGES, GRAPH_FUND_ITEM_WIDTH, GRAPH_FUND_ITEM_WIDTH_LARGE,
    GRAPH_FUND_ITEM_HEIGHT, GRAPH_FUND_ITEM_HEIGHT_LARGE
} from '../../../../misc/const';
import {
    COLOR_LOSS, COLOR_PROFIT, COLOR_DARK, FONT_AXIS_LABEL
} from '../../../../misc/config';
import { aFundItemGraphToggled } from '../../../../actions/GraphActions';

export class GraphFundItem extends LineGraph {
    constructor(props) {
        super(props);

        this.canvasProperties = {
            onClick: () => this.props.togglePopout(this.props.id)
        };
    }
    canvasClasses() {
        return classNames({ popout: this.props.popout });
    }
    update() {
        this.processData();
        this.draw();
    }
    getWidth() {
        if (this.props.popout) {
            return GRAPH_FUND_ITEM_WIDTH_LARGE;
        }

        return GRAPH_FUND_ITEM_WIDTH;
    }
    getHeight() {
        if (this.props.popout) {
            return GRAPH_FUND_ITEM_HEIGHT_LARGE;
        }

        return GRAPH_FUND_ITEM_HEIGHT;
    }
    processData() {
        const dataY = this.props.data.map(item => item.last());
        const dataX = this.props.data.map(item => item.first());

        const minY = dataY.min();
        const maxY = dataY.max();
        const minX = dataX.min();
        const maxX = dataX.max();

        this.setRange([minX, maxX, minY, maxY]);

        this.width = this.getWidth();
        this.height = this.getHeight();
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

            if (numTicks > 0) {
                new Array(numTicks)
                    .fill(0)
                    .forEach((tick, key) => {
                        const tickValue = start + key * increment;
                        const tickPos = Math.floor(this.pixY(tickValue)) + 0.5;
                        const tickName = `${tickValue.toFixed(1)}p`;
                        this.ctx.fillText(tickName, this.pixX(this.minX), tickPos);
                    });
            }
        }

        // plot data
        this.ctx.lineWidth = 1.5;

        const initialValue = this.props.data.getIn([0, 1]);

        const colorLoss = rgba(COLOR_LOSS);
        const colorProfit = rgba(COLOR_PROFIT);
        const colorValue = value => {
            if (value < initialValue) {
                return colorLoss;
            }

            return colorProfit;
        };

        this.drawCubicLine(this.props.data, colorValue);
    }
}

GraphFundItem.propTypes = {
    id: PropTypes.number.isRequired,
    data: PropTypes.instanceOf(list).isRequired,
    popout: PropTypes.bool.isRequired
};

const pageIndex = PAGES.indexOf('funds');

const mapStateToProps = (state, ownProps) => ({
    data: state.getIn(['pages', pageIndex, 'rows', ownProps.id, 'prices']) || list.of(),
    popout: Boolean(state.getIn(['pages', pageIndex, 'rows', ownProps.id, 'historyPopout']))
});

const mapDispatchToProps = dispatch => ({
    togglePopout: id => dispatch(aFundItemGraphToggled(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphFundItem);

