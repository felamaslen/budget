import React from 'react';
import { FONT_GRAPH_TITLE } from '~client/constants/graph';
import { COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_DARK } from '~client/constants/colors';
import { rgba } from '~client/modules/color';
import { HoverEffect, HLPoint } from '~client/components/graph/hooks/hover';
import { RangeY, PixPrimary, Size } from '~client/types/graph';

type LabelPosX = {
    anchorLabelX: 'start' | 'end' | 'middle';
    labelPosX: number;
    rectPosX: number;
};

type LabelPosY = {
    labelPosY: number;
    rectPosY: number;
};

function getLabelPosX(posX: number, width: number, labelWidthX: number): LabelPosX {
    let anchorLabelX: 'start' | 'end' | 'middle' = 'middle';
    let labelPosX = posX;
    let rectPosX = posX - labelWidthX / 2;

    if (posX >= width - labelWidthX / 2) {
        anchorLabelX = 'end';
        labelPosX = width;
        rectPosX = width - labelWidthX;
    } else if (posX < labelWidthX / 2) {
        anchorLabelX = 'start';
        labelPosX = 0;
        rectPosX = 0;
    }

    return { anchorLabelX, labelPosX, rectPosX };
}

function getLabelPosY(posY: number, height: number, labelHeight: number): LabelPosY {
    let labelPosY = posY;
    let rectPosY = labelPosY - labelHeight / 2;

    if (posY >= height - labelHeight / 2) {
        labelPosY = height - labelHeight / 2 + 2;
        rectPosY = height - labelHeight;
    } else if (posY < labelHeight / 2) {
        labelPosY = labelHeight / 2;
        rectPosY = 0;
    }

    return { labelPosY, rectPosY };
}

type Props = {
    hoverEffect: HoverEffect;
    hlPoint?: HLPoint;
} & RangeY &
    PixPrimary &
    Size;

type TextProps = {
    x: number;
    y: number;
    textAnchor: 'start' | 'end' | 'middle';
    alignmentBaseline: 'middle' | 'baseline';
};

export const HighlightPoint: React.FC<Props> = ({
    pixX,
    pixY1,
    minY,
    maxY,
    width,
    height,
    hoverEffect,
    hlPoint,
}) => {
    if (!(hlPoint && maxY !== minY)) {
        return null;
    }

    const labelWidthX = hoverEffect.labelWidthX || 88;
    const labelWidthY = hoverEffect.labelWidthY || 50;

    const [fontSize, fontFamily] = FONT_GRAPH_TITLE;
    const labelHeight = fontSize + 2;

    const { valX, valY, color } = hlPoint;

    const posX = Math.floor(pixX(valX)) + 0.5;
    const posY = Math.floor(pixY1(valY)) + 0.5;

    const { anchorLabelX, labelPosX, rectPosX } = getLabelPosX(posX, width, labelWidthX);
    const { labelPosY, rectPosY } = getLabelPosY(posY, height, labelHeight);

    const labelTextX = hoverEffect.labelX(valX);
    const labelTextY = hoverEffect.labelY(valY);

    const pathVertical = `M${posX},0 L${posX},${height}`;
    const pathHorizontal = `M0,${posY} L${width},${posY}`;

    const lineProps = { stroke: color, strokeDasharray: '3,2' };

    const textProps = { fontSize, fontFamily, color: rgba(COLOR_GRAPH_TITLE) };
    const textPropsX: TextProps = {
        x: labelPosX,
        y: height - 2,
        textAnchor: anchorLabelX,
        alignmentBaseline: 'baseline',
    };
    const textPropsY: TextProps = {
        x: width,
        y: labelPosY,
        textAnchor: 'end',
        alignmentBaseline: 'middle',
    };

    return (
        <g>
            <path d={pathVertical} {...lineProps} />
            <path d={pathHorizontal} {...lineProps} />
            <rect
                x={rectPosX}
                y={height - labelHeight}
                width={labelWidthX}
                height={labelHeight}
                fill={rgba(COLOR_TRANSLUCENT_DARK)}
            />
            <text {...textProps} {...textPropsX}>
                {labelTextX}
            </text>
            <rect
                x={width - labelWidthY}
                y={rectPosY}
                width={labelWidthY}
                height={labelHeight}
                fill={rgba(COLOR_TRANSLUCENT_DARK)}
            />
            <text {...textProps} {...textPropsY}>
                {labelTextY}
            </text>
        </g>
    );
};
