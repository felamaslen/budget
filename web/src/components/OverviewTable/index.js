import React from 'react';
import Media from 'react-media';
import { mediaQueryMobile } from '~client/constants';

import OverviewTableHeader from './OverviewTableHeader';
import OverviewTableRows from './OverviewTableRows';

import * as Styled from './styles';

function getNumToSkip(isMobile) {
    if (isMobile) {
        return 19;
    }

    return 0;
}

const OverviewTable = props => (
    <Styled.OverviewTable className="table-flex table-insert table-overview">
        <OverviewTableHeader />
        <Media query={mediaQueryMobile}>
            {isMobile => (
                <OverviewTableRows
                    {...props}
                    numToSkip={getNumToSkip(isMobile)}
                />
            )}
        </Media>
    </Styled.OverviewTable>
);

export default React.memo(OverviewTable);
