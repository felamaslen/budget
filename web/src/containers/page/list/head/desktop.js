import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import ListHeadExtra from './extra';
import { formatCurrency } from '../../../../misc/format';
import { PAGES } from '../../../../misc/const';

export function ListHeadDesktop({ page, weeklyValue, daily, totalCost }) {
    const weeklyValueFormatted = formatCurrency(weeklyValue, {
        abbreviate: true,
        precision: 1
    });

    const dailyValues = daily
        ? <span>
            <span className="daily">{'Daily'}</span>
            <span className="weekly">{'Weekly:'}</span>
            <span className="weekly-value">{weeklyValueFormatted}</span>
        </span>
        : null;

    const totalValue = formatCurrency(totalCost, {
        abbreviate: true,
        precision: 1
    });

    const listHead = PAGES[page].cols.map((column, key) => {
        return <span key={key} className={column}>{column}</span>;
    });

    return <div className="list-head-inner noselect">
        {listHead}
        {dailyValues}
        <span className="total">{'Total:'}</span>
        <span className="total-value">{totalValue}</span>
        <ListHeadExtra page={page} />
    </div>;
}

ListHeadDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    weeklyValue: PropTypes.number,
    daily: PropTypes.bool,
    totalCost: PropTypes.number
};

const mapStateToProps = (state, { page }) => ({
    weeklyValue: state.getIn(['pages', page, 'data', 'weekly']),
    daily: Boolean(PAGES[page].daily),
    totalCost: state.getIn(['pages', page, 'data', 'total'])
});

export default connect(mapStateToProps)(ListHeadDesktop);

