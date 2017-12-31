import React from 'react';
import PropTypes from 'prop-types';
import { mediaQueries } from '../../../misc/const';
import StocksList from '../../stocks-list';
import GraphFunds from '../funds/graph/funds';
import { ListHeadExtraFunds } from './head/extra';
import Media from 'react-media';

function AfterListFunds({ isMobile }) {
    if (isMobile) {
        return <ListHeadExtraFunds />;
    }

    return <span className="after-list">
        <StocksList />
        <GraphFunds />
    </span>;
}

AfterListFunds.propTypes = {
    isMobile: PropTypes.bool.isRequired
};

export default function AfterList({ page, ...props }) {
    if (page === 'funds') {
        return <div className="funds-info">
            <Media query={mediaQueries.mobile}>
                {isMobile => <AfterListFunds isMobile={isMobile} {...props} />}
            </Media>
        </div>;
    }

    return null;
}

AfterList.propTypes = {
    page: PropTypes.string.isRequired
};

