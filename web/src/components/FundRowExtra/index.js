import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import GraphFundItem from '

export default function FundRowExtra({ row, id, popout }) {
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

FundRowExtra.propTypes = {
    row: PropTypes.instanceOf(map).isRequired,
    id: PropTypes.number.isRequired,
    popout: PropTypes.bool.isRequired
};

