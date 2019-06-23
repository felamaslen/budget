import React from 'react';
import { mediaQueryMobile } from '~client/constants';
import Media from 'react-media';
import StocksList from '~client/containers/StocksList';
import GraphFunds from '~client/containers/GraphFunds';
import ListHeadFundsMobile from '~client/containers/ListHeadFundsMobile';

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
