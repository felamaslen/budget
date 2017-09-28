import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '../../misc/format';
import { LIST_COLS_PAGES, DAILY_PAGES } from '../../misc/const';

export class Head extends PureComponent {
    renderListHeadMain(columns) {
        return columns.map((column, key) => {
            return <span key={key} className={column}>{column}</span>;
        });
    }
    listHeadExtra() {
        return null;
    }
    render() {
        const weeklyValue = formatCurrency(this.props.weeklyValue, {
            abbreviate: true,
            precision: 1
        });

        const daily = this.props.daily
            ? <span>
                <span className="daily">Daily</span>
                <span className="weekly">Weekly:</span>
                <span className="weekly-value">{weeklyValue}</span>
            </span>
            : null;

        const totalValue = formatCurrency(this.props.totalCost, {
            abbreviate: true,
            precision: 1
        });

        return <div className="list-head noselect">
            {this.renderListHeadMain(LIST_COLS_PAGES[this.props.pageIndex])}
            {daily}
            <span className="total">Total:</span>
            <span className="total-value">{totalValue}</span>
            {this.listHeadExtra()}
        </div>;
    }
}

Head.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    weeklyValue: PropTypes.number,
    daily: PropTypes.bool,
    totalCost: PropTypes.number
};

const mapStateToProps = (state, ownProps) => ({
    weeklyValue: state.getIn(['global', 'pages', ownProps.pageIndex, 'data', 'weekly']),
    daily: DAILY_PAGES[ownProps.pageIndex],
    totalCost: state.getIn(['global', 'pages', ownProps.pageIndex, 'data', 'total'])
});

export default connect(mapStateToProps)(Head);

