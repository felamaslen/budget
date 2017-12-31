import React from 'react';
import Media from 'react-media';
import { mediaQueries } from '../../../../misc/const';

import Header from './header';
import Rows from './rows';

export default function OverviewTable() {
    const rows = isMobile => {
        if (isMobile) {
            return <Rows numToSkip={19} />;
        }

        return <Rows numToSkip={0} />;
    };

    return <div className="table-flex table-insert table-overview noselect">
        <Header />
        <Media query={mediaQueries.mobile}>{rows}</Media>
    </div>;
}

