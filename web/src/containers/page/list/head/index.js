import extendableContainer from '../../../container-extender';

import React from 'react';
import PureComponent from '../../../../immutable-component';
import PropTypes from 'prop-types';

import { formatCurrency } from '../../../../misc/format';
import { PAGES } from '../../../../misc/const';

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
        const { page, weeklyValue, daily, totalCost } = this.props;

        const weeklyValueFormatted = formatCurrency(weeklyValue, {
            abbreviate: true,
            precision: 1
        });

        const dailyValues = daily
            ? <span>
                <span className="daily">Daily</span>
                <span className="weekly">Weekly:</span>
                <span className="weekly-value">{weeklyValueFormatted}</span>
            </span>
            : null;

        const totalValue = formatCurrency(totalCost, {
            abbreviate: true,
            precision: 1
        });

        return <div className="list-head-inner noselect">
            {this.renderListHeadMain(PAGES[page].cols)}
            {dailyValues}
            <span className="total">{'Total:'}</span>
            <span className="total-value">{totalValue}</span>
            {this.listHeadExtra()}
        </div>;
    }
}

Head.propTypes = {
    page: PropTypes.string.isRequired,
    weeklyValue: PropTypes.number,
    daily: PropTypes.bool,
    totalCost: PropTypes.number
};

const stateDefault = page => state => ({
    page,
    weeklyValue: state.getIn(['pages', page, 'data', 'weekly']),
    daily: Boolean(PAGES[page].daily),
    totalCost: state.getIn(['pages', page, 'data', 'total'])
});

const dispatchDefault = () => () => ({});

export const HeadContainer = page =>
    extendableContainer(stateDefault, dispatchDefault)(page)()(Head);

export default extendableContainer(stateDefault, dispatchDefault);

