import React from 'react';
import PropTypes from 'prop-types';
import { mediaQueries } from '../../../constants';
import StocksList from '../../stocks-list';
import GraphFunds from '../funds/graph/funds';
import { ListHeadExtraFunds } from './head/extra';
import Media from 'react-media';

export function AfterListFunds({ isMobile }) {
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
        const item = isMobile => <AfterListFunds isMobile={isMobile} {...props} />;

        return <div className="funds-info">
            <Media query={mediaQueries.mobile}>
                {item}
            </Media>
        </div>;
    }

    return null;
}

AfterList.propTypes = {
    page: PropTypes.string.isRequired
};

