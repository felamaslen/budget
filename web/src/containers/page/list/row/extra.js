import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { PAGES } from '../../../../constants/data';
import { rgba } from '../../../../helpers/color';
import { formatCurrency, formatPercent } from '../../../../helpers/format';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import GraphFundItem from '../../funds/graph/fund-item';

function renderGainInfo(gain) {
    if (!gain) {
        return null;
    }

    const formatOptions = { brackets: true, abbreviate: true, precision: 1, noPence: true };
    const formatOptionsPct = { brackets: true, precision: 2 };

    const gainStyle = { backgroundColor: rgba(gain.get('color')) };

    const gainSpanClasses = (spanName, key = spanName) => classNames(spanName, {
        profit: gain.get(key) >= 0,
        loss: gain.get(key) < 0
    });

    const gainOuterClasses = gainSpanClasses('text', 'gain');
    const gainClasses = gainSpanClasses('gain');
    const gainAbsClasses = gainSpanClasses('gain-abs', 'gainAbs');
    const dayGainClasses = gainSpanClasses('day-gain', 'dayGain');
    const dayGainAbsClasses = gainSpanClasses('day-gain-abs', 'dayGainAbs');

    return <span className="gain">
        <span className={gainOuterClasses} style={gainStyle}>
            <span className="value">
                {formatCurrency(gain.get('value'), formatOptions)}
            </span>
            <span className="breakdown">
                <span className={gainAbsClasses}>
                    {formatCurrency(gain.get('gainAbs'), formatOptions)}
                </span>
                <span className={dayGainAbsClasses}>
                    {formatCurrency(gain.get('dayGainAbs'), formatOptions)}
                </span>
                <span className={gainClasses}>
                    {formatPercent(gain.get('gain'), formatOptionsPct)}
                </span>
                <span className={dayGainClasses}>
                    {formatPercent(gain.get('dayGain'), formatOptionsPct)}
                </span>
            </span>
        </span>
    </span>;
}

function ListRowExtraFundsComponent({ row, id, popout }) {
    const itemKey = PAGES.funds.cols.indexOf('item');
    const name = row.getIn(['cols', itemKey])
        .toLowerCase()
        .replace(/\W+/g, '-');

    const gain = row.get('gain');
    const gainInfo = renderGainInfo(gain);

    const className = classNames('fund-extra-info', { popout });

    return <span className={className}>
        <span className="fund-graph">
            <div className="fund-graph-cont">
                <GraphFundItem name={name} id={id} />
            </div>
        </span>
        {gainInfo}
    </span>;
}

ListRowExtraFundsComponent.propTypes = {
    row: PropTypes.instanceOf(map).isRequired,
    id: PropTypes.number.isRequired,
    popout: PropTypes.bool.isRequired
};

export const ListRowExtraFunds = connect(
    (state, { id }) => ({
        row: state.getIn(['pages', 'funds', 'rows', id]),
        popout: Boolean(state.getIn(['pages', 'funds', 'rows', id, 'historyPopout']))
    })
)(ListRowExtraFundsComponent);

export default function ListRowExtra({ page, ...props }) {
    if (page === 'funds') {
        return <ListRowExtraFunds {...props} />;
    }

    return null;
}

ListRowExtra.propTypes = {
    page: PropTypes.string.isRequired
};

