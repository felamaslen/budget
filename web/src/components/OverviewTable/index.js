import React from 'react';
import Media from 'react-media';
import { mediaQueryMobile } from '~client/constants';

import OverviewTableHeader from './OverviewTableHeader';
import OverviewTableRows from './OverviewTableRows';

import * as Styled from './styles';

const OverviewTable = props => (
    <Styled.OverviewTable>
        <OverviewTableHeader />
        <Media query={mediaQueryMobile}>
            {isMobile => (
                <OverviewTableRows {...props} numToSkip={isMobile ? 19 : 0} />
            )}
        </Media>
    </Styled.OverviewTable>
);

export default React.memo(OverviewTable);
