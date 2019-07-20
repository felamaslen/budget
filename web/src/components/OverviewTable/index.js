import React from 'react';
import Media from 'react-media';
import { mediaQueryMobile } from '~client/constants';

import OverviewTableHeader from './OverviewTableHeader';
import OverviewTableRows from './OverviewTableRows';

function getNumToSkip(isMobile) {
    if (isMobile) {
        return 19;
    }

    return 0;
}

const OverviewTable = props => (
    <div className="table-flex table-insert table-overview noselect">
        <OverviewTableHeader />
        <Media query={mediaQueryMobile}>
            {isMobile => <OverviewTableRows {...props} numToSkip={getNumToSkip(isMobile)} />}
        </Media>
    </div>
);

export default React.memo(OverviewTable);
