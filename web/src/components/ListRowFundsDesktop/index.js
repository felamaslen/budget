import { Map as map } from 'immutable';
import { PAGES } from '../../constants/data';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import GraphFundItem from '../../containers/GraphFundItem';
import FundGainInfo from '../FundGainInfo';

export default function ListRowFundsDesktop({ row, id }) {
    const itemKey = PAGES.funds.cols.indexOf('item');
    const name = row.getIn(['cols', itemKey])
        .toLowerCase()
        .replace(/\W+/g, '-');

    const popout = Boolean(row.get('historyPopout'));

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
    id: PropTypes.number.isRequired
};

