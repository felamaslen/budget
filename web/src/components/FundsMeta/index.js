import React from 'react';
import { mediaQueries } from '../../constants';
import Media from 'react-media';
import StocksList from '../../containers/StocksList';
import GraphFunds from '../../containers/GraphFunds';
import ListHeadFundsMobile from '../../containers/ListHeadFundsMobile';

export default function FundsMeta() {
    return (
        <div className="funds-info">
            <Media query={mediaQueries.mobile}>{isMobile => isMobile &&
                <ListHeadFundsMobile /> ||
                <span className="after-list">
                    <StocksList />
                    <GraphFunds />
                </span>
            }</Media>
        </div>
    );
}

