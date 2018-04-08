import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { PAGES } from '../../constants/data';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import GraphFundItem from '../GraphFundItem';
import FundGainInfo from '../../components/FundGainInfo';

function ListRowFundsDesktop({ row, id, popout }) {
    const itemKey = PAGES.funds.cols.indexOf('item');
    const name = row.getIn(['cols', itemKey])
        .toLowerCase()
        .replace(/\W+/g, '-');

    const className = classNames('fund-extra-info', { popout });

    return (
        <span className={className}>
            <span className="fund-graph">
                <div className="fund-graph-cont">
                    <GraphFundItem name={name} id={id} />
                </div>
            </span>
            <FundGainInfo gain={row.get('gain')} />
        </span>
    );
}

ListRowFundsDesktop.propTypes = {
    row: PropTypes.instanceOf(map).isRequired,
    id: PropTypes.number.isRequired,
    popout: PropTypes.bool.isRequired
};

const mapStateToProps = (state, { id }) => ({
    popout: Boolean(state.getIn(['pages', 'funds', 'rows', id, 'historyPopout']))
});

export default connect(mapStateToProps)(ListRowFundsDesktop);

