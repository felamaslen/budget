import { Map as map } from 'immutable';
import { PAGES } from '~client/constants/data';
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import GraphFundItem from '../GraphFundItem';
import FundGainInfo from '../FundGainInfo';

const itemKey = PAGES.funds.cols.indexOf('item');

export default function ListRowFundsDesktop({ row }) {
    const [popout, setPopout] = useState(false);

    const onToggleGraph = useCallback(() => {
        setPopout(!popout);
    });

    const name = useMemo(
        () => row.getIn(['cols', itemKey])
            .toLowerCase()
            .replace(/\W+/g, '-'),
        [row]
    );

    const sold = row.get('sold');

    const className = classNames('fund-extra-info', { popout });

    return (
        <span className={className}>
            <span className="fund-graph">
                <div className="fund-graph-cont">
                    <GraphFundItem name={name}
                        sold={sold}
                        values={row.get('prices')}
                        popout={popout}
                        onToggle={onToggleGraph}
                    />
                </div>
            </span>
            <FundGainInfo gain={row.get('gain')} sold={sold} />
        </span>
    );
}

ListRowFundsDesktop.propTypes = {
    row: PropTypes.instanceOf(map).isRequired
};

