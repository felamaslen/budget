import headContainer, { Head } from './Head';

import React from 'react';

export class HeadMobile extends Head {
    render() {
        const columns = ['date', 'item', 'cost'];

        const headMain = super.renderListHeadMain(columns);

        return <div className="list-head noselect">
            {headMain}
        </div>;
    }
}

export const HeadMobileContainer = pageIndex => headContainer(pageIndex)()(HeadMobile);

