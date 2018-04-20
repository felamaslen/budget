import React from 'react';
import { mediaQueryMobile } from '../../constants';
import Media from 'react-media';
import StocksList from '../../containers/StocksList';
import GraphFunds from '../../containers/GraphFunds';
import ListHeadFundsMobile from '../../containers/ListHeadFundsMobile';

export default function FundsMeta() {
    return (
        <div className="funds-info">
            <Media query={mediaQueryMobile}>{isMobile => isMobile &&
                <ListHeadFundsMobile /> ||
                <div className="after-list">
                    <StocksList />
                    <GraphFunds />
                </div>
            }</Media>
        </div>
    );
}

