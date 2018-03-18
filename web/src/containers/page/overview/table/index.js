import React from 'react';
import Media from 'react-media';
import { mediaQueries } from '../../../../misc/const';

import Header from './header';
import Rows from './rows';

export default function OverviewTable(props) {
    const tableRows = isMobile => {
        if (isMobile) {
            return <Rows {...props} numToSkip={19} />;
        }

        return <Rows {...props} numToSkip={0} />;
    };

    return <div className="table-flex table-insert table-overview noselect">
        <Header />
        <Media query={mediaQueries.mobile}>{tableRows}</Media>
    </div>;
}

