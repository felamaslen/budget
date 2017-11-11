import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueries } from '../../../../misc/const';

import Header from './header';
import Rows from './rows';

export default function OverviewTable({ pageIndex }) {
    const rows = isMobile => {
        if (isMobile) {
            return <Rows pageIndex={pageIndex} numToSkip={19} />;
        }

        return <Rows pageIndex={pageIndex} numToSkip={0} />;
    };

    return <div className="table-flex table-insert table-overview noselect">
        <Header />
        <Media query={mediaQueries.mobile}>{rows}</Media>
    </div>;
}

OverviewTable.propTypes = {
    pageIndex: PropTypes.number.isRequired
};

