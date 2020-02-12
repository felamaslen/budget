import React from 'react';

import { Size } from '~client/types/graph';
import * as Styled from './styles';

export type GraphRef = React.MutableRefObject<HTMLElement | undefined>;

export type GraphProps = {
    graphRef?: GraphRef;
    outerProperties?: object;
    svgProperties?: object;
    before?: React.FC;
    after?: React.FC;
};

export type Props = Size & GraphProps;

export const Graph: React.FC<Props> = ({
    width,
    height,
    graphRef,
    svgProperties,
    outerProperties,
    before: Before = null,
    after: After = null,
    children,
}) => (
    <Styled.Graph ref={graphRef} {...outerProperties} width={width} height={height}>
        {Before && <Before />}
        <svg width={width} height={height} {...svgProperties}>
            {children}
        </svg>
        {After && <After />}
    </Styled.Graph>
);
