import React from 'react';
import Media from 'react-media';
import { mediaQueryMobile } from '../../constants';

import OverviewTableHeader from './OverviewTableHeader';
import OverviewTableRows from './OverviewTableRows';

export default function OverviewTable(props) {
    const tableRows = isMobile => {
        if (isMobile) {
            return <OverviewTableRows {...props} numToSkip={19} />;
        }

        return <OverviewTableRows {...props} numToSkip={0} />;
    };

    return (
        <div className="table-flex table-insert table-overview noselect">
            <OverviewTableHeader />
            <Media query={mediaQueryMobile}>{tableRows}</Media>
        </div>
    );
}

