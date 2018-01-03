/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import connect, { GraphCashFlow } from './cash-flow';

import { aShowAllToggled } from '../../../../actions/graph.actions';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { rgba } from '../../../../misc/color';
import {
    COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED, COLOR_BALANCE_STOCKS,
    COLOR_DARK, COLOR_PROFIT, COLOR_LOSS,
    FONT_GRAPH_KEY_SMALL
} from '../../../../misc/config';

export class GraphBalance extends GraphCashFlow {
    setRanges() {
        const dataY = this.dataBalance.map(item => item.last());
        const dataX = this.dataBalance.map(item => item.first());

        const minYValue = dataY.min();
        const minY = Math.min(0, minYValue);
        const maxY = dataY.max();
        const minX = dataX.min();
        const maxX = dataX.max();

        this.setRange([minX, maxX, minY, maxY]);
    }
    processData() {
        // this doesn't really modify the data, it just puts it in a form ready for drawing

        // futureKey is used to separate past from future data
        const futureKey = this.props.oldOffset + this.getFutureKey();

        this.dataBalance = this.getValuesWithTime(this.props.balance);

        this.dataFunds = this.props.funds.map((value, key) => {
            return list([this.dataBalance.getIn([key, 0]), value]);
        });

        // for changing the colour
        this.colorTransition = [futureKey - 1];
        this.setRanges();
    }
    drawTitle() {
        return super.drawTitle('Balance');
    }
    drawKeyFunds() {
        this.ctx.fillText('Stocks', 78, 57);
        this.ctx.fillStyle = rgba(COLOR_BALANCE_STOCKS);
        this.ctx.fillRect(50, 54, 24, 6);
    }
    drawKeyActual() {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = rgba(COLOR_BALANCE_ACTUAL);
        this.ctx.moveTo(50, 40);
        this.ctx.lineTo(74, 40);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.font = FONT_GRAPH_KEY_SMALL;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = rgba(COLOR_DARK);
        this.ctx.fillText('Actual', 78, 40);
    }
    drawKeyPredicted() {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = rgba(COLOR_BALANCE_PREDICTED);
        this.ctx.moveTo(130, 40);
        this.ctx.lineTo(154, 40);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.fillText('Predicted', 158, 40);
    }
    drawKey() {
        super.drawKey();

        this.drawKeyActual();
        this.drawKeyPredicted();
        this.drawKeyFunds();
    }
    drawFundsLine() {
        // plot funds data
        this.ctx.lineWidth = 2;
        this.drawCubicLine(
            this.dataFunds,
            [rgba(COLOR_BALANCE_STOCKS)],
            {
                fill: true,
                stroke: false,
                tension: 1
            }
        );
    }
    drawSpending() {
        this.ctx.lineWidth = 1;

        const now = Math.floor(Date.now() / 1000);
        const y0 = this.pixY(0);

        this.props.dailyCashflow.forEach((item, index) => {
            const color = item < 0
                ? COLOR_LOSS
                : COLOR_PROFIT;

            const value = Math.abs(item);

            const xPix = Math.floor(this.pixX(now - index * 86400)) + 0.5;
            const yPix = this.pixY(value);

            this.ctx.strokeStyle = rgba(color);
            this.ctx.beginPath();
            this.ctx.moveTo(xPix, y0);
            this.ctx.lineTo(xPix, yPix);

            this.ctx.stroke();
        });
    }
    draw() {
        super.draw();

        // plot past + future predicted data
        this.ctx.lineWidth = 2;
        this.drawCubicLine(
            this.dataBalance,
            [rgba(COLOR_BALANCE_ACTUAL), rgba(COLOR_BALANCE_PREDICTED)]
        );

        // plot past + future predicted ISA stock value
        this.drawFundsLine();

        this.drawSpending();

        this.drawKey();
    }
    afterCanvas() {
        const showAllClasses = classNames({
            'show-all': true,
            noselect: true,
            enabled: this.props.showAll
        });

        const showAll = () => this.props.toggleShowAll();

        return <span className={showAllClasses} onClick={showAll}>
            <span>Show all</span>
            <a className="checkbox" />
        </span>;
    }
}

GraphBalance.propTypes = {
    showAll: PropTypes.bool.isRequired,
    balance: PropTypes.instanceOf(list).isRequired,
    funds: PropTypes.instanceOf(list).isRequired,
    toggleShowAll: PropTypes.func.isRequired,
    dailyCashflow: PropTypes.instanceOf(list).isRequired
};

function getBalanceWithFunds(cost, showAll) {
    let oldOffset = 0;
    let balance = cost.get('balanceWithPredicted');
    let funds = cost.get('funds');

    if (showAll) {
        oldOffset = cost.get('old').size;
        balance = cost.get('old').concat(balance);
        funds = cost.get('fundsOld').concat(funds);
    }

    return { oldOffset, balance, funds };
}

const mapStateToProps = () => state => {
    const showAll = state.getIn(['other', 'showAllBalanceGraph']);

    const cost = state.getIn(['pages', 'overview', 'data', 'cost']);
    const dailyCashflow = state.getIn(['pages', 'overview', 'data', 'dailyCashflow']);
    const { oldOffset, balance, funds } = getBalanceWithFunds(cost, showAll);

    return {
        showAll,
        oldOffset,
        balance,
        funds,
        breakAtToday: true,
        dailyCashflow
    };
};

const mapDispatchToProps = () => dispatch => ({
    toggleShowAll: () => dispatch(aShowAllToggled())
});

export default connect()(
    mapStateToProps, mapDispatchToProps
)(GraphBalance);

