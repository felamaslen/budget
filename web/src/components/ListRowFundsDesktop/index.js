import { PAGES } from '~client/constants/data';
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { gainShape } from '~client/prop-types/page/funds';
import GraphFundItem from '~client/components/GraphFundItem';
import FundGainInfo from '~client/components/FundGainInfo';

const itemKey = PAGES.funds.cols.indexOf('item');

export default function ListRowFundsDesktop({ row: { cols, sold, prices, gain } }) {
    const [popout, setPopout] = useState(false);

    const onToggleGraph = useCallback(() => {
        setPopout(!popout);
    }, [popout, setPopout]);

    const name = useMemo(() => cols[itemKey].toLowerCase().replace(/\W+/g, '-'), [cols]);

    return (
        <span className={classNames('fund-extra-info', { popout })}>
            <span className="fund-graph">
                <div className="fund-graph-cont">
                    <GraphFundItem name={name}
                        sold={sold}
                        values={prices}
                        popout={popout}
                        onToggle={onToggleGraph}
                    />
                </div>
            </span>
            <FundGainInfo gain={gain} sold={sold} />
        </span>
    );
}

ListRowFundsDesktop.propTypes = {
    row: PropTypes.shape({
        cols: PropTypes.array.isRequired,
        sold: PropTypes.bool.isRequired,
        prices: PropTypes.array.isRequired,
        gain: gainShape.isRequired
    })
};
