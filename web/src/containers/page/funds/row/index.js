import connect, { ListRow } from '../../list/row';

import { PAGES } from '../../../../misc/const';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { rgba } from '../../../../misc/color';
import { formatCurrency, formatPercent } from '../../../../misc/format';

import GraphFundItem from '../graph/fund-item';

const transactionsKey = PAGES.funds.cols.indexOf('transactions');

export class ListRowFunds extends ListRow {
    renderFundGraph() {
        const name = this.props.row.getIn(['cols', 1])
            .toLowerCase()
            .replace(/\W+/g, '-');

        return <span className="fund-graph">
            <div className="fund-graph-cont">
                <GraphFundItem name={name} id={this.props.id} />
            </div>
        </span>;
    }
    renderGainInfo() {
        const gain = this.props.row.get('gain');

        if (!gain) {
            return null;
        }

        const formatOptions = { brackets: true, abbreviate: true, precision: 1, noPence: true };
        const formatOptionsPct = { brackets: true, precision: 2 };

        const gainStyle = {
            backgroundColor: rgba(gain.get('color'))
        };

        const gainSpanClasses = (spanName, key = spanName) => `${spanName} ${classNames({
            profit: gain.get(key) >= 0,
            loss: gain.get(key) < 0
        })}`;

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
    listItemClasses() {
        return { sold: this.props.sold };
    }
    renderListExtra() {
        const graph = this.renderFundGraph();
        const gainInfo = this.renderGainInfo();

        const className = classNames({
            'fund-extra-info': true,
            popout: this.props.popout
        });

        return <span className={className}>{graph}{gainInfo}</span>;
    }
}

ListRowFunds.propTypes = {
    sold: PropTypes.bool.isRequired,
    popout: PropTypes.bool.isRequired
};

const mapStateToProps = () => (state, ownProps) => ({
    sold: state
        .getIn(['pages', 'funds', 'rows', ownProps.id, 'cols', transactionsKey])
        .isSold(),
    popout: Boolean(state.getIn(['pages', 'funds', 'rows', ownProps.id, 'historyPopout']))
});

export default connect('funds')(mapStateToProps)(ListRowFunds);

