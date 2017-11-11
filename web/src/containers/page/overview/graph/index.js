import React from 'react';
import Media from 'react-media';

import { mediaQueries } from '../../../../misc/const';

import GraphBalance from './balance';
import GraphSpending from './spending';

export default function OverviewGraphs() {
    const graphSpending = render => {
        if (render) {
            return <GraphSpending name="spend" />;
        }

        return null;
    };

    return <div className="graph-container-outer">
        <GraphBalance name="balance" />
        <Media query={mediaQueries.desktop}>{graphSpending}</Media>
    </div>;
}

