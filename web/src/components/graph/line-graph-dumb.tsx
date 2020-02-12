import React, { useMemo } from 'react';
import { Graph, GraphProps } from '~client/components/graph';
import { RenderedLine } from '~client/components/graph/rendered-line';
import { HighlightPoint } from '~client/components/HighlightPoint';
import { Dimensions, Calc, BasicProps, Line } from '~client/types/graph';
import { HoverEffect, HLPoint } from '~client/components/graph/hooks/hover';

function useBeforeAfter(
    component: React.FC<BasicProps> | undefined,
    basicProps: BasicProps,
): React.ReactElement | null {
    return useMemo(() => (component ? component(basicProps) : null), [component, basicProps]);
}

export type Props = GraphProps & {
    name: string;
    dimensions: Dimensions;
    calc: Calc;
    lines: Line[];
    hlPoint?: HLPoint;
    beforeLines?: React.FC<BasicProps>;
    afterLines?: React.FC<BasicProps>;
    hoverEffect?: HoverEffect;
};

export const LineGraphDumb: React.FC<Props> = ({
    name,
    before,
    after,
    dimensions,
    calc,
    lines,
    hlPoint,
    beforeLines,
    afterLines,
    graphRef,
    outerProperties,
    svgProperties,
    hoverEffect,
}) => {
    const basicProps = useMemo<BasicProps>(
        () => ({
            ...dimensions,
            ...calc,
        }),
        [dimensions, calc],
    );

    const graphProps = {
        name,
        before,
        after,
        graphRef,
        outerProperties,
        svgProperties,
        ...basicProps,
    };

    const renderedLines = useMemo(
        () =>
            lines.map(({ key, ...line }) => (
                <RenderedLine key={key} line={line} {...dimensions} {...calc} />
            )),
        [dimensions, lines, calc],
    );

    const beforeLinesProc = useBeforeAfter(beforeLines, basicProps);
    const afterLinesProc = useBeforeAfter(afterLines, basicProps);

    if (!lines.length) {
        return <Graph {...graphProps} />;
    }

    return (
        <Graph {...graphProps}>
            {beforeLinesProc}
            {renderedLines}
            {afterLinesProc}
            {hoverEffect && (
                <HighlightPoint
                    pixX={calc.pixX}
                    pixY1={calc.pixY1}
                    minY={dimensions.minY}
                    maxY={dimensions.maxY}
                    width={dimensions.width}
                    height={dimensions.height}
                    hlPoint={hlPoint}
                    hoverEffect={hoverEffect}
                />
            )}
        </Graph>
    );
};
