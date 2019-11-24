import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { gainShape } from '~client/prop-types/page/funds';
import GraphFundItem from '~client/components/GraphFundItem';
import FundGainInfo from '~client/components/FundGainInfo';

import * as Styled from './styles';

export default function ListRowFundsDesktop({ row: { item, sold, prices, gain } }) {
    const [popout, setPopout] = useState(false);
    const onToggleGraph = useCallback(() => {
        setPopout(!popout);
    }, [popout, setPopout]);

    if (!(prices && prices.length)) {
        return null;
    }

    return (
        <Styled.FundExtraInfo popout={popout} sold={sold}>
            <GraphFundItem
                name={item.toLowerCase().replace(/\W+/g, '-')}
                sold={sold}
                values={prices}
                popout={popout}
                onToggle={onToggleGraph}
            />
            <FundGainInfo gain={gain} sold={sold} />
        </Styled.FundExtraInfo>
    );
}

ListRowFundsDesktop.propTypes = {
    row: PropTypes.shape({
        id: PropTypes.string.isRequired,
        item: PropTypes.string.isRequired,
        sold: PropTypes.bool.isRequired,
        prices: PropTypes.array,
        gain: gainShape.isRequired,
    }),
};
